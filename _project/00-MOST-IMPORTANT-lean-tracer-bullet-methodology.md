> **This is the most important process document in this project.** Every feature build should start here. It is the reusable methodology behind how filters-and-sorting was actually built successfully — read it before starting any new feature, before writing a North Star Story, before touching code.

# Lean Tracer-Bullet Methodology

A reusable process for building any product/UX feature to a professional standard, simply and safely. Distilled from the filters-and-sorting build. Not tied to that feature — use this for the next one.

## 1. Write the end-user UX acceptance tests first — not the story, not code

Before anything else, including the North Star Story: write down what a real person actually experiences, as plain "when I `<do X>`, I see `<Y happens>`" statements. Not programmatic tests, not implementation detail — pure observable behavior from the user's seat (clicks, what appears, what the URL does, what happens on mobile, what an empty or error state looks like).

This is the actual foundation. The North Star Story is not step one — it's derived FROM this list. Without a clear statement of what the user must be able to do and see, there's nothing to check the actor split against, and no way to know if the eventual architecture actually serves the feature or just looks clean on paper.

## 2. Salvage anything already correct before rebuilding

If a prior/legacy implementation exists, don't discard it wholesale. Look at it specifically for what's already right versus what's tangled — these are usually separable. Visual styling, spacing, and design-system alignment can be entirely correct even when the underlying logic is a tangled mess worth rebuilding from scratch. Write down what's correct (colors, states, spacing, component shapes) as a style guide, explicitly separate from the logic being thrown out, so the new build carries the same look forward instead of reinventing or accidentally regressing it.

## 3. Write the North Star Story — derived from the acceptance tests, and expect to redo it

Now, from the acceptance-test list, write a plain-English story naming the actors involved (the distinct pieces of the system needed to satisfy those tests) and giving each **exactly one job**. Define the one thing they're all allowed to share (usually a single piece of shared state — a URL, a shared prop, an event) and forbid everything else from crossing that line.

This will not be right on the first draft. It took several passes to get the actor split and boundaries genuinely clean. Budget for that iteration — a north star story that took a few conversations to sharpen is normal, not a failure. If a slice of the story stops satisfying one of the acceptance tests, that's the signal something in the split is wrong — go back to step 1's list, not just to the story.

## 4. Prove the split is real: the deletion test

For every actor, and later every file, ask: if I deleted this, would the other side still work? And the reverse. If either answer is no, the split isn't real yet — a hidden dependency is still tying them together. This test is the actual mechanism for checking single-responsibility — not a naming exercise, a falsifiable check you run by hand, by actually removing files and looking.

## 5. Set the Lean Execution Guard Rail before writing a single line

State this rule explicitly, and mean it: while a small piece is being built, the ONLY verification that counts is a human looking at the running page for a few seconds and saying yes or no. No type check, no lint, no build, no test suite, no dev-server restart.

This is not a shortcut — it's what makes checking isolation after every tiny step affordable. Those heavier tools aren't wrong, they're just the wrong tool at this stage: they cost minutes, catch nothing a glance wouldn't, and bury the one signal that matters. Running them mid-build is what destroys the process, because every minute spent on a dumb verification command is a minute not spent on the live check that actually tells you something. Save the heavier tools for one single pass, once, after everything is built — never as a reflex after each small step.

## 6. Break the work into vertical-slice tracer bullets

Every build step must be a real, tiny slice of the final feature — living in its exact final file location, not a scratch file or a placeholder — that is immediately checkable by loading the running page. Small, one at a time, foundation up. Never batch two slices into one step, even when it looks faster; batching is what breaks the "check after every step" discipline that makes this safe.

For each slice, write down (before building): the exact file(s) it may touch, and nothing else. This scope boundary is what bullet 2 through it gets checked against.

## 7. Turn the story into an ordered list of ready-to-paste prompts

Once the actors and the file-to-slice breakdown exist, convert them directly into a prompt per slice — in build order, self-contained, each one restating (not assuming remembered) the scope boundary and the guard rail. This is what lets a human just copy-paste the next prompt without re-deriving anything, and it's what prevents an agent from silently chaining multiple slices into one pass — reveal only the current slice's prompt, never the whole map at once.

Each slice gets two prompts:
- **Build prompt**: build only this slice, in its real file(s), nothing beyond scope, no heavier verification, then stop and wait.
- **Deletion-test prompt**, sent only after the human's live glance says yes: remove exactly what this slice added, confirm nothing outside its boundary breaks, restore it, then stop.

## 8. The actual build loop

For each slice, in order:
1. Paste the build prompt.
2. Look at the running dev server yourself. Yes or no — nothing else counts as verification here.
3. If yes, paste the deletion-test prompt and confirm its result.
4. Move to the next slice's build prompt.

That's the whole loop. It repeats, unchanged, for every slice in the feature.

## 9. Solve for the chat context window filling up

A single chat session will eventually get too full to reliably track everything it built. Solve this with one small status file, not with hoping the conversation is remembered:

- After each slice is confirmed (glance + deletion test both passed), write one line to a status file recording exactly that.
- A brand-new chat window's very first instruction is: read that status file before anything else. It picks up exactly where things stood — no re-deriving, no trusting anyone's memory of a long conversation.
- Keep the status file honest: only mark a slice done once both checks actually happened. A slice marked done from "a prompt was sent" instead of "files were confirmed to exist and pass both checks" is exactly the kind of drift this file exists to prevent.

## What breaks this if you skip it

- Starting from the North Star Story instead of the acceptance tests — without "when I do X, I see Y" written down first, there's nothing real to check the actor split against, and the story ends up describing an architecture instead of a user experience.
- Rebuilding visuals from scratch instead of salvaging what a legacy version already got right — throws away correct, design-system-aligned work along with the tangled logic it was fused to, and reintroduces visual regressions the old version didn't have.
- Running tsc/build/lint/tests between slices — kills the speed that makes checking every slice affordable, without adding any signal a glance didn't already give you.
- Showing the agent the whole slice map instead of one slice at a time — causes chaining past the point where you meant to check.
- Treating the deletion test as a question to reason about instead of a command to actually run — turns a falsifiable check into a guess.
- Skipping the story-writing iteration because it feels slow — a wrong actor split gets discovered much later and much more expensively, mid-build, instead of on paper.
