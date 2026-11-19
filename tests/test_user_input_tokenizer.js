const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, "Script tag must exist in index.html");
const scriptCode = scriptMatch[1];

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
      appendChild: () => {},
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

// Populate test defaults
getMockElement('bpe-corpus-input').value = "Neural networks and deep learning models process natural language sequences.";
getMockElement('sentence-a-input').value = "Deep learning models process text";
getMockElement('sentence-b-input').value = "Neural networks analyze language";
getMockElement('bpe-test-input').value = "deep learning networks";
getMockElement('embed-probe-input').value = "neural";
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
  clearTimeout: () => {},
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
vm.runInContext(scriptCode, mockContext);

const { runBPESimulation, encodeBPE, runFullPipeline } = vm.runInContext(
  '({ runBPESimulation, encodeBPE, runFullPipeline })',
  mockContext
);

// 1. Verify custom user corpus builds valid BPE
const customCorpus = "Quantum computing algorithms simulate molecular structures";
const customBPE = runBPESimulation(customCorpus, 25);
assert(customBPE.steps.length > 0, "Custom corpus must produce BPE steps");
assert(customBPE.mergeRules.length > 0, "Custom corpus must produce merge rules");
console.log("PASS 1: Custom user corpus builds valid BPE merges (" + customBPE.mergeRules.length + " rules)");

// 2. Verify tokenization does not contain orphan '▁' tokens
const testSentence = "Quantum computing structures";
const finalStep = customBPE.steps[customBPE.steps.length - 1];
const enc = encodeBPE(testSentence, finalStep.vocabMap, customBPE.mergeRules);

for (const tok of enc.tokens) {
  assert(tok.clean !== '▁', "No token should have clean value equal to '▁'");
  assert(tok.clean.length > 0, "Token clean value must not be empty string");
}
console.log("PASS 2: Test input tokenization produced clean subwords without phantom '▁' tokens");

// 3. Verify empty input handling
const emptyBPE = runBPESimulation("", 20);
assert(emptyBPE.steps.length === 1, "Empty input should return graceful step 0");
assert.doesNotThrow(() => {
  getMockElement('bpe-corpus-input').value = "";
  runFullPipeline({ resetStepToMax: true });
}, "runFullPipeline must not throw on empty corpus input");
console.log("PASS 3: Empty user input handled gracefully without exceptions");

// 4. Verify user input is not overwritten in textarea
const userTypedText = "Specialized tokenizer vocabulary test input";
getMockElement('bpe-corpus-input').value = userTypedText;
runFullPipeline({ resetStepToMax: true });
assert.strictEqual(
  getMockElement('bpe-corpus-input').value,
  userTypedText,
  "User typed corpus in textarea must NOT be overwritten or corrupted"
);
console.log("PASS 4: User textarea content preserved exactly as typed");

console.log("ALL USER INPUT TOKENIZER TESTS PASSED!");
