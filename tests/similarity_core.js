// similarity_core.js - Dual-Metric Semantic Similarity & Alignment Engine

const { encodeBPE, preTokenize } = require('./tokenizer_core.js');
const { embedToken, cosineSim3D, euclideanDist3D } = require('./embedder_core.js');

function computeCentroid(embeddedTokens) {
  if (!embeddedTokens || embeddedTokens.length === 0) {
    return { x: 0, y: 0, z: 0, norm: 0 };
  }

  let totalWeight = 0;
  let sumX = 0, sumY = 0, sumZ = 0;

  for (const t of embeddedTokens) {
    // Downweight stopwords so semantic content dominates centroid
    const weight = t.isStopword ? 0.2 : 1.0;
    sumX += t.x * weight;
    sumY += t.y * weight;
    sumZ += t.z * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) totalWeight = 1;

  const cx = Number((sumX / totalWeight).toFixed(3));
  const cy = Number((sumY / totalWeight).toFixed(3));
  const cz = Number((sumZ / totalWeight).toFixed(3));
  const norm = Number(Math.sqrt(cx * cx + cy * cy + cz * cz).toFixed(3));

  return { x: cx, y: cy, z: cz, norm: norm > 0 ? norm : 0.001 };
}

function computeSoftAlignment(tokensA, tokensB, matrix) {
  if (!tokensA.length || !tokensB.length) return 0;

  // Filter content tokens if available, else use all
  const contentA = tokensA.map((t, idx) => ({ t, idx })).filter(item => !item.t.isStopword);
  const activeA = contentA.length > 0 ? contentA : tokensA.map((t, idx) => ({ t, idx }));

  const contentB = tokensB.map((t, idx) => ({ t, idx })).filter(item => !item.t.isStopword);
  const activeB = contentB.length > 0 ? contentB : tokensB.map((t, idx) => ({ t, idx }));

  // Directed max affinity from A -> B
  let sumMaxA = 0;
  for (const itemA of activeA) {
    let maxSim = -1;
    for (const itemB of activeB) {
      const sim = matrix[itemA.idx][itemB.idx];
      if (sim > maxSim) maxSim = sim;
    }
    sumMaxA += Math.max(0, maxSim);
  }
  const meanMaxA = sumMaxA / activeA.length;

  // Directed max affinity from B -> A
  let sumMaxB = 0;
  for (const itemB of activeB) {
    let maxSim = -1;
    for (const itemA of activeA) {
      const sim = matrix[itemA.idx][itemB.idx];
      if (sim > maxSim) maxSim = sim;
    }
    sumMaxB += Math.max(0, maxSim);
  }
  const meanMaxB = sumMaxB / activeB.length;

  const score = Number(((meanMaxA + meanMaxB) / 2).toFixed(3));
  return Math.max(0, Math.min(1, score));
}

function getSemanticVerdict(score) {
  if (score >= 0.88) {
    return {
      label: "Semantic Paraphrase / Near Equivalent",
      tag: "Paraphrase",
      color: "#16a34a",
      desc: "Sentences share nearly identical semantic structure, entity roles, and valence."
    };
  } else if (score >= 0.70) {
    return {
      label: "Strong Domain & Conceptual Overlap",
      tag: "Strong Match",
      color: "#0d9488",
      desc: "Sentences refer to the same conceptual field with aligned subjects and sentiment."
    };
  } else if (score >= 0.45) {
    return {
      label: "Moderate Topical Relation",
      tag: "Moderate",
      color: "#d97706",
      desc: "Sentences share some thematic anchors or emotional valence, but diverge in focus."
    };
  } else if (score >= 0.20) {
    return {
      label: "Weak / Tangential Connection",
      tag: "Weak",
      color: "#ea580c",
      desc: "Minimal semantic overlap with differing domain categories and entities."
    };
  } else {
    return {
      label: "Contrasting / Orthogonal Concepts",
      tag: "Orthogonal",
      color: "#e11d48",
      desc: "Sentences occupy opposite or unrelated semantic regions across multiple axes."
    };
  }
}

function computeComparison(textA, textB, bpeVocab = null, mergeRules = null) {
  // Tokenize using BPE if vocabulary is provided, else fallback to preTokenize
  let rawA = [];
  let rawB = [];

  if (bpeVocab && mergeRules && mergeRules.length > 0) {
    const encA = encodeBPE(textA, bpeVocab, mergeRules);
    const encB = encodeBPE(textB, bpeVocab, mergeRules);
    rawA = encA.tokens.map(t => t.clean);
    rawB = encB.tokens.map(t => t.clean);
  } else {
    rawA = preTokenize(textA);
    rawB = preTokenize(textB);
  }

  // Embed each token
  const toksA = rawA.map((t, idx) => ({ ...embedToken(t), sentence: 'A', index: idx }));
  const toksB = rawB.map((t, idx) => ({ ...embedToken(t), sentence: 'B', index: idx }));

  // Build pairwise similarity matrix
  const matrix = [];
  const pairCandidates = [];

  for (let i = 0; i < toksA.length; i++) {
    const row = [];
    for (let j = 0; j < toksB.length; j++) {
      const sim = cosineSim3D(toksA[i], toksB[j]);
      row.push(sim);

      // Collect candidates for top pairs (favoring non-stopwords)
      if (!toksA[i].isStopword || !toksB[j].isStopword) {
        pairCandidates.push({
          tokenA: toksA[i].clean,
          tokenB: toksB[j].clean,
          idxA: i,
          idxB: j,
          score: sim,
          isStopword: toksA[i].isStopword || toksB[j].isStopword
        });
      }
    }
    matrix.push(row);
  }

  // Centroids & metrics
  const centroidA = computeCentroid(toksA);
  const centroidB = computeCentroid(toksB);
  const cosCentroid = Number(cosineSim3D(centroidA, centroidB).toFixed(3));
  const softAlignment = computeSoftAlignment(toksA, toksB, matrix);

  // Composite score: balanced blend of centroid direction and token-level alignment
  const rawComposite = 0.45 * Math.max(0, cosCentroid) + 0.55 * Math.max(0, softAlignment);
  const compositeScore = Number(rawComposite.toFixed(3));

  const verdict = getSemanticVerdict(compositeScore);

  // Sort and deduplicate top aligned token pairs
  pairCandidates.sort((a, b) => b.score - a.score);
  const seenA = new Set();
  const seenB = new Set();
  const topPairs = [];

  for (const pair of pairCandidates) {
    if (!seenA.has(pair.idxA) && !seenB.has(pair.idxB)) {
      seenA.add(pair.idxA);
      seenB.add(pair.idxB);
      topPairs.push(pair);
      if (topPairs.length >= 6) break;
    }
  }

  return {
    toksA,
    toksB,
    centroidA,
    centroidB,
    cosCentroid,
    softAlignment,
    compositeScore,
    verdict,
    topPairs,
    matrix
  };
}

module.exports = {
  computeCentroid,
  computeSoftAlignment,
  getSemanticVerdict,
  computeComparison
};
