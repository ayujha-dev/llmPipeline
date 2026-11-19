const assert = require('assert');
const { computeComparison } = require('./similarity_core.js');

const resSame = computeComparison("The happy cat sat on the warm mat", "A joyful kitten rested on the soft rug");
assert(resSame.compositeScore > 0.65, `Expected paraphrase composite score > 0.65, got ${resSame.compositeScore}`);
assert(resSame.topPairs.length > 0, "Top aligned token pairs must be generated");
assert(resSame.topPairs[0].score >= 0.70, "Best alignment should have high similarity");

const resDiff = computeComparison("The happy cat sat on the warm mat", "The server crashed with critical database errors");
assert(resDiff.compositeScore < 0.40, `Expected distinct topics composite score < 0.40, got ${resDiff.compositeScore}`);

console.log("PASS: Similarity suite dual-metrics verified");
