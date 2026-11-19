# Design Document: Token & Embedding Workbench Engine & UI Overhaul (Approach A)

**Date:** 2026-11-19  
**Status:** Approved by User (Proceeding to Implementation Plan)  
**Target:** `index.html`  
**Approach Selected:** Approach A (Explainable Semantic Dimensions, True BPE Subword Pipeline, Enhanced Similarity Suite, and Sticky Stepper Studio UI)

---

## 1. Intent & Purpose
The Token & Embedding Workbench is an interactive research and educational studio that demystifies how language models process text. This overhaul upgrades both the **underlying mathematical and algorithmic pipeline** (true BPE subword tokenization, calibrated semantic embedding engine with morphological decomposition for arbitrary user inputs, and dual-metric similarity analysis) and the **UI/UX design system** (collapsible stage cards, sticky navigation rail, live summary badges, 3D workspace maximize mode, and editorial design polish).

---

## 2. Core Architecture & Pipeline Components

### 2.1 Stage 1: True Subword Tokenization (BPE)
- **Active Subword Encoder**:
  - The BPE merge rules and vocabulary learned in Stage 1 are compiled into an active BPE encoder (`encodeBPE(text, bpeVocabulary, mergeRules)`).
  - Sentence A and Sentence B are tokenized using this active vocabulary into real subword tokens (e.g., `['play', 'ful']`, `['trans', 'form', 'er']`).
  - Out-of-vocabulary words are decomposed into base characters and merged up to the current merge step.
  - A toggle allows automatically synchronizing Sentence A and Sentence B into the tokenizer corpus.
  - Live statistics: Character count, token count, vocabulary size, and compression ratio.

### 2.2 Stage 2: Calibrated Semantic Embeddings & Dimension Decomposition
- **Explainable Semantic Dimensions ($\mathbb{R}^3$ & $\mathbb{R}^4$)**:
  - Axis X ($D_1$): **Domain & Concreteness** (Domestic/Physical/Concrete $[-1]$ $\leftrightarrow$ Abstract/Digital/Tech $[+1]$).
  - Axis Y ($D_2$): **Origin & Life** (Nature/Biological/Living $[-1]$ $\leftrightarrow$ Machine/Artificial/System $[+1]$).
  - Axis Z ($D_3$): **Sentiment & Valence** (Hostile/Negative/Cold $[-1]$ $\leftrightarrow$ Warm/Positive/Joyful $[+1]$).
  - Axis W ($D_4$): **Agency / Dynamism** (Static/Object $[0]$ $\leftrightarrow$ Active/Verbal $[1]$).
- **Comprehensive Calibrated Lexicon**:
  - 450+ curated word anchors covering technology, nature, emotions, domestic objects, royalty, animals, actions, and scientific terminology.
- **Morphological & Subword Fallback for Arbitrary User Inputs**:
  - Handles *any user-provided word* via:
    1. Exact lexicon lookup.
    2. Morphological parsing: Prefix extraction (`un-`, `re-`, `pre-`, `sub-`, `super-`, `cyber-`, `neuro-`, `micro-`) and suffix extraction (`-ful`, `-less`, `-ing`, `-ed`, `-tion`, `-ity`, `-ment`, `-ly`, `-able`, `-er`).
    3. Semantic root blending: Identifying compound words and nearest semantic anchors.
    4. Subword vector pooling: Composing subword token vectors with positional weighting.
    5. Clean deterministic normalization to ensure points lie within valid semantic bounding space.
- **Embedder Visualization**:
  - Token coordinate inspector showing exact dimensional scores across $X, Y, Z$ and magnitude.
  - Interactive dimensional breakdown bars for any selected or probed token.

