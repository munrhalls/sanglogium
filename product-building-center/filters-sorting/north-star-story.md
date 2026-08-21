# North Star Story — Filters & Sorting, Built as Lego Blocks

*Stack context: Next 15, React 19, nuqs, Sanity CMS*

This is the plain-English story of how this feature is meant to come together: which actor owns which single responsibility, and how to prove — at any point during the build — that the responsibilities never blurred together. Read this before starting work in `actors/`.

**Chapter One — The Tangled Castle**

Once, everything lived in one knot of code — the filter checkboxes, the sort dropdown, the product list, even how fast things showed up on screen. Nothing could move without something else breaking. The agent looked at it and said: this needs to become separate actors, each with exactly one job, snapping together like Lego — not knitted into one scarf.

**Chapter Two — Naming the Actors**

Four actors were named, and each was given one job and one job only:

- **Filters & Sorting** — the sidebar, checkboxes, sliders, sort dropdown. Its only job: turn user interaction into the URL, and always show itself as a true reflection of whatever the URL currently says.
- **The URL** — the address bar and browser history. The single shared source of truth that every other actor reads from, but that only Filters & Sorting is allowed to write to.
- **The Product Grid** — the list of products on screen. Its only job: watch the URL and display matching results, arriving progressively rather than all at once.
- **The Server** — supplies the Product Grid with results in a way that supports arriving progressively rather than as one dumped wall.

No actor is allowed to reach into another's job. They only ever meet at the URL.

**Chapter Three — Keeping What Was Already Right**

Before knocking the old castle down, the agent looked closely at it one more time. Its wiring was tangled, but its look was not — the colors, spacing, checkbox states, slider tracks, and sidebar card all matched the site's own design system already. So the agent wrote down exactly what looked right, plainly, in a style guide, so nothing about the correct appearance would be lost or reinvented from scratch. The new Lego blocks would carry that same look forward, matching the site's design system precisely — only the tangled wiring underneath was being rebuilt, never the visual identity.

**Chapter Four — The Lean Rule: A Few Seconds of Looking Beats an Expensive Command**

Before the first block was ever built, the agent set one more rule, and treated it as seriously as any of the others: while a tracer bullet is still standing itself up, the only verification that counts is a human glancing at the running page for a few seconds and saying "yes, that's right" or "no, that's wrong."

Nothing else was allowed to substitute for that glance — not a type check, not a linter pass, not a full build, not a test suite. Not because those tools are worthless, but because at this stage they are simply the wrong tool, and worse than useless: they cost real minutes, they run long after the moment they could have caught something cheaply, and they bury the one signal that actually mattered — did the block just built look and behave correctly, right now — under a pile of unrelated noise. A feature built this way carries fat: extra steps that feel like diligence but arrive too late to change anything, pile up as complications, and turn a five-second answer into a five-minute wait for nothing. Every one of those unnecessary commands is a small tax paid against the very leanness that makes tracer bullets work in the first place.

So the rule stayed simple: stand up one tiny block, let a human look at it running for a few seconds, get a yes or a no, then move to the next block. Only once real tracer bullets are standing end to end does it ever make sense to reach for anything heavier — and even then, only if the task actually needs it, never as a reflex.

**Chapter Five — Building in the Open, One Block at a Time, With a Human Checkpoint After Each**

The agent built each actor's blocks one at a time, in plain sight, checkable by eye before moving on, each one styled exactly as the style guide from Chapter Three described. First the sidebar shell — built, then shown to a human for a few seconds, confirmed. Then checkboxes — built, shown, confirmed. Then sliders — built, shown, confirmed. Then the sort bar — built, shown, confirmed. Each checkpoint asked the same two questions a human could answer at a glance: does this look cohesive with the rest of the site, and does it actually appear correctly, right now, on the running page? No block moved forward on the agent's own say-so alone. The answers were always yes — because Filters & Sorting never touched how results were fetched or displayed, it never drifted from the design system, and nothing about confirming it required anything more than looking at it.

**Chapter Six — Filters & Sorting's Only Job: The URL, In Both Directions, Instantly

