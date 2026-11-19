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
