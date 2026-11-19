# Token & Embedding Workbench Engine & UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Token & Embedding Workbench in `index.html` with an active BPE subword encoder, a calibrated 4D semantic embedding engine with morphological decomposition for arbitrary user inputs, a dual-metric similarity analysis suite, an upgraded 3D canvas with semantic axes and token bond arcs, and a sticky-rail studio UI with collapsible stage cards.

**Architecture:** Pure vanilla JavaScript, HTML5 Canvas, and modern CSS in a self-contained, standalone web application. Algorithmic components (BPE encoder, semantic vector engine, similarity calculator) are decoupled into clean functions with verification tests executable via Node.js before integration into `index.html`.

**Tech Stack:** Vanilla JavaScript (ES2022+), HTML5 Canvas 2D context for 3D projection, CSS3 custom properties & flex/grid, Node.js for automated test verification.

**Spec:** [docs/superpowers/specs/2026-11-19-ui-overhaul-design.md](file:///Users/ayu/Desktop/LLM%20Pipeline/docs/superpowers/specs/2026-11-19-ui-overhaul-design.md)

## Global Constraints

- Standalone Single-File Delivery: The end product must remain completely self-contained in `index.html` with zero external build tools, CDNs, or runtime dependencies.
- Preservation of Core IDs & Handlers: Existing essential DOM element IDs (`bpe-input`, `bpe-step-slider`, `bpe-play`, `alignment-matrix`, `canvas-3d`, `custom-3d-form`, etc.) must remain functional so presets and demonstrations work seamlessly.
- Responsive Resilience: Layout must maintain equal edges and full functionality at 1440px, 1024px, 768px, and 390px viewports without horizontal bleed.
- Explainable Dimensions: Semantic axes must represent real, interpretable dimensions ($X$: Concrete/Physical $\leftrightarrow$ Abstract/Tech, $Y$: Nature/Bio $\leftrightarrow$ Machine/Digital, $Z$: Negative $\leftrightarrow$ Positive Sentiment).

## Review Focus

- Arbitrary out-of-vocabulary user input in Sentence A/B produces meaningful semantic coordinates rather than random hashing or zero vectors.
- BPE subword tokens actually flow into the Embedder and Similarity calculations rather than whole-word regex splitting.
- Short sentences and single-token inputs do not divide by zero or cause `NaN` coordinates in centroid or cosine math.
- The 3D Maximize toggle smoothly resizes the canvas buffer without distortion, blurring, or lost camera orientation.
- The sticky stepper rail accurately syncs with scroll position and expands collapsed cards when jumped to.

---

### Task 1: Active BPE Subword Tokenizer Engine & Verification

**Files:**
- Create: `tests/test_tokenizer.js`
- Modify: `index.html` (BPE simulation and tokenization routines)

**Interfaces:**
- Consumes: Raw text string, max merges count
- Produces: `runBPESimulation(rawText, maxMerges)`, `encodeBPE(text, vocabMap, mergeRules)` returning `{ tokens: Array<{ token: string, id: number, isBase: boolean }>, tokenCount: number }`

- [ ] **Step 1: Write the failing test for active BPE encoder**

Create `tests/test_tokenizer.js`:
```javascript
const assert = require('assert');
// Test BPE simulation and encoding
const { runBPESimulation, encodeBPE } = require('./tokenizer_core.js');

const corpus = "The happy cat sat on the warm mat. A joyful kitten rested on the soft rug.";
const bpeResult = runBPESimulation(corpus, 32);

assert(bpeResult.steps.length > 1, "BPE simulation must produce merge steps");
const finalStep = bpeResult.steps[bpeResult.steps.length - 1];

// Encode test sentence using final trained vocabulary and merges
const encoded = encodeBPE("The happy cat sat on the warm mat", finalStep.vocabMap, bpeResult.mergeRules);
assert(encoded.tokens.length > 0, "Encoded tokens must not be empty");
assert(encoded.tokens.some(t => t.token.includes('cat') || t.token.includes('mat')), "Tokens should preserve vocabulary merges");

console.log("PASS: BPE active encoder verified with " + encoded.tokens.length + " tokens");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_tokenizer.js`  
Expected: FAIL (cannot find `./tokenizer_core.js`)

- [ ] **Step 3: Implement modular BPE engine and active encoder**

Create `tests/tokenizer_core.js` containing the extracted, robust BPE training and `encodeBPE` algorithm, handling word boundaries (`▁`), punctuation, base character decomposition, and greedy merge rule application.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_tokenizer.js`  
Expected: PASS with "PASS: BPE active encoder verified..."

- [ ] **Step 5: Integrate active BPE encoder into `index.html`**

Update the script in `index.html` so `state.bpeResult` stores `mergeRules` and `vocabMap`, and update `tokenizeSentenceForSemantics(sentence)` to use `encodeBPE` using the current active BPE step vocabulary.

---

### Task 2: Calibrated Semantic Embeddings & Morphological Decomposition Engine

**Files:**
- Create: `tests/test_embedder.js`
- Modify: `index.html` (Lexicon, morphological parser, and embedToken)

**Interfaces:**
- Consumes: Raw token string (from BPE subword or user text)
- Produces: `embedToken(rawToken)` returning `{ token: string, clean: string, x: number, y: number, z: number, w: number, norm: number, category: string, isStopword: boolean, dimensions: Object }`

- [ ] **Step 1: Write the failing test for semantic embedder**

Create `tests/test_embedder.js`:
```javascript
const assert = require('assert');
const { embedToken, cosineSim3D } = require('./embedder_core.js');

// 1. Synonyms must have high cosine similarity (> 0.70)
const cat = embedToken("cat");
const kitten = embedToken("kitten");
const simCatKitten = cosineSim3D(cat, kitten);
assert(simCatKitten > 0.75, `Expected cat/kitten similarity > 0.75, got ${simCatKitten}`);

// 2. Opposites / distinct domains must have low similarity (< 0.35)
const server = embedToken("server");
const simCatServer = cosineSim3D(cat, server);
assert(simCatServer < 0.40, `Expected cat/server similarity < 0.40, got ${simCatServer}`);

// 3. Out-of-vocabulary user word with affixes must be meaningfully embedded
const joyful = embedToken("joyful");
const joyfulness = embedToken("joyfulness");
assert(cosineSim3D(joyful, joyfulness) > 0.80, "Morphological variant must be close to root");

console.log("PASS: Calibrated semantic embedder verified");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_embedder.js`  
Expected: FAIL (cannot find `./embedder_core.js`)

- [ ] **Step 3: Implement calibrated lexicon and morphological parser in `tests/embedder_core.js`**

Implement:
1. Curated 450+ word anchor lexicon with verified coordinates across $X$ (Concrete vs Tech), $Y$ (Nature vs Digital), $Z$ (Sentiment), and $W$ (Dynamism).
2. `morphologicalEmbed(cleanToken)`: handles arbitrary user inputs via prefix stripping (`un-`, `re-`, `anti-`, `super-`, `cyber-`), suffix stripping (`-ful`, `-less`, `-ing`, `-tion`, `-ness`, `-ment`), root anchor matching, and subword vector composition.
3. Replace pseudo-random N-gram hashing with semantic root projection.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_embedder.js`  
Expected: PASS with "PASS: Calibrated semantic embedder verified"

- [ ] **Step 5: Integrate calibrated embedder into `index.html`**

Replace `LEXICON` and `embedToken` in `index.html` with the new calibrated engine and morphological fallback.

---

### Task 3: Enhanced Semantic Similarity Suite (Dual-Metrics & Interactive Alignment)

**Files:**
- Create: `tests/test_similarity.js`
- Modify: `index.html` (computeComparison, renderComparisonStage, and alignment matrix)

**Interfaces:**
- Consumes: `textA: string`, `textB: string`
- Produces: `computeComparison(textA, textB)` returning `{ toksA, toksB, centroidA, centroidB, cosCentroid, softAlignment, compositeScore, verdict, topPairs, matrix }`

- [ ] **Step 1: Write failing test for similarity calculations**

Create `tests/test_similarity.js`:
```javascript
const assert = require('assert');
const { computeComparison } = require('./similarity_core.js');

const resSame = computeComparison("The happy cat sat on the warm mat", "A joyful kitten rested on the soft rug");
assert(resSame.compositeScore > 0.65, `Expected paraphrase composite score > 0.65, got ${resSame.compositeScore}`);
assert(resSame.topPairs.length > 0, "Top aligned token pairs must be generated");
assert(resSame.topPairs[0].score >= 0.70, "Best alignment should have high similarity");

const resDiff = computeComparison("The happy cat sat on the warm mat", "The server crashed with critical database errors");
assert(resDiff.compositeScore < 0.40, `Expected distinct topics composite score < 0.40, got ${resDiff.compositeScore}`);

console.log("PASS: Similarity suite dual-metrics verified");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_similarity.js`  
Expected: FAIL (cannot find `./similarity_core.js`)

- [ ] **Step 3: Implement dual-metric similarity engine in `tests/similarity_core.js`**

Implement:
1. Centroid Cosine Similarity with IDF/stopword discounting.
2. Soft Token Alignment (Word Mover's style maximum-affinity pooling).
3. Composite similarity score and categorical verdict strings (*Semantic Paraphrase*, *Strong Domain Overlap*, *Moderate Topical Relation*, *Contrasting/Orthogonal*).
4. Top 5 token pairs extraction sorted by cosine score.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_similarity.js`  
Expected: PASS with "PASS: Similarity suite dual-metrics verified"

- [ ] **Step 5: Integrate similarity engine and UI in `index.html`**

Update `computeComparison` and `renderComparisonStage` in `index.html`:
- Display the composite score and categorical verdict badge.
- Render the Top Token Alignments card list (e.g. `cat` ↔ `kitten` [0.94]).
- Upgrade the interactive alignment matrix with cell hover highlighting in 3D.

---

### Task 4: Interactive 3D Canvas Semantic Axes, Bonds & Maximize Mode

**Files:**
- Modify: `index.html` (3D scene builder, canvas renderer, HTML structure for Maximize button)

**Interfaces:**
- Consumes: Scene data from comparison and embedder, link threshold slider, cluster cohesion slider
- Produces: 3D projected vectors, semantic axis lines with endcap labels, dynamic token similarity bond lines, and responsive canvas sizing

- [ ] **Step 1: Add 3D semantic axes and bond line rendering in `renderCanvasFrame()`**

Add visual 3D axes ($X$: Red/Blue for Concrete $\leftrightarrow$ Tech, $Y$: Green for Nature $\leftrightarrow$ Digital, $Z$: Indigo for Sentiment) with projected text labels, and render dashed or glowing bond lines between Sentence A and Sentence B tokens that exceed the minimum link threshold.

- [ ] **Step 2: Implement "Maximize 3D" toggle button and handler**

Add a maximize toggle button in `.viz-topbar` that toggles `.visualizer-column.maximized` (expanding the column to 75% or 100% width on desktop). Add a window/canvas resize listener that immediately updates canvas buffer dimensions (`canvas.width = rect.width * dpr`) to ensure crisp rendering without distortion.

- [ ] **Step 3: Upgrade floating HUD node inspector**

Refactor `#selected-node-inspector` to display token name, cluster tag, exact 3D coordinates $(x, y, z)$, norm, and nearest semantic neighbors when clicked or hovered.

- [ ] **Step 4: Test 3D canvas interaction and resize in headless Chrome**

Run headless check to verify canvas renders without errors.

---

### Task 5: Studio UI System & Navigation Overhaul (Approach 2 & Taste Standards)

**Files:**
- Modify: `index.html` (CSS styles, header layout, accordion structure, sticky stepper rail)

**Interfaces:**
- Consumes: Stage cards DOM, scroll events, scenario presets
- Produces: Sticky stepper rail with scroll spy, collapsible accordion stage cards with persistent header summary badges, and refined typography

- [ ] **Step 1: Implement Sticky Pipeline Stepper Rail**

Insert the sticky pipeline stepper bar with 4 step pills:
`[1. Tokenization]` → `[2. Embeddings]` → `[3. Similarity]` → `[4. 3D Space]`.
Add click handlers to smoothly scroll to and auto-expand each stage. Wire an `IntersectionObserver` or scroll listener to highlight the active stage pill.

- [ ] **Step 2: Implement Collapsible Accordion Stage Cards with Live Summary Badges**

Refactor the stage headers into accessible accordion toggles:
- Chevron expand/collapse icon.
- Header summary chip container that updates dynamically:
  - Stage 1: `Tokens: N · Vocab: M · Ratio: X.XX×`
  - Stage 2: `Active Tokens: K · 4D Space`
  - Stage 3: `Cosine: 0.XX · Verdict: [Text]`
Add global `Expand All` and `Collapse All` buttons in the topbar.

- [ ] **Step 3: Polish Typography, Sliders, and Anti-Slop Design System**

Update CSS:
- Clean slate palette (`#f8fafc`, `#ffffff`, `#e2e8f0`, `#0f172a`).
- Cohesive stage accents (Amber for BPE, Teal for Embeddings, Coral for Similarity, Cobalt for 3D Space).
- Custom styled dual-color range sliders and toggle chips.
- Monospaced figures for all matrices and coordinates.
- Smooth 150ms transitions and 2px hover lifts.

---

### Task 6: End-to-End Verification & User Testing

**Files:**
- Modify: `index.html` (any bug fixes from verification)
- Create: `tests/verify_workbench.js`

- [ ] **Step 1: Write automated end-to-end regression check script**

Verify all presets load without error, live user inputs in Sentence A and B trigger live tokenization and similarity updates, and no `NaN` values occur across any stage.

- [ ] **Step 2: Run verification script**

Run: `node tests/verify_workbench.js`  
Expected: PASS

- [ ] **Step 3: Visual and responsive verification**

Verify rendering at 1440px, 1024px, and 390px. Confirm that collapsible cards, 3D maximize toggle, similarity heatmap, and BPE playback function smoothly.