### 2.3 Stage 3: Enhanced Semantic Similarity Suite
- **Dual-Metric Evaluation**:
  - **Centroid Cosine Similarity**: Overall sentence vector alignment $\cos(\vec{c}_A, \vec{c}_B)$.
  - **Soft Token Alignment Score (Chamfer/Word Mover's Match)**: For each token in Sentence A, finding maximum semantic affinity to Sentence B and vice versa, preventing false collapses when sentences have different lengths or minor grammatical variations.
  - **Composite Score**: Weighted combination yielding realistic semantic similarity for arbitrary user inputs.
- **Semantic Classification & Verdict**:
  - Clear categorical classification badge:
    - $\ge 0.88$: *Semantic Paraphrase / Near Equivalent*
    - $0.70 - 0.87$: *Strong Domain & Conceptual Overlap*
    - $0.45 - 0.69$: *Moderate Topical Relation*
    - $0.20 - 0.44$: *Weak / Tangential Connection*
    - $< 0.20$: *Contrasting / Orthogonal Concepts*
- **Top Token Alignments List**:
  - Dedicated cards showing the highest-affinity cross-sentence token pairs (e.g. `cat` ↔ `kitten` [0.94], `sat` ↔ `rested` [0.88], `mat` ↔ `rug` [0.91]).
- **Interactive Pairwise Alignment Matrix**:
  - Heatmap grid with color-coded affinity cells.
  - Hovering or clicking a cell highlights the token pair in the text inputs, the matrix, and draws the corresponding 3D connecting bond in the 3D space.

### 2.4 Stage 4: 3D Embedding Space & Interactive Canvas
- **Semantic Grounding**:
  - Visible 3D semantic axis indicators with labels ($X$: Concrete $\leftrightarrow$ Tech, $Y$: Nature $\leftrightarrow$ Machine, $Z$: Sentiment).
  - Aligned cross-sentence token bonds rendered as animated or styled connecting chords in 3D space based on the similarity threshold.
  - Sentence A (Cobalt blue) and Sentence B (Coral red) cluster halos with centroid diamond markers.
- **Studio Layout & Controls**:
  - **Maximize / Expand 3D Toggle**: Expands the canvas to 75% or 100% width for unobstructed spatial analysis.
  - Camera view switchers (`Iso`, `XY`, `XZ`, `YZ`) and auto-orbit mode.
  - Translucent HUD overlays: Floating node inspector displaying token, cluster category, coordinates, and nearest neighbors.
  - Dynamic sliders: Cluster cohesion and minimum link threshold.

---

## 3. UI/UX Design System (Anti-Slop / Taste Guidelines)

### 3.1 Layout & Navigation
- **Sticky Pipeline Stepper Rail**:
  - Placed at the top with interactive stage indicators: `[1. Tokenization]` → `[2. Embeddings]` → `[3. Similarity]` → `[4. 3D Space]`.
  - Active scroll spy highlights the current stage.
  - One-click jump automatically scrolls to and expands the target stage.
- **Collapsible Stage Cards with Live Metrics**:
  - Each stage card features an accordion header with a collapse/expand toggle.
  - Persistent header summary chips display real-time status even when collapsed:
    - *Stage 1*: `Tokens: 14 · Vocab: 36 · Ratio: 2.1×`
    - *Stage 2*: `Active Tokens: 12 · 4D Space`
    - *Stage 3*: `Cosine: 0.84 · Alignment: 0.89 (Strong)`
- **Header & Presets**:
  - Clean topbar with clear typography, scenario presets (`Synonyms`, `Opposites`, `Tech vs Human`, `Royalty Analogy`), and global `Expand All` / `Collapse All` buttons.

### 3.2 Visual Aesthetics
- **Palette**: Deep slate canvas (`#f8fafc` / `#0f172a`), crisp card surfaces (`#ffffff`), subtle borders (`#e2e8f0`).
- **Stage Color Signatures**:
  - Stage 1 (Tokenization): Amber / Gold (`#d97706`)
  - Stage 2 (Embeddings): Teal / Cyan (`#0d9488`)
  - Stage 3 (Similarity): Coral / Rose (`#e11d48`)
  - Stage 4 (3D Space): Cobalt / Royal Blue (`#2563eb`)
- **Typography & Details**:
  - Clean monospaced figures (`font-family: var(--font-mono)`) for coordinates, matrices, and metrics.
  - Custom styled range sliders, pill toggles, and smooth 150ms hover micro-interactions.