Filters & Sorting learned to do exactly two things, and nothing more. First: when the person clicks a checkbox, drags a slider, or picks a sort order, it writes that choice into the URL. Second: whatever the URL currently says — however it got that way — is exactly what the sidebar shows, checkboxes checked, sliders positioned, sort selected. This second rule is what makes the back and forward arrows "just work": since browser history is built from real URL changes, clicking back or forward changes the URL, and Filters & Sorting simply redraws itself to match, the same as it would for any other URL change.

Because these two steps — write the URL, redraw from the URL — never wait on anything else, they happen instantly, every time. A person clicking five checkboxes in one second sees all five check marks respond immediately, one after another, with no delay and no stutter. Filters & Sorting never pauses to check whether results have arrived, whether they're still loading, or whether the last URL change even finished being handled elsewhere. Its own responsiveness is never influenced, slowed, or blocked by anything happening in the Product Grid or the Server. That interactivity is entirely its own.

**Chapter Seven — The Product Grid's Only Job: Making Results Feel Like a Conversation, Even Under Rapid Fire**

Making results arrive immediately and then keep arriving, batch by batch, was never Filters & Sorting's job. That responsibility belonged entirely to the Product Grid, working together with the Server. The Product Grid watches the very same URL that Filters & Sorting writes to — never Filters & Sorting itself — and asks the Server for results matching that state. The Server hands results back in a way that lets the first batch show up right away while the rest continues streaming in behind it. Because both actors are reading the same URL, whatever streams in is always the correct answer to the filters and sorting currently chosen — never a stale batch left over from a moment ago.

And when the URL changes many times in rapid succession — a person dragging a slider back and forth, or clicking several checkboxes in a blink — handling that flood is the Product Grid's job alone, not Filters & Sorting's. It may wait a beat before reacting to avoid chasing every flicker, and it makes sure that any request no longer matching the latest URL is dropped or cancelled rather than left to finish. Only the request matching the newest URL is allowed to land on screen; the Server is never left doing work for a URL state that's already old news. Whatever the pace of clicking, the person always ends up seeing results that match exactly where they currently are — never a flash of outdated results catching up late.

**Chapter Eight — The Proof: Pulling a Block Out**

To be sure the separation was real and not just claimed, the agent ran a simple test in its head, in both directions.

First: imagine Filters & Sorting was deleted, or simply frozen and unable to change the URL. Would the Product Grid still work? Yes — completely. Give the Product Grid any URL, with any filters and sort already baked into it, and it streams the first batch immediately and the rest progressively after, exactly as before. It never asked Filters & Sorting for anything. It only ever asked the URL.

Second: imagine the Product Grid was deleted, or Filters & Sorting was placed on a page where no product grid existed at all. Would Filters & Sorting still work, and still look right? Yes — completely, instantly, and still perfectly matching the design system. Checkboxes would still check, sliders would still slide, clicking them would still update the URL immediately, and the sidebar would still redraw itself correctly and instantly from whatever the URL said. Its speed, interactivity, and appearance would be identical to before, because none of it was ever borrowed from the Product Grid in the first place.

Both halves of the proof had to hold, by definition, for the separation to be real. If either one had broken — if the grid needed the sidebar to fetch results, or the sidebar's responsiveness dipped whenever the grid was busy streaming — that would mean a hidden thread still tied them together, and the Lego blocks would secretly be a knitted scarf again.

**Chapter Nine — Clearing the Slate**

"Clear all" is Filters & Sorting doing its one job once more: it resets the URL to its empty state, instantly. That's all it does. The Product Grid, watching that same URL as always, notices the change and restreams fresh results from a clean start, cancelling anything stale still in flight. Neither actor needed to be told about the other — the shared URL carried the news, exactly as the proof in Chapter Eight said it would.

**Chapter Ten — Lego, Not Castle**

In the end, Filters & Sorting knows nothing about streaming, batches, debouncing, or the Server. The Product Grid and Server know nothing about checkboxes or sliders. The only thing connecting them is the URL — read by both, written by one. Each block can be lifted out, replaced, or rebuilt on its own, and the proof in Chapter Eight is what guarantees that's really true — and yet together they behave like one fast, professional feature, built lean, checked in seconds at every step rather than proven expensively too late: filters and sorting that look exactly as polished and on-brand as the rest of the site, respond instantly to every click, restore the right state with every back and forward arrow, and always show results arriving like a conversation instead of a wall, true to wherever the URL currently stands.
