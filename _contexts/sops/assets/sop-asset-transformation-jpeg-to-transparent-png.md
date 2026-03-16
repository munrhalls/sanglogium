# SOP: Asset Transformation (Lossy JPEG to Lossless Transparent PNG)

## Asset Profile
* **Input State:** 8-bit sRGB JPEG, 3.0 Channels (TrueColor), visual white background.
* **Characteristics:** Contains anti-aliasing and lossy compression artifacts at subject boundaries. No pre-existing Alpha channel.
* **Target State:** 8-bit sRGB PNG, 4.0 Channels (TrueColorAlpha), 100% mathematical background transparency, 100% RGB pixel quality preservation.

## Phase 1: Mathematical Interrogation (The Lead Domino)
Establish the exact channel layout and pixel distribution. Route output to text to prevent terminal flooding.

magick identify -verbose "input.jpg" > input_data.txt

## Phase 2: Isolated Mask Generation
Generate the Alpha mask independently. Grayscale conversion followed by normalization and negation. PowerShell requires backticks to escape ImageMagick subexpression grouping.

magick "input.jpg" `( +clone -colorspace gray -normalize -negate `) -delete 0 "mask.png"

## Phase 3: Mask Validation & Artifact Rectification
Lossy JPEG compression artifacts will survive standard normalization. Interrogate the mask data to verify if absolute black/white values were achieved.

magick identify -verbose "mask.png" > mask_data.txt

If gradient bleed or static noise exists in the near-blacks or near-whites, apply a mathematical level crush to destroy the noise floor and ceiling while preserving the anti-aliased edge gradient.

magick "mask.png" -level 10%,90% "mask_clean.png"

## Phase 4: Final Composition & Format Shift
Composite the original unaltered RGB data with the mathematically pure Alpha mask. The output format must be changed to .png simultaneously to mathematically support the alpha channel and prevent secondary compression loss.

magick "input.jpg" "mask_clean.png" -alpha off -compose copy_opacity -composite "output_transparent.png"

## Phase 5: Final Audit
Interrogate the final asset to verify channel expansion (3.0 -> 4.0) and absolute transparency bounds.

magick identify -verbose "output_transparent.png" > output_data.txt