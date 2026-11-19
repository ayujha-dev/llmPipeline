# LLM Pipeline Visualizer

An interactive, zero-dependency browser workbench that visualizes the end-to-end text processing pipeline of Large Language Models: subword tokenization, vector embedding, semantic similarity comparison, and 3D spatial clustering.

**Live Deployment:** [https://llmpipeline-chi.vercel.app](https://llmpipeline-chi.vercel.app)

Built entirely in a single standalone `index.html` file using vanilla HTML5, CSS3, and JavaScript—no external libraries, frameworks, or CDNs required.

---

## Pipeline Stages

### 1. Tokenizer & Vocabulary Builder (BPE)
- **Interactive Training Corpus:** Train Byte-Pair Encoding (BPE) directly on arbitrary user text.
- **Merge Playback Scrubber:** Step forward, backward, play, or reset through iterative bigram merges.
- **Live Tokenizer Test:** Enter any sentence to view real-time subword tokenization chips with word-boundary indicators (`▁`).
- **Inspection Tables:** Inspect the full learned vocabulary and ordered merge rule logs with frequencies.

### 2. Embedder (4D Vector Projections)
- **Geometric Dimensions:** Projects tokens into calibrated, explainable axes:
  - **X (Domain):** Abstract/Functional $\leftrightarrow$ Concrete/Technical
  - **Y (Origin):** Biological/Natural $\leftrightarrow$ Digital/Synthetic
  - **Z (Valence):** Negative/Hostile $\leftrightarrow$ Positive/Constructive
  - **W (Dynamism):** Passive/Static $\leftrightarrow$ Active/Dynamic
- **Token Probe:** Inspect vector coordinates, norms ($\|v\|$), morphological roots/affixes, and stopword downweighting.

### 3. Sentence Comparison (Similarity Suite)
- **Dual-Metric Engine:**
  - **Centroid Cosine Angle:** Global semantic direction similarity between sentence vectors.
  - **Soft Alignment (Word Mover's Distance):** Fine-grained token-level cross-matching.
- **Semantic Verdicts:** Classifies relationship (Paraphrase, Strong Match, Topical Overlap, Orthogonal, Disjoint).
- **Alignment Heatmap:** Interactive matrix displaying token-by-token pairwise similarity scores.

### 4. Interactive 3D Vector Space & Cluster Visualizer
- **Pure Canvas 3D Engine:** Rotatable, zoomable, draggable 3D space rendered on standard HTML5 2D Canvas without Three.js or WebGL.
- **Semantic Clustering:** Positions tokens in 3D space, drawing dynamic connecting links based on similarity thresholds.
- **HUD & Nearest Neighbors:** Hover over any node to inspect 3D coordinates, magnitude, and top nearest neighbors.
- **Auto-Orbit & Controls:** Toggle auto-rotation, adjust cluster cohesion multiplier, and filter link thresholds.

---

## Getting Started

### Option 1: Live Web App (Instant)
Access the live deployment directly in your browser:
👉 **[https://llmpipeline-chi.vercel.app](https://llmpipeline-chi.vercel.app)**

### Option 2: Run Locally (Alternate)
No build steps, dependencies, or local web server required:

1. Clone the repository:
   ```bash
   git clone https://github.com/ayujha-dev/llmPipeline.git
   cd llmPipeline
   ```
2. Open `index.html` in any modern web browser:
   ```bash
   # macOS
   open index.html

   # Linux
   xdg-open index.html

   # Windows
   start index.html
   ```

---

## Presets Included

Quickly test the pipeline with built-in scenario presets:
- **🐱 Synonyms:** *"The happy cat sat on the warm mat"* vs *"A joyful kitten rested on the soft rug"* (High similarity)
- **⚡ Opposites:** *"The happy cat sat on the warm mat"* vs *"Production server crashed with fatal database timeout"* (Low similarity)
- **👑 Analogy:** *"The king ruled the vast empire with wisdom"* vs *"The queen governed the sovereign nation with grace"*
- **🌲 Tech vs Nature:** *"Neural network models optimize gradient descent"* vs *"Ancient evergreen trees grow across the mountain"*
