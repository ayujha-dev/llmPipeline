// embedder_core.js - Calibrated Semantic Embeddings & Morphological Decomposition Engine

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'over', 'after', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must', 'that', 'this', 'these', 'those', 'it', 'its',
  'as', 'if', 'so', 'than', 'too', 'very', 'just'
]);

// 4-Dimensional semantic anchors:
// X (D1): Domain & Concreteness (Physical/Domestic [-1] <-> Abstract/Digital/Tech [+1])
// Y (D2): Origin & Life (Biological/Nature/Living [-1] <-> Machine/Artificial/System [+1])
// Z (D3): Sentiment & Valence (Negative/Hostile/Cold [-1] <-> Positive/Warm/Joyful [+1])
// W (D4): Agency / Dynamism (Static/Object [0] <-> Active/Verbal [1])
const LEXICON = {
  // Animals & Pets (Physical [-0.8..-0.5], Biological [-0.9..-0.7], Neutral/Warm)
  "cat":       { x: -0.72, y: -0.85, z: 0.42, w: 0.35, cat: "animal" },
  "kitten":    { x: -0.74, y: -0.88, z: 0.58, w: 0.45, cat: "animal" },
  "feline":    { x: -0.70, y: -0.84, z: 0.38, w: 0.30, cat: "animal" },
  "kitty":     { x: -0.75, y: -0.89, z: 0.62, w: 0.45, cat: "animal" },
  "dog":       { x: -0.70, y: -0.86, z: 0.60, w: 0.55, cat: "animal" },
  "puppy":     { x: -0.73, y: -0.89, z: 0.72, w: 0.65, cat: "animal" },
  "canine":    { x: -0.68, y: -0.83, z: 0.45, w: 0.40, cat: "animal" },
  "hound":     { x: -0.69, y: -0.85, z: 0.40, w: 0.50, cat: "animal" },
  "bird":      { x: -0.65, y: -0.90, z: 0.45, w: 0.60, cat: "animal" },
  "sparrow":   { x: -0.66, y: -0.91, z: 0.42, w: 0.55, cat: "animal" },
  "eagle":     { x: -0.62, y: -0.88, z: 0.35, w: 0.70, cat: "animal" },
  "owl":       { x: -0.64, y: -0.87, z: 0.38, w: 0.40, cat: "animal" },
  "fish":      { x: -0.70, y: -0.92, z: 0.25, w: 0.45, cat: "animal" },
  "salmon":    { x: -0.72, y: -0.93, z: 0.28, w: 0.50, cat: "animal" },
  "lion":      { x: -0.60, y: -0.86, z: 0.25, w: 0.75, cat: "animal" },
  "tiger":     { x: -0.61, y: -0.85, z: 0.20, w: 0.78, cat: "animal" },
  "bear":      { x: -0.65, y: -0.87, z: 0.15, w: 0.65, cat: "animal" },
  "wolf":      { x: -0.63, y: -0.86, z: 0.05, w: 0.70, cat: "animal" },
  "horse":     { x: -0.68, y: -0.88, z: 0.48, w: 0.65, cat: "animal" },
  "sheep":     { x: -0.75, y: -0.89, z: 0.35, w: 0.30, cat: "animal" },
  "rabbit":    { x: -0.76, y: -0.90, z: 0.52, w: 0.50, cat: "animal" },
  "mouse":     { x: -0.74, y: -0.84, z: 0.15, w: 0.45, cat: "animal" },
  "elephant":  { x: -0.62, y: -0.89, z: 0.45, w: 0.50, cat: "animal" },
  "whale":     { x: -0.58, y: -0.94, z: 0.40, w: 0.55, cat: "animal" },
  "dolphin":   { x: -0.60, y: -0.92, z: 0.65, w: 0.70, cat: "animal" },
  "snake":     { x: -0.68, y: -0.85, z: -0.25, w: 0.45, cat: "animal" },

  // Domestic & Furnishings (Physical [-0.9..-0.6], Inanimate/Static [-0.3..0.2], Neutral/Warm)
  "mat":       { x: -0.82, y: -0.25, z: 0.25, w: 0.10, cat: "domestic" },
  "rug":       { x: -0.84, y: -0.28, z: 0.32, w: 0.10, cat: "domestic" },
  "carpet":    { x: -0.83, y: -0.26, z: 0.30, w: 0.10, cat: "domestic" },
  "blanket":   { x: -0.85, y: -0.32, z: 0.50, w: 0.10, cat: "domestic" },
  "quilt":     { x: -0.84, y: -0.34, z: 0.48, w: 0.10, cat: "domestic" },
  "pillow":    { x: -0.86, y: -0.30, z: 0.55, w: 0.10, cat: "domestic" },
  "cushion":   { x: -0.85, y: -0.28, z: 0.52, w: 0.10, cat: "domestic" },
  "chair":     { x: -0.80, y: -0.15, z: 0.20, w: 0.12, cat: "domestic" },
  "seat":      { x: -0.78, y: -0.14, z: 0.22, w: 0.15, cat: "domestic" },
  "sofa":      { x: -0.82, y: -0.20, z: 0.45, w: 0.10, cat: "domestic" },
  "couch":     { x: -0.83, y: -0.21, z: 0.44, w: 0.10, cat: "domestic" },
  "bed":       { x: -0.86, y: -0.24, z: 0.52, w: 0.10, cat: "domestic" },
  "table":     { x: -0.81, y: -0.10, z: 0.15, w: 0.10, cat: "domestic" },
  "desk":      { x: -0.75, y: 0.05,  z: 0.18, w: 0.15, cat: "domestic" },
  "room":      { x: -0.78, y: -0.05, z: 0.20, w: 0.10, cat: "domestic" },
  "house":     { x: -0.82, y: -0.12, z: 0.45, w: 0.10, cat: "domestic" },
  "home":      { x: -0.84, y: -0.22, z: 0.65, w: 0.12, cat: "domestic" },
  "door":      { x: -0.79, y: -0.05, z: 0.10, w: 0.20, cat: "domestic" },
  "window":    { x: -0.77, y: -0.15, z: 0.35, w: 0.15, cat: "domestic" },
  "floor":     { x: -0.85, y: -0.10, z: 0.10, w: 0.05, cat: "domestic" },
  "kitchen":   { x: -0.80, y: -0.18, z: 0.42, w: 0.25, cat: "domestic" },
  "hearth":    { x: -0.82, y: -0.30, z: 0.58, w: 0.15, cat: "domestic" },
  "fireplace": { x: -0.81, y: -0.28, z: 0.56, w: 0.15, cat: "domestic" },
  "cup":       { x: -0.83, y: -0.05, z: 0.22, w: 0.15, cat: "domestic" },
  "bowl":      { x: -0.84, y: -0.08, z: 0.20, w: 0.12, cat: "domestic" },
  "plate":     { x: -0.83, y: -0.06, z: 0.18, w: 0.12, cat: "domestic" },
  "spoon":     { x: -0.82, y: -0.04, z: 0.15, w: 0.20, cat: "domestic" },
  "fork":      { x: -0.81, y: -0.02, z: 0.12, w: 0.20, cat: "domestic" },

  // Nature, Botanical & Earth (Physical [-0.7..-0.3], Living/Organic [-0.95..-0.7])
  "tree":      { x: -0.65, y: -0.92, z: 0.40, w: 0.15, cat: "nature" },
  "plant":     { x: -0.68, y: -0.94, z: 0.38, w: 0.20, cat: "nature" },
  "flower":    { x: -0.70, y: -0.95, z: 0.65, w: 0.20, cat: "nature" },
  "rose":      { x: -0.71, y: -0.94, z: 0.68, w: 0.20, cat: "nature" },
  "forest":    { x: -0.60, y: -0.93, z: 0.45, w: 0.25, cat: "nature" },
  "woods":     { x: -0.62, y: -0.92, z: 0.42, w: 0.25, cat: "nature" },
  "grass":     { x: -0.72, y: -0.93, z: 0.38, w: 0.15, cat: "nature" },
  "meadow":    { x: -0.68, y: -0.92, z: 0.58, w: 0.20, cat: "nature" },
  "leaf":      { x: -0.71, y: -0.94, z: 0.35, w: 0.20, cat: "nature" },
  "river":     { x: -0.55, y: -0.88, z: 0.48, w: 0.50, cat: "nature" },
  "stream":    { x: -0.58, y: -0.89, z: 0.50, w: 0.48, cat: "nature" },
  "ocean":     { x: -0.48, y: -0.85, z: 0.38, w: 0.55, cat: "nature" },
  "sea":       { x: -0.50, y: -0.86, z: 0.39, w: 0.52, cat: "nature" },
  "lake":      { x: -0.60, y: -0.88, z: 0.45, w: 0.25, cat: "nature" },
  "mountain":  { x: -0.52, y: -0.80, z: 0.35, w: 0.15, cat: "nature" },
  "hill":      { x: -0.58, y: -0.82, z: 0.38, w: 0.20, cat: "nature" },
  "sun":       { x: -0.40, y: -0.75, z: 0.75, w: 0.40, cat: "nature" },
  "sunshine":  { x: -0.45, y: -0.78, z: 0.82, w: 0.35, cat: "nature" },
  "moon":      { x: -0.38, y: -0.70, z: 0.42, w: 0.25, cat: "nature" },
  "star":      { x: -0.28, y: -0.65, z: 0.55, w: 0.30, cat: "nature" },
  "sky":       { x: -0.42, y: -0.78, z: 0.48, w: 0.20, cat: "nature" },
  "cloud":     { x: -0.50, y: -0.75, z: 0.28, w: 0.35, cat: "nature" },
  "rain":      { x: -0.52, y: -0.80, z: 0.10, w: 0.55, cat: "nature" },
  "storm":     { x: -0.45, y: -0.70, z: -0.48, w: 0.85, cat: "nature" },
  "wind":      { x: -0.48, y: -0.78, z: 0.15, w: 0.65, cat: "nature" },
  "breeze":    { x: -0.52, y: -0.82, z: 0.55, w: 0.45, cat: "nature" },
  "fire":      { x: -0.50, y: -0.60, z: 0.12, w: 0.80, cat: "nature" },
  "earth":     { x: -0.55, y: -0.85, z: 0.40, w: 0.25, cat: "nature" },
  "soil":      { x: -0.72, y: -0.88, z: 0.25, w: 0.10, cat: "nature" },

  // Positive Emotion & Sentiment (Warm, High Valence [+0.6..+0.95])
  "happy":       { x: -0.25, y: -0.65, z: 0.86, w: 0.60, cat: "sentiment" },
  "joy":         { x: -0.20, y: -0.68, z: 0.92, w: 0.65, cat: "sentiment" },
  "joyful":      { x: -0.22, y: -0.67, z: 0.90, w: 0.65, cat: "sentiment" },
  "joyfulness":  { x: -0.21, y: -0.66, z: 0.89, w: 0.60, cat: "sentiment" },
  "happiness":   { x: -0.24, y: -0.64, z: 0.88, w: 0.55, cat: "sentiment" },
  "cheerful":    { x: -0.28, y: -0.66, z: 0.82, w: 0.65, cat: "sentiment" },
  "delighted":   { x: -0.22, y: -0.64, z: 0.88, w: 0.70, cat: "sentiment" },
  "pleased":     { x: -0.30, y: -0.60, z: 0.74, w: 0.50, cat: "sentiment" },
  "glad":        { x: -0.32, y: -0.62, z: 0.72, w: 0.50, cat: "sentiment" },
  "warm":        { x: -0.60, y: -0.50, z: 0.72, w: 0.35, cat: "sentiment" },
  "warmth":      { x: -0.58, y: -0.52, z: 0.75, w: 0.30, cat: "sentiment" },
  "soft":        { x: -0.75, y: -0.45, z: 0.68, w: 0.20, cat: "sentiment" },
  "gentle":      { x: -0.65, y: -0.62, z: 0.72, w: 0.30, cat: "sentiment" },
  "love":        { x: -0.15, y: -0.72, z: 0.95, w: 0.70, cat: "sentiment" },
  "loving":      { x: -0.18, y: -0.71, z: 0.92, w: 0.68, cat: "sentiment" },
  "affection":   { x: -0.22, y: -0.68, z: 0.84, w: 0.55, cat: "sentiment" },
  "peace":       { x: -0.25, y: -0.75, z: 0.85, w: 0.20, cat: "sentiment" },
  "peaceful":    { x: -0.28, y: -0.76, z: 0.86, w: 0.20, cat: "sentiment" },
  "calm":        { x: -0.35, y: -0.70, z: 0.75, w: 0.20, cat: "sentiment" },
  "serene":      { x: -0.30, y: -0.74, z: 0.80, w: 0.20, cat: "sentiment" },
  "friendly":    { x: -0.32, y: -0.65, z: 0.80, w: 0.55, cat: "sentiment" },
  "kind":        { x: -0.30, y: -0.68, z: 0.82, w: 0.50, cat: "sentiment" },
  "kindness":    { x: -0.28, y: -0.67, z: 0.84, w: 0.45, cat: "sentiment" },
  "hope":        { x: -0.10, y: -0.60, z: 0.78, w: 0.45, cat: "sentiment" },
  "hopeful":     { x: -0.12, y: -0.62, z: 0.80, w: 0.50, cat: "sentiment" },
  "wonderful":   { x: -0.18, y: -0.55, z: 0.86, w: 0.55, cat: "sentiment" },
  "excellent":   { x: 0.15,  y: -0.20, z: 0.82, w: 0.50, cat: "sentiment" },
  "great":       { x: -0.10, y: -0.35, z: 0.75, w: 0.50, cat: "sentiment" },
  "good":        { x: -0.20, y: -0.45, z: 0.70, w: 0.40, cat: "sentiment" },
  "beautiful":   { x: -0.40, y: -0.75, z: 0.85, w: 0.35, cat: "sentiment" },
  "grace":       { x: -0.35, y: -0.70, z: 0.80, w: 0.35, cat: "sentiment" },

  // Negative Emotion & Distress (Negative Valence [-0.5..-0.95])
  "sad":         { x: -0.30, y: -0.60, z: -0.78, w: 0.30, cat: "sentiment" },
  "sorrow":      { x: -0.25, y: -0.62, z: -0.82, w: 0.30, cat: "sentiment" },
  "depressed":   { x: -0.22, y: -0.58, z: -0.85, w: 0.20, cat: "sentiment" },
  "grief":       { x: -0.24, y: -0.65, z: -0.88, w: 0.35, cat: "sentiment" },
  "angry":       { x: -0.20, y: -0.50, z: -0.80, w: 0.85, cat: "sentiment" },
  "rage":        { x: -0.15, y: -0.48, z: -0.90, w: 0.95, cat: "sentiment" },
  "furious":     { x: -0.18, y: -0.52, z: -0.88, w: 0.90, cat: "sentiment" },
  "hostile":     { x: 0.05,  y: -0.30, z: -0.82, w: 0.75, cat: "sentiment" },
  "hate":        { x: -0.10, y: -0.55, z: -0.92, w: 0.80, cat: "sentiment" },
  "hateful":     { x: -0.12, y: -0.56, z: -0.90, w: 0.78, cat: "sentiment" },
  "fear":        { x: -0.22, y: -0.62, z: -0.75, w: 0.70, cat: "sentiment" },
  "fearful":     { x: -0.24, y: -0.64, z: -0.78, w: 0.65, cat: "sentiment" },
  "terrible":    { x: -0.05, y: -0.35, z: -0.82, w: 0.60, cat: "sentiment" },
  "awful":       { x: -0.08, y: -0.38, z: -0.80, w: 0.55, cat: "sentiment" },
  "bad":         { x: -0.15, y: -0.40, z: -0.65, w: 0.40, cat: "sentiment" },
  "evil":        { x: 0.00,  y: -0.45, z: -0.95, w: 0.65, cat: "sentiment" },
  "grim":        { x: -0.20, y: -0.50, z: -0.70, w: 0.35, cat: "sentiment" },
  "pain":        { x: -0.35, y: -0.68, z: -0.85, w: 0.60, cat: "sentiment" },
  "painful":     { x: -0.32, y: -0.65, z: -0.84, w: 0.55, cat: "sentiment" },
  "bitter":      { x: -0.40, y: -0.55, z: -0.72, w: 0.40, cat: "sentiment" },
  "cold":        { x: -0.45, y: -0.30, z: -0.55, w: 0.25, cat: "sentiment" },
  "dark":        { x: -0.35, y: -0.40, z: -0.60, w: 0.30, cat: "sentiment" },
  "danger":      { x: 0.05,  y: -0.40, z: -0.75, w: 0.75, cat: "sentiment" },
  "failure":     { x: 0.20,  y: 0.20,  z: -0.75, w: 0.50, cat: "sentiment" },

  // Technology, Computing, Software & Systems (Tech [+0.7..+0.95], Machine [+0.7..+0.98])
  "computer":    { x: 0.82,  y: 0.88,  z: 0.20, w: 0.40, cat: "tech" },
  "server":      { x: 0.85,  y: 0.90,  z: 0.10, w: 0.50, cat: "tech" },
  "database":    { x: 0.86,  y: 0.89,  z: 0.12, w: 0.45, cat: "tech" },
  "cloud":       { x: 0.78,  y: 0.85,  z: 0.25, w: 0.45, cat: "tech" },
  "network":     { x: 0.80,  y: 0.82,  z: 0.22, w: 0.55, cat: "tech" },
  "internet":    { x: 0.82,  y: 0.84,  z: 0.25, w: 0.60, cat: "tech" },
  "algorithm":   { x: 0.88,  y: 0.80,  z: 0.25, w: 0.65, cat: "tech" },
  "software":    { x: 0.86,  y: 0.85,  z: 0.22, w: 0.50, cat: "tech" },
  "code":        { x: 0.84,  y: 0.82,  z: 0.20, w: 0.55, cat: "tech" },
  "program":     { x: 0.83,  y: 0.80,  z: 0.20, w: 0.55, cat: "tech" },
  "compiler":    { x: 0.87,  y: 0.86,  z: 0.15, w: 0.60, cat: "tech" },
  "cpu":         { x: 0.88,  y: 0.94,  z: 0.18, w: 0.45, cat: "tech" },
  "gpu":         { x: 0.89,  y: 0.95,  z: 0.22, w: 0.50, cat: "tech" },
  "memory":      { x: 0.75,  y: 0.70,  z: 0.15, w: 0.35, cat: "tech" },
  "model":       { x: 0.72,  y: 0.65,  z: 0.30, w: 0.55, cat: "tech" },
  "robot":       { x: 0.80,  y: 0.92,  z: 0.20, w: 0.70, cat: "tech" },
  "neural":      { x: 0.76,  y: 0.40,  z: 0.28, w: 0.60, cat: "tech" },
  "silicon":     { x: 0.78,  y: 0.75,  z: 0.10, w: 0.20, cat: "tech" },
  "digital":     { x: 0.86,  y: 0.86,  z: 0.24, w: 0.40, cat: "tech" },
  "cyber":       { x: 0.88,  y: 0.88,  z: 0.10, w: 0.55, cat: "tech" },
  "data":        { x: 0.80,  y: 0.78,  z: 0.15, w: 0.40, cat: "tech" },
  "terminal":    { x: 0.82,  y: 0.86,  z: 0.12, w: 0.45, cat: "tech" },
  "browser":     { x: 0.80,  y: 0.84,  z: 0.22, w: 0.45, cat: "tech" },
  "system":      { x: 0.75,  y: 0.75,  z: 0.15, w: 0.45, cat: "tech" },
  "cluster":     { x: 0.78,  y: 0.80,  z: 0.12, w: 0.45, cat: "tech" },
  "protocol":    { x: 0.76,  y: 0.72,  z: 0.15, w: 0.35, cat: "tech" },
  "device":      { x: 0.74,  y: 0.85,  z: 0.20, w: 0.35, cat: "tech" },
  "machine":     { x: 0.76,  y: 0.92,  z: 0.10, w: 0.50, cat: "tech" },
  "hardware":    { x: 0.80,  y: 0.94,  z: 0.12, w: 0.30, cat: "tech" },
  "api":         { x: 0.85,  y: 0.80,  z: 0.20, w: 0.50, cat: "tech" },
  "token":       { x: 0.78,  y: 0.72,  z: 0.20, w: 0.35, cat: "tech" },
  "embedding":   { x: 0.82,  y: 0.68,  z: 0.28, w: 0.45, cat: "tech" },
  "vector":      { x: 0.80,  y: 0.65,  z: 0.22, w: 0.35, cat: "tech" },
  "transformer": { x: 0.85,  y: 0.78,  z: 0.32, w: 0.65, cat: "tech" },
  "attention":   { x: 0.60,  y: 0.30,  z: 0.30, w: 0.60, cat: "tech" },
  "pipeline":    { x: 0.78,  y: 0.80,  z: 0.25, w: 0.60, cat: "tech" },
  "crash":       { x: 0.65,  y: 0.70,  z: -0.78, w: 0.85, cat: "tech" },
  "crashed":     { x: 0.64,  y: 0.68,  z: -0.80, w: 0.82, cat: "tech" },
  "error":       { x: 0.70,  y: 0.75,  z: -0.75, w: 0.55, cat: "tech" },
  "errors":      { x: 0.70,  y: 0.75,  z: -0.76, w: 0.55, cat: "tech" },
  "bug":         { x: 0.55,  y: 0.45,  z: -0.65, w: 0.45, cat: "tech" },
  "critical":    { x: 0.40,  y: 0.35,  z: -0.70, w: 0.75, cat: "tech" },

  // Royalty, Hierarchy & Society (Abstract/Social [0.0..0.4], Living/Human [-0.7..-0.4])
  "king":        { x: -0.10, y: -0.65, z: 0.45, w: 0.70, cat: "royalty" },
  "queen":       { x: -0.12, y: -0.68, z: 0.55, w: 0.68, cat: "royalty" },
  "prince":      { x: -0.15, y: -0.70, z: 0.50, w: 0.65, cat: "royalty" },
  "princess":    { x: -0.16, y: -0.72, z: 0.60, w: 0.62, cat: "royalty" },
  "monarch":     { x: -0.05, y: -0.60, z: 0.40, w: 0.65, cat: "royalty" },
  "ruler":       { x: 0.05,  y: -0.50, z: 0.30, w: 0.70, cat: "royalty" },
  "crown":       { x: -0.45, y: -0.30, z: 0.50, w: 0.20, cat: "royalty" },
  "throne":      { x: -0.55, y: -0.25, z: 0.45, w: 0.15, cat: "royalty" },
  "palace":      { x: -0.60, y: -0.20, z: 0.55, w: 0.15, cat: "royalty" },
  "castle":      { x: -0.58, y: -0.22, z: 0.48, w: 0.15, cat: "royalty" },
  "leader":      { x: 0.10,  y: -0.55, z: 0.55, w: 0.80, cat: "society" },
  "guide":       { x: 0.00,  y: -0.60, z: 0.65, w: 0.70, cat: "society" },
  "teacher":     { x: -0.15, y: -0.70, z: 0.70, w: 0.70, cat: "society" },
  "student":     { x: -0.20, y: -0.72, z: 0.55, w: 0.65, cat: "society" },
  "doctor":      { x: 0.05,  y: -0.65, z: 0.68, w: 0.75, cat: "society" },
  "worker":      { x: -0.30, y: -0.65, z: 0.35, w: 0.75, cat: "society" },
  "friend":      { x: -0.35, y: -0.75, z: 0.82, w: 0.55, cat: "society" },
  "companion":   { x: -0.38, y: -0.76, z: 0.80, w: 0.50, cat: "society" },

  // Actions & Verbs (High Agency W [0.6..0.95])
  "sat":         { x: -0.70, y: -0.50, z: 0.30, w: 0.30, cat: "action" },
  "sit":         { x: -0.68, y: -0.48, z: 0.30, w: 0.35, cat: "action" },
  "rested":      { x: -0.72, y: -0.55, z: 0.55, w: 0.25, cat: "action" },
  "rest":        { x: -0.70, y: -0.54, z: 0.55, w: 0.25, cat: "action" },
  "resting":     { x: -0.71, y: -0.56, z: 0.58, w: 0.30, cat: "action" },
  "sleep":       { x: -0.75, y: -0.60, z: 0.52, w: 0.15, cat: "action" },
  "slept":       { x: -0.76, y: -0.62, z: 0.50, w: 0.15, cat: "action" },
  "run":         { x: -0.40, y: -0.60, z: 0.40, w: 0.90, cat: "action" },
  "walk":        { x: -0.50, y: -0.62, z: 0.40, w: 0.70, cat: "action" },
  "jumped":      { x: -0.45, y: -0.58, z: 0.50, w: 0.85, cat: "action" },
  "flying":      { x: -0.35, y: -0.65, z: 0.65, w: 0.85, cat: "action" },
  "build":       { x: 0.25,  y: 0.20,  z: 0.55, w: 0.85, cat: "action" },
  "create":      { x: 0.20,  y: -0.10, z: 0.70, w: 0.85, cat: "action" },
  "learn":       { x: 0.30,  y: -0.30, z: 0.65, w: 0.75, cat: "action" },
  "train":       { x: 0.45,  y: 0.25,  z: 0.50, w: 0.80, cat: "action" },
  "compute":     { x: 0.80,  y: 0.82,  z: 0.20, w: 0.75, cat: "action" },
  "connect":     { x: 0.50,  y: 0.30,  z: 0.55, w: 0.70, cat: "action" },
  "destroy":     { x: -0.10, y: -0.20, z: -0.85, w: 0.90, cat: "action" }
};

// Morphological rules for out-of-vocabulary decomposition
const PREFIXES = [
  { prefix: 'super', dx: 0.10, dy: 0.00, dz: 0.20, dw: 0.15 },
  { prefix: 'cyber', dx: 0.45, dy: 0.45, dz: 0.00, dw: 0.10 },
  { prefix: 'neuro', dx: 0.35, dy: -0.15, dz: 0.05, dw: 0.10 },
  { prefix: 'micro', dx: 0.20, dy: 0.25, dz: 0.00, dw: 0.00 },
  { prefix: 'anti',  dx: 0.00, dy: 0.00, dz: -0.35, dw: 0.20 },
  { prefix: 'un',    dx: 0.00, dy: 0.00, dz: -0.40, dw: 0.00 },
  { prefix: 'dis',   dx: 0.00, dy: 0.00, dz: -0.35, dw: 0.00 },
  { prefix: 'non',   dx: 0.00, dy: 0.00, dz: -0.15, dw: 0.00 },
  { prefix: 're',    dx: 0.05, dy: 0.00, dz: 0.05,  dw: 0.25 },
  { prefix: 'pre',   dx: 0.10, dy: 0.00, dz: 0.05,  dw: 0.00 },
  { prefix: 'sub',   dx: 0.05, dy: 0.05, dz: -0.05, dw: 0.00 }
];

const SUFFIXES = [
  { suffix: 'ness',  dx: 0.05, dy: -0.05, dz: 0.00, dw: -0.20 },
  { suffix: 'ful',   dx: -0.05, dy: -0.05, dz: 0.25, dw: 0.10 },
  { suffix: 'fully', dx: -0.05, dy: -0.05, dz: 0.25, dw: 0.15 },
  { suffix: 'less',  dx: 0.05, dy: 0.05,  dz: -0.30, dw: -0.10 },
  { suffix: 'lessly', dx: 0.05, dy: 0.05, dz: -0.30, dw: 0.00 },
  { suffix: 'ing',   dx: 0.00, dy: 0.00,  dz: 0.05, dw: 0.35 },
  { suffix: 'ed',    dx: -0.05, dy: 0.00, dz: 0.00, dw: -0.10 },
  { suffix: 'er',    dx: 0.00, dy: -0.10, dz: 0.10, dw: 0.30 },
  { suffix: 'est',   dx: 0.10, dy: 0.00,  dz: 0.20, dw: 0.10 },
  { suffix: 'ly',    dx: 0.05, dy: 0.00,  dz: 0.05, dw: 0.15 },
  { suffix: 'able',  dx: 0.10, dy: 0.00,  dz: 0.15, dw: 0.20 },
  { suffix: 'tion',  dx: 0.15, dy: 0.10,  dz: 0.00, dw: 0.00 },
  { suffix: 'ity',   dx: 0.15, dy: 0.05,  dz: 0.00, dw: -0.10 },
  { suffix: 'ment',  dx: 0.10, dy: 0.05,  dz: 0.05, dw: 0.00 }
];

function sanitizeToken(token) {
  if (!token) return '';
  return token.toString().toLowerCase().replace(/^▁/, '').replace(/[^\w]/g, '');
}

function clamp(val, min = -1, max = 1) {
  return Math.max(min, Math.min(max, val));
}

function morphologicalEmbed(clean) {
  if (!clean || clean.length === 0) {
    return { x: 0, y: 0, z: 0, w: 0, category: 'unknown' };
  }

  // 1. Direct match
  if (LEXICON[clean]) {
    const l = LEXICON[clean];
    return { x: l.x, y: l.y, z: l.z, w: l.w, category: l.cat };
  }

  let base = clean;
  let deltaX = 0, deltaY = 0, deltaZ = 0, deltaW = 0;
  let detectedCategory = 'general';

  // 2. Check Prefixes
  for (const p of PREFIXES) {
    if (base.startsWith(p.prefix) && base.length > p.prefix.length + 2) {
      base = base.slice(p.prefix.length);
      deltaX += p.dx;
      deltaY += p.dy;
      deltaZ += p.dz;
      deltaW += p.dw;
      break;
    }
  }

  // Check if stripped prefix base matches lexicon
  if (LEXICON[base]) {
    const l = LEXICON[base];
    return {
      x: clamp(l.x + deltaX),
      y: clamp(l.y + deltaY),
      z: clamp(l.z + deltaZ),
      w: clamp(l.w + deltaW, 0, 1),
      category: l.cat
    };
  }

  // 3. Check Suffixes
  for (const s of SUFFIXES) {
    if (base.endsWith(s.suffix) && base.length > s.suffix.length + 2) {
      const candidate = base.slice(0, -s.suffix.length);
      // Try candidate root directly or with trailing 'e'
      if (LEXICON[candidate]) {
        const l = LEXICON[candidate];
        return {
          x: clamp(l.x + deltaX + s.dx),
          y: clamp(l.y + deltaY + s.dy),
          z: clamp(l.z + deltaZ + s.dz),
          w: clamp(l.w + deltaW + s.dw, 0, 1),
          category: l.cat
        };
      }
      if (LEXICON[candidate + 'e']) {
        const l = LEXICON[candidate + 'e'];
        return {
          x: clamp(l.x + deltaX + s.dx),
          y: clamp(l.y + deltaY + s.dy),
          z: clamp(l.z + deltaZ + s.dz),
          w: clamp(l.w + deltaW + s.dw, 0, 1),
          category: l.cat
        };
      }
      base = candidate;
      deltaX += s.dx;
      deltaY += s.dy;
      deltaZ += s.dz;
      deltaW += s.dw;
      break;
    }
  }

  // 4. Compound / Substring root search
  // Check if word contains any known anchor of length >= 3
  let bestAnchor = null;
  let bestAnchorLen = 0;
  for (const anchor of Object.keys(LEXICON)) {
    if (anchor.length >= 3 && clean.includes(anchor)) {
      if (anchor.length > bestAnchorLen) {
        bestAnchor = anchor;
        bestAnchorLen = anchor.length;
      }
    }
  }

  if (bestAnchor && LEXICON[bestAnchor]) {
    const l = LEXICON[bestAnchor];
    return {
      x: clamp(l.x * 0.85 + deltaX),
      y: clamp(l.y * 0.85 + deltaY),
      z: clamp(l.z * 0.85 + deltaZ),
      w: clamp(l.w * 0.85 + deltaW, 0, 1),
      category: l.cat
    };
  }

  // 5. Deterministic fallback for completely unseen roots
  // Uses character n-gram hashing projected onto calibrated semantic bounds
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) & 0xffffffff;
  }
  const f1 = ((hash & 0xff) / 255) * 2 - 1;
  const f2 = (((hash >> 8) & 0xff) / 255) * 2 - 1;
  const f3 = (((hash >> 16) & 0xff) / 255) * 2 - 1;
  const f4 = ((hash >> 24) & 0xff) / 255;

  return {
    x: clamp(f1 * 0.4 + deltaX),
    y: clamp(f2 * 0.4 + deltaY),
    z: clamp(f3 * 0.4 + deltaZ),
    w: clamp(f4 * 0.4 + deltaW, 0, 1),
    category: detectedCategory
  };
}

function embedToken(rawToken, contextWord = null) {
  const tokenStr = rawToken !== undefined && rawToken !== null ? String(rawToken) : '';
  const clean = sanitizeToken(tokenStr);
  const cleanContext = sanitizeToken(contextWord);

  let targetWord = clean;
  // If token is a short subword fragment (<= 2 chars) and contextWord has substantial length, use context
  if (clean.length <= 2 && cleanContext && cleanContext.length > 2 && !LEXICON[clean]) {
    targetWord = cleanContext;
  }

  const isStopword = STOPWORDS.has(targetWord) || STOPWORDS.has(clean);
  const coords = morphologicalEmbed(targetWord);

  // Stopwords have reduced magnitude
  const magnitudeMultiplier = isStopword ? 0.35 : 1.0;
  const x = Number((coords.x * magnitudeMultiplier).toFixed(3));
  const y = Number((coords.y * magnitudeMultiplier).toFixed(3));
  const z = Number((coords.z * magnitudeMultiplier).toFixed(3));
  const w = Number((coords.w * magnitudeMultiplier).toFixed(3));

  const norm = Number(Math.sqrt(x * x + y * y + z * z).toFixed(3));

  return {
    token: tokenStr,
    clean: clean || tokenStr,
    word: contextWord || tokenStr,
    x,
    y,
    z,
    w,
    norm: norm > 0 ? norm : 0.001,
    category: coords.category,
    isStopword,
    dimensions: {
      concreteness_tech: x,
      nature_digital: y,
      sentiment_valence: z,
      agency_dynamism: w
    }
  };
}

function cosineSim3D(v1, v2) {
  if (!v1 || !v2) return 0;
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const norm1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const norm2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
  if (norm1 === 0 || norm2 === 0) return 0;
  const sim = dot / (norm1 * norm2);
  return Number(Math.max(-1, Math.min(1, sim)).toFixed(3));
}

function euclideanDist3D(v1, v2) {
  if (!v1 || !v2) return 0;
  const dx = v1.x - v2.x;
  const dy = v1.y - v2.y;
  const dz = v1.z - v2.z;
  return Number(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(3));
}

module.exports = {
  STOPWORDS,
  LEXICON,
  morphologicalEmbed,
  embedToken,
  cosineSim3D,
  euclideanDist3D
};
