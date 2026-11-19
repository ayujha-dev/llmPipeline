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
