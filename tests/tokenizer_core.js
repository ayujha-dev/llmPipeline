// tokenizer_core.js - Active BPE Subword Tokenization Engine

function preTokenize(text) {
  if (!text) return [];
  // Split on whitespace while preserving words and punctuation
  const matches = text.match(/\b\w+\b|[^\s\w]/g) || [];
  return matches;
}

function wordToInitialTokens(word, isFirstWord = false) {
  // Use '▁' symbol to denote word-initial / space-prefixed boundary
  const prefix = isFirstWord ? '' : '▁';
  const fullWord = prefix + word;
  return Array.from(fullWord);
}

function runBPESimulation(rawText, maxMerges = 32) {
  const words = preTokenize(rawText);
  if (words.length === 0) {
    return {
      steps: [{
        step: 0,
        mergedPair: null,
        pairFreq: 0,
        vocabList: [],
        vocabMap: {},
        wordTokens: [],
        stats: { charCount: 0, tokenCount: 0, vocabSize: 0, compressionRatio: '1.00' }
      }],
      mergeRules: [],
      vocabMap: {},
      initialVocab: []
    };
  }

  // Count word frequencies
  const wordFreqs = new Map();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const key = (i === 0 ? '' : '▁') + w;
    wordFreqs.set(key, (wordFreqs.get(key) || 0) + 1);
  }

  // Initial tokenization of words: array of characters
  let corpusWords = [];
  const baseVocabSet = new Set();

  for (const [word, freq] of wordFreqs.entries()) {
    const chars = Array.from(word);
    chars.forEach(c => baseVocabSet.add(c));
    corpusWords.push({ chars, freq, original: word });
  }

  const baseVocab = Array.from(baseVocabSet).sort();
  const vocabMap = {};
  baseVocab.forEach((t, idx) => {
    vocabMap[t] = idx;
  });

  const steps = [];
  const mergeRules = [];

  function calculateStats(currentWords, currentVocabSize) {
    let totalChars = 0;
    let totalTokens = 0;
    for (const item of currentWords) {
      totalChars += item.original.length * item.freq;
      totalTokens += item.chars.length * item.freq;
    }
    const ratio = totalTokens > 0 ? (totalChars / totalTokens).toFixed(2) : '1.00';
    return {
      charCount: totalChars,
      tokenCount: totalTokens,
      vocabSize: currentVocabSize,
      compressionRatio: ratio
    };
  }

  // Step 0: Base vocabulary
  steps.push({
    step: 0,
    mergedPair: null,
    pairFreq: 0,
    vocabList: [...baseVocab],
    vocabMap: { ...vocabMap },
    wordTokens: corpusWords.map(w => ({ word: w.original, tokens: [...w.chars], freq: w.freq })),
    stats: calculateStats(corpusWords, Object.keys(vocabMap).length)
  });

  // Run iterative merges
  for (let step = 1; step <= maxMerges; step++) {
    // Count bigram pair frequencies across all words
    const pairFreqs = new Map();
    for (const item of corpusWords) {
      const { chars, freq } = item;
      for (let i = 0; i < chars.length - 1; i++) {
        const pairKey = chars[i] + '|||' + chars[i + 1];
        pairFreqs.set(pairKey, (pairFreqs.get(pairKey) || 0) + freq);
      }
    }

    if (pairFreqs.size === 0) break;

    // Find pair with highest frequency (deterministic tie-break)
    let bestPair = null;
    let maxFreq = -1;
    for (const [pairKey, freq] of pairFreqs.entries()) {
      if (freq > maxFreq || (freq === maxFreq && bestPair && pairKey < bestPair)) {
        maxFreq = freq;
        bestPair = pairKey;
      }
    }

    if (maxFreq < 1 || !bestPair) break;

    const [left, right] = bestPair.split('|||');
    const merged = left + right;
    const newId = Object.keys(vocabMap).length;
    vocabMap[merged] = newId;

    const rule = { left, right, merged, freq: maxFreq, id: newId };
    mergeRules.push(rule);

    // Apply merge to corpus words
    const updatedCorpus = [];
    for (const item of corpusWords) {
      const oldChars = item.chars;
      const newChars = [];
      let i = 0;
      while (i < oldChars.length) {
        if (i < oldChars.length - 1 && oldChars[i] === left && oldChars[i + 1] === right) {
          newChars.push(merged);
          i += 2;
        } else {
          newChars.push(oldChars[i]);
          i++;
        }
      }
      updatedCorpus.push({ chars: newChars, freq: item.freq, original: item.original });
    }
    corpusWords = updatedCorpus;

    steps.push({
      step,
      mergedPair: { left, right, merged, freq: maxFreq },
      vocabList: Object.keys(vocabMap),
      vocabMap: { ...vocabMap },
      wordTokens: corpusWords.map(w => ({ word: w.original, tokens: [...w.chars], freq: w.freq })),
      stats: calculateStats(corpusWords, Object.keys(vocabMap).length)
    });
  }

  return {
    steps,
    mergeRules,
    vocabMap,
    initialVocab: baseVocab
  };
}

function encodeBPE(text, vocabMap = {}, mergeRules = []) {
  if (!text || typeof text !== 'string') {
    return { tokens: [], tokenCount: 0, rawTokens: [] };
  }

  const words = preTokenize(text);
  const resultTokens = [];

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const rawWord = words[wIdx];
    // Add prefix if not first word
    const prefix = wIdx === 0 ? '' : '▁';
    let currentTokens = Array.from(prefix + rawWord);

    // Iteratively apply merge rules in order
    for (const rule of mergeRules) {
      if (currentTokens.length < 2) break;
      const nextTokens = [];
      let i = 0;
      while (i < currentTokens.length) {
        if (i < currentTokens.length - 1 && currentTokens[i] === rule.left && currentTokens[i + 1] === rule.right) {
          nextTokens.push(rule.merged);
          i += 2;
        } else {
          nextTokens.push(currentTokens[i]);
          i++;
        }
      }
      currentTokens = nextTokens;
    }

    let isLeading = false;
    if (currentTokens[0] === '▁') {
      isLeading = true;
      currentTokens.shift();
    }
    for (let tIdx = 0; tIdx < currentTokens.length; tIdx++) {
      const tok = currentTokens[tIdx];
      const hasPrefix = (tIdx === 0 && isLeading) || tok.startsWith('▁');
      const clean = tok.replace(/^▁/, '');
      if (!clean) continue;
      const fullTok = (tIdx === 0 && isLeading && !tok.startsWith('▁')) ? ('▁' + clean) : tok;
      const id = vocabMap[fullTok] !== undefined ? vocabMap[fullTok] : (vocabMap[clean] !== undefined ? vocabMap[clean] : -1);
      resultTokens.push({
        token: fullTok,
        clean: clean,
        word: rawWord,
        id: id,
        isBase: clean.length === 1,
        hasPrefix: hasPrefix
      });
    }
  }

  return {
    tokens: resultTokens,
    tokenCount: resultTokens.length,
    rawTokens: resultTokens.map(t => t.clean)
  };
}

module.exports = {
  preTokenize,
  runBPESimulation,
  encodeBPE
};
