AXIS org-data-scripts | TURN 1 of 1 | TASK AREA: scripts, proofs and data layout (audit M1) | PHASE 1.3 of 5 — separate source records from the generated index

OWNER CONFIRMATION REQUIRED: pasting this phase into the executor IS the owner's confirmation that no sourcing pipeline still writes product records to data/<slice>/ (scripts/feed-next.sh, the beads sourcing tree, Devin sourcing sessions). If any does, update their prompts to the new path data/products/<slice>/ first, or skip this phase and run phases 1.4 and 1.5 only (phase 1.4 then documents the old layout).

STANDARD APPLIED: a folder named data/ that mixes ~700 source records with one generated build artifact is ambiguous. Source records and generated output are separated; the runtime import path of the generated index does not change (zero code churn in features/).

Prerequisite: phases 1.1 and 1.2 done on this branch. Same OWNS / OFF-LIMITS as phase 1.1.

GOAL
data/ contains products/ (source records) and catalogue-index.json (generated) side by side; nothing else.

TASKS (in order)
1. Inventory the readers. Run git grep -n "data/headphones\|data/accessories\|data/audio-electronics\|data/<slice>\|'data'\|\"data\"" -- scripts features app lib sanity-cms tools. Expected: scripts/catalogue-integrity/rubric.mjs (about line 53, "build product_id -> slice map from data/<slice>/<brand>/*.md"). List every hit before changing anything.
2. git mv data/headphones data/products/headphones; git mv data/accessories data/products/accessories; git mv data/audio-electronics data/products/audio-electronics (create data/products/ first). data/catalogue-index.json stays exactly where it is. Note: one file under data/products/headphones/mark-levinson/ has a non-ASCII character in its name; git mv of the directory handles it. Do NOT rename that file (its name mirrors its product_slug; see phase 1.4).
3. Update every reader found in task 1 so it reads data/products/<slice>/<brand>/*.md (for rubric.mjs: the path join that builds the data root gains a "products" segment). Update comments that name the old layout.
4. Verify: git grep -n "data/headphones\|data/accessories\|data/audio-electronics" -- . ':(exclude)docs' ':(exclude)data' prints nothing; git ls-files data | awk -F/ '{print $2}' | sort -u prints only: catalogue-index.json and products.

DONE CRITERIA
- [ ] git ls-files data shows exactly data/catalogue-index.json plus files under data/products/{headphones,accessories,audio-electronics}/ (same file count as before: 704 tracked files in data/ minus nothing; compare git ls-files data | wc -l before and after)
- [ ] every reader of the old paths is updated; grep from task 4 is empty
- [ ] git diff -M --stat shows renames only for data/ (no content edits to any product record)
- [ ] the resolver script from phase 1.1 still prints nothing for scripts/

CONSTRAINTS (apply to every task)
- NEVER run tsc, next build, next lint, eslint, tests, a dev server, npm install/ci, curl against the dev server, any catalogue/proof script, or any other build/check command. Verify with git, grep and the throwaway resolver only. The owner verifies in PR review.
- No $(...) or backticks in shell commands. One command at a time. No subagents.
- Move with git mv only; never edit a product record.
- Edit only files under OWNS; if a task seems to need another file, STOP and report.
- Print paths as file:// URIs in your reports.
