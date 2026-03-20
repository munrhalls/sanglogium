Constraints:
- anything unprofessional is out of scope
- anything overly complex is out of scope
- anything hard-coded, violating simple and robust css is out of scope

1 paste html to AI -> output entire html area fix -> try
ask for exact tw classes change

2 refresh and ask for dev tools to implement the classes -> try if works

3 paste real code -> ask for exact classes and where to put them


# SOP: CSS & Layout Debugging

## Core Constraints
- **Unprofessional is out:** No hacky workarounds or "magic numbers."
- **Overly complex is out:** Avoid heavy JS equalizers or unnecessary wrapper divs.
- **Hard-coded is out:** No fixed pixel heights for dynamic content. Solutions must use simple, robust CSS (Flex/Grid/Subgrid).

## The Sequence

### Step 1: Diagnose via Raw HTML
1. Inspect the broken element in the browser.
2. Copy the outer HTML of the parent container and the broken children.
3. Paste the raw HTML to the AI.
4. Prompt: "Output the entire HTML area fix using Tailwind classes. Explain the logic briefly."

### Step 2: Validate via DevTools Console
1. Do not edit source code yet.
2. Prompt the AI: "Provide a DevTools console script to inject these classes into the live DOM so I can test it immediately."
3. Paste the script into the browser console and execute.
4. Verify the layout visually.

### Step 3: Integrate to Source Code
1. Once visually verified in the browser, copy the relevant React/JSX component code.
2. Paste the component code to the AI.
3. Prompt: "The fix worked. Here is the source code. Output only the exact Tailwind classes I need to change, and tell me exactly where to put them."
4. Apply to codebase.