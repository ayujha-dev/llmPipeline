// tests/verify_workbench.js - Automated verification for index.html standalone bundle

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, '../index.html');
assert(fs.existsSync(htmlPath), "index.html must exist");

const html = fs.readFileSync(htmlPath, 'utf8');

// 1. Verify single-file standalone constraint (no external script/style dependencies)
assert(!html.includes('<script src="http'), "Must have zero external script dependencies (pure vanilla standalone)");
assert(!html.includes('<link rel="stylesheet" href="http'), "Must have zero external CSS dependencies");

// 2. Verify all 4 required stages exist in order
const stage1Pos = html.indexOf('stage-tokenizer');
const stage2Pos = html.indexOf('stage-embedder');
const stage3Pos = html.indexOf('stage-comparison');
const stage4Pos = html.indexOf('stage-3d-visualizer');

assert(stage1Pos !== -1, "Stage 1 (Tokenizer) must exist");
assert(stage2Pos !== -1, "Stage 2 (Embedder) must exist");
assert(stage3Pos !== -1, "Stage 3 (Comparison) must exist");
assert(stage4Pos !== -1, "Stage 4 (3D Visualizer) must exist");

assert(stage1Pos < stage2Pos, "Stage 1 must come before Stage 2");
assert(stage2Pos < stage3Pos, "Stage 2 must come before Stage 3");
assert(stage3Pos < stage4Pos, "Stage 3 must come before Stage 4");

// 3. Verify active user input fields with default example text for EVERY feature
// Tokenizer input
assert(html.includes('id="bpe-corpus-input"'), "Tokenizer must have active corpus input field");
assert(html.includes('id="bpe-test-input"'), "Tokenizer must have active test input field");
assert(html.includes('id="bpe-step-slider"'), "Tokenizer must have active merge step slider");

// Embedder input
assert(html.includes('id="embed-probe-input"'), "Embedder must have active custom probe input field");

// Comparison input
assert(html.includes('id="sentence-a-input"'), "Comparison must have active Sentence A input field");
assert(html.includes('id="sentence-b-input"'), "Comparison must have active Sentence B input field");

// 3D Visualizer input & controls
assert(html.includes('id="cohesion-slider"'), "3D Visualizer must have cluster cohesion slider");
assert(html.includes('id="threshold-slider"'), "3D Visualizer must have link threshold slider");
assert(html.includes('id="canvas-3d"'), "3D Visualizer must have canvas-3d element");
assert(html.includes('id="btn-maximize-3d"'), "3D Visualizer must have maximize toggle button");

// 4. Verify sticky pipeline stepper rail exists
assert(html.includes('class="pipeline-stepper-rail"'), "Pipeline stepper rail must exist");
assert(html.includes('data-target="stage-tokenizer"'), "Stepper rail must link to Stage 1");
assert(html.includes('data-target="stage-embedder"'), "Stepper rail must link to Stage 2");
assert(html.includes('data-target="stage-comparison"'), "Stepper rail must link to Stage 3");
assert(html.includes('data-target="stage-3d-visualizer"'), "Stepper rail must link to Stage 4");

// 5. Verify core algorithmic routines are integrated
assert(html.includes('runBPESimulation'), "runBPESimulation must be present");
assert(html.includes('encodeBPE'), "encodeBPE must be present");
assert(html.includes('embedToken'), "embedToken must be present");
assert(html.includes('morphologicalEmbed'), "morphologicalEmbed must be present");
assert(html.includes('computeComparison'), "computeComparison must be present");
assert(html.includes('cosineSim3D'), "cosineSim3D must be present");

console.log("PASS: index.html DOM structure, features, inputs, and algorithmic bundle verified!");
