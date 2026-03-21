Every AI-effective prompt I generate must include:

MANDATORY STRUCTURE:
CONTEXT: [stack, current file state, what already exists]
TARGET: [one specific output, one layer only]
LAYER: [Structure / Layout / Surface / Interaction — pick one]

CONSTRAINTS:
- Use only existing design system aliases from tailwind.config.ts
- Do not touch any file not explicitly named
- Do not change JSX structure or element nesting
- Do not change any className not explicitly listed
- Do not add new Tailwind values not in the config
- Do not touch Hero or any locked component
- Preserve all existing data fetching logic
- Output only the changed file, no explanations

FORBIDDEN:
- DO NOT use arbitrary Tailwind values like w-[37px]
- DO NOT add inline styles
- DO NOT add comments to the code
- DO NOT change more than what TARGET specifies
- DO NOT generate multiple changes in one prompt