# SOP: CLI Asset Transformation (The Mathematical Lead Domino)

## 1. Asset Interrogation (The Lead Domino)
**Goal:** Establish the exact mathematical reality of the input before transformation.
* **Structural Query:** Identify ColorSpace, Bit Depth, and existing Alpha channels (e.g., magick identify -verbose).
* **Visual Query:** Detect anti-aliasing artifacts, compression noise, or "near-white" backgrounds that deceive the eye.

## 2. Mechanism Selection (Math over Magic)
**Goal:** Replace visual estimation with logic-based operations.
* **Prohibit Tolerance:** Never use -fuzz or color-picking for anti-aliased assets; it forces a choice between halos or erosion.
* **Separation of Concerns (Masking):** To remove backgrounds, separate the image into two memory layers: the untouched RGB color data, and a mathematically generated Alpha mask.
* **Auto-Normalization:** Use -normalize on grayscale clones to automatically force "dirty" backgrounds to absolute white/black before converting to transparency.

## 3. Atomic Execution Pipeline
**Goal:** Maintain 1-to-1 awareness of the transformation sequence.
* **Sequence:** Input -> Clone/Mask Generation -> Mathematical Normalization -> Composite Mask to Original -> Format Definition -> Output.
* **Constraint:** Keep commands atomic. Validate the mask generation independently before applying it to the final image.

## 4. Data-Driven Validation
**Goal:** Verify success via metadata, not visual inspection.
* **The Viewer Lie:** Image viewers render against default backgrounds.
* **Audit:** Re-run Phase 1 on the output file to mathematically confirm the presence of the Alpha channel and the correct lossless file size.
