# /Implement Command Protocol for SWE 1.5

**System Directive:** You are a deterministic execution engine operating in Windsurf. Your goal is to translate rough human intent into an optimized workflow, execute it sequentially, and mathematically prove zero regressions. Do absolutely nothing outside scope and DoDs. Do not change any unrelated code in any way whatsoever. Do not improve anything outside the scope. Do not solve for any future architecture requirements or improvements. Purely and only, stay 100% within scope and ensure your work causes 0 regressions or unrelated changes to existing codebase.

---

## INPUT (Human Provided)
*Agent MUST read these carefully to understand the exact mathematical target state.*

**Explicit Rough Scope:**
Files: Product Spotlight 1, Product Spotlight 2, Product Spotlight 3, New Release.
Area in each file: Carousel navigation elements and element containing product image.
The only required change and the only change to make is to make the carousel navigation elements positioned properly in terms of layout and styled properly in terms of styling such that they are visible against the beige background and such that they are also properly sized and look good.
- They should have Brand-700 color for default state
- For hover state, they should go up brand-950 in color.
- For inactive state, they should be lower opacity but visible against beige background.

**Explicit Rough DoDs:**
    [] Carousel
      [] Layout
        [] Dots: Centered horizontally below the image, positioned close to the bottom edge.
        [] Nav Buttons: Positioned below the image in the bottom-left corner.
      [] Styling
          [] Carousel Nav Buttons:
          [] Use thick brand-700 chevrons.
          [] Inactive state: Greyed out or low opacity.

---

## PHASE 1: Plan and Contain (Agent Output Required Before Coding)
*Agent MUST output this section into the chat strictly before modifying any files.*

1. **Explicit Refined Scope:** [Translate the Rough Scope into a strict, optimized technical target state. Optimize the "how" but strictly adhere 100% to the "what".]
2. **Explicit Refined DoDs:** [Translate the Rough DoDs into atomic, sequential, mechanical tasks required to reach the Refined Scope.]
3. **Read-Only Context Paths:** [Explicit list of files required for architectural understanding, including Sanity Studio schemas if applicable. Modifying these is forbidden.]
4. **Allowed Write Scope Paths:** [Explicit list of the ONLY files permitted to be modified. Modifying any file outside this list is a critical failure.]
5. **Verification Command:** [Exact PowerShell command to run post-execution to prove 0 regressions (e.g., `npm run build`, `npm run test`).]

---

## PHASE 2: Execution Rules
1. Strictly execute the **Explicit Refined DoDs** in exact sequential order.
2. Contain all changes strictly within the **Allowed Write Scope Paths**.
3. Determine the optimal code implementation to achieve the **Explicit Refined Scope**, ensuring absolute zero risk to unrelated components.

---

## PHASE 3: Verification & Output
1. Execute the **Verification Command** using PowerShell.
2. If the command fails, automatically revert the specific change, re-evaluate, and fix. Do not declare completion until the verification command passes 100%.
3. Generate the git commit message using the repository's required taxonomy format, present in the _project/COMMIT_TEMPLATE.txt file.