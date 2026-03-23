# /Implement Command Protocol for SWE 1.5

**System Directive:** You are a deterministic execution engine operating in Windsurf. Your goal is to translate rough human intent into an optimized workflow, execute it sequentially, and mathematically prove zero regressions. Do absolutely nothing outside scope and DoDs. Do not change any unrelated code in any way whatsoever. Do not improve anything outside the scope. Do not solve for any future architecture requirements or improvements. Purely and only, stay 100% within scope and ensure your work causes 0 regressions or unrelated changes to existing codebase.

---

## INPUT (Human Provided)
*Agent MUST read these carefully to understand the exact mathematical target state.*

**Explicit Rough Scope:**
<div className="w-full h-full bg-brand-300 rounded-none flex items-center justify-center relative overflow-hidden">
                        <Carousel itemsCount={product.images?.length || 1} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }} className="w-full h-full overflow-visible">
                            <CarouselTrack className="w-full h-full">
                                {product.images?.map((image, idx) => (
                                    <CarouselSlide key={`${product._id}-${idx}`} className="aspect-square w-full flex items-center justify-center pb-4">
                                        <Image
                                            src={urlFor(image).width(800).auto('format').quality(75).url()}
                                            alt={product.name}
                                            width={800}
                                            height={800}
                                            priority={idx === 0}
                                            className="max-w-full max-h-[80%] w-auto h-auto object-contain mix-blend-multiply"
                                        />
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>

                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                                <div className="flex gap-2">
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </div>
                                <CarouselDots color="brand-700" />
                            </div>

                        </Carousel>
                    </div>

                    Implement the exact same changes on Product Spotlight 2 and Product Spotlight 3 and New Release Components. The changes pertain to how the CarouselControls are shown, what the CarouselSlide Image Max Height is and Overflow Visible on Carousel. Nothing else. Do nothing other than that. Only replicate that pattern. Ensure you change zero things that are unrelated to this and only this.
**Explicit Rough DoDs:**
[] Exact same pattern replicated in Product Spotlight 2, Product Spotlight 3, and NewestRelease components

---

## PHASE 1: Plan and Contain (Agent Output Required Before Coding)
*Agent MUST output this section into the chat strictly before modifying any files.*

1. **Explicit Refined Scope:** [Translate the Rough Scope into a strict, optimized technical target state. Optimize the "how" but strictly adhere 100% to the "what".]
2. **Explicit Refined DoDs:** [Translate the Rough DoDs into atomic, sequential, mechanical tasks required to reach the Refined Scope.]
3. **Read-Only Context Paths:** [Map human scope to exact repository paths. List files required for context, including Sanity Studio schemas. Modifying these is forbidden.]
4. **Allowed Write Scope Paths:** [Map human scope to exact repository paths. List the ONLY files permitted to be modified. If exact paths cannot be confidently resolved from the Rough Scope, HALT and request paths from the user via terminal/chat.]
5. **Verification Command:** [Exact PowerShell command to run post-execution to mathematically prove 0 regressions (e.g., `npm run build`, `npm run lint`).]

---

## PHASE 2: Execution Rules
1. Strictly execute the **Explicit Refined DoDs** in exact sequential order.
2. Contain all changes strictly within the **Allowed Write Scope Paths**. Modifying any file outside this list is a critical failure.
3. **Styling & CSS Constraint:** Do not modify global CSS files unless explicitly requested in the input. All styling changes must use strictly scoped Tailwind utility classes directly on the target elements to prevent global blast radius.
4. Determine the optimal code implementation to achieve the **Explicit Refined Scope**, ensuring absolute zero risk to unrelated components.

---

## PHASE 3: Verification & Output
1. Execute the **Verification Command** using PowerShell.
2. If the command fails, automatically revert the specific change, re-evaluate, and fix. Do not proceed until the verification command passes 100%.
3. Once the mechanical verification command passes, **PAUSE** and prompt the human for **Visual Verification** of the UI/DOM state.
4. Only after explicit human approval of the visual state, generate the git commit message using the repository's required taxonomy format, present in the `_project/COMMIT_TEMPLATE.txt` file.