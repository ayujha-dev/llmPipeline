// tests/test_runtime_e2e.js - End-to-end algorithmic and preset validation

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Extract script content
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, "Script tag must exist in index.html");
const scriptCode = scriptMatch[1];

// Create mock browser DOM environment
const mockElements = new Map();
function getMockElement(id) {
  if (!mockElements.has(id)) {
    mockElements.set(id, {
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      },
      addEventListener: () => {},
      appendChild: (child) => {},
      setAttribute: () => {},
      getAttribute: () => '',
      closest: () => getMockElement(id + '_parent'),
      getBoundingClientRect: () => ({ width: 800, height: 500, top: 0, left: 0 }),
      getContext: () => ({
        clearRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {},
        arc: () => {},
        closePath: () => {},
        fillText: () => {},
        setLineDash: () => {},
        scale: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} })
      })
    });
  }
  return mockElements.get(id);
}

// Pre-populate expected input values
getMockElement('bpe-corpus-input').value = "The happy cat sat on the warm mat. A joyful kitten rested on the soft rug.";
getMockElement('sentence-a-input').value = "The happy cat sat on the warm mat";
getMockElement('sentence-b-input').value = "A joyful kitten rested on the soft rug";
getMockElement('bpe-test-input').value = "The happy cat sat on the warm mat";
getMockElement('embed-probe-input').value = "kitten";
getMockElement('sync-sentences-to-corpus').checked = true;
getMockElement('cohesion-slider').value = "1.0";
getMockElement('threshold-slider').value = "0.65";
getMockElement('bpe-step-slider').value = "24";

const mockContext = {
  console,
  Math,
  Set,
  Map,
  Array,
  Object,
  Number,
  String,
  parseInt,
  parseFloat,
  requestAnimationFrame: () => {},
  clearInterval: () => {},
  setInterval: () => {},
  setTimeout: (fn) => fn(),
  window: {
    devicePixelRatio: 1,
    addEventListener: () => {},
    scrollY: 0
  },
  document: {
    getElementById: (id) => getMockElement(id),
    querySelectorAll: (selector) => [],
    createElement: (tag) => ({
      tagName: tag,
      innerHTML: '',
      textContent: '',
      style: {},
      className: '',
      appendChild: () => {},
      addEventListener: () => {}
    })
  }
};

vm.createContext(mockContext);

// Run script in mock sandbox
try {
  vm.runInContext(scriptCode, mockContext);
  console.log("PASS: Script parsed and evaluated without syntax errors");
} catch (e) {
  console.error("FAIL: Error evaluating script", e);
  process.exit(1);
}

// Test core routines directly from context
const {
  runBPESimulation,
  encodeBPE,
  embedToken,
  morphologicalEmbed,
  computeComparison,
  cosineSim3D,
  PRESETS
} = vm.runInContext('({ runBPESimulation, encodeBPE, embedToken, morphologicalEmbed, computeComparison, cosineSim3D, PRESETS })', mockContext);

// 1. Verify Presets Execution
for (const [key, p] of Object.entries(PRESETS)) {
  const bpe = runBPESimulation(p.corpus, 20);
  assert(bpe.steps.length > 0, `BPE simulation failed for preset: ${key}`);
  const finalStep = bpe.steps[bpe.steps.length - 1];
  const comp = computeComparison(p.sentA, p.sentB, finalStep.vocabMap, bpe.mergeRules);

  assert(!isNaN(comp.compositeScore), `Composite score is NaN for preset: ${key}`);
  assert(!isNaN(comp.cosCentroid), `Centroid cosine is NaN for preset: ${key}`);
  assert(!isNaN(comp.softAlignment), `Soft alignment is NaN for preset: ${key}`);
  assert(comp.verdict && comp.verdict.label, `Verdict missing for preset: ${key}`);
  console.log(`PASS: Preset [${key}] validated: Composite Score = ${(comp.compositeScore * 100).toFixed(1)}% (${comp.verdict.tag})`);
}

// 2. Verify Arbitrary and Edge-Case Inputs (Morphological & Subword fallback)
const edgeWords = ["unhappiness", "cybersecurity", "quantumcomputing", "supercluster", "abcdefg", "xyz", "a", "123"];
for (const w of edgeWords) {
  const emb = embedToken(w);
  assert(!isNaN(emb.x) && !isNaN(emb.y) && !isNaN(emb.z) && !isNaN(emb.norm), `Token embedding produced NaN for "${w}"`);
  assert(emb.norm > 0, `Norm must be positive for "${w}"`);
}
console.log("PASS: All out-of-vocabulary morphological edge-cases validated without NaN or zero division");

// 3. Verify Extreme & Single-Token Comparison
const compSingle = computeComparison("cat", "cat");
assert(compSingle.compositeScore > 0.85, "Identical single words must have high similarity");

const compDisjoint = computeComparison("server database error", "kitten puppy joy");
assert(compDisjoint.compositeScore < 0.40, "Disjoint domains must have low similarity");

console.log("PASS: End-to-end algorithmic test suite successfully completed!");
