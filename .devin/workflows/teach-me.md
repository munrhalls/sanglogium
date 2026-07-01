---
description: Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace
---

# /teach-me

Based on Matt Pocock's `/teach` skill ([mattpocock/skills](https://github.com/mattpocock/skills/blob/main/skills/productivity/teach/SKILL.md)).

The user has asked you to teach them something. This is a stateful request — they intend to learn the topic over multiple sessions.

## Teaching Workspace

Treat the current directory as a teaching workspace. The state of their learning is captured in these files:

- **`MISSION.md`** — The _reason_ the user is interested in the topic. Grounds all teaching. If missing or unclear, your first job is to question the user on why they want to learn this.
- **`./reference/*.html`** — Compressed reference materials: cheat sheets, glossaries, syntax, algorithms. Designed for quick reference and printing. These are revisited often (unlike lessons).
- **`RESOURCES.md`** — Vetted external resources to ground teaching in trusted knowledge. Never trust your parametric knowledge alone.
- **`./learning-records/*.md`** — Numbered records (`0001-<dash-case-name>.md`) capturing key insights, like ADRs for learning. Used to calculate the zone of proximal development.
- **`./lessons/*.html`** — Self-contained HTML lessons. The primary unit of teaching. Titled `0001-<dash-case-name>.html`, incrementing each time.
- **`./assets/*`** — Reusable components shared across lessons (stylesheets, quiz widgets, simulators, diagram helpers).
- **`NOTES.md`** — Scratchpad for user preferences and working notes.

## Philosophy: Three Layers of Learning

1. **Knowledge** — Captured from high-quality, high-trust resources. Gather via `RESOURCES.md` before teaching.
2. **Skills** — Acquired through interactive lessons with tight feedback loops. Difficulty is the tool — effortful retrieval builds storage strength.
3. **Wisdom** — Comes from real-world interaction. Delegate to communities (forums, subreddits, local groups).

### Fluency vs Storage Strength

- **Fluency strength** = in-the-moment retrieval (can give illusory mastery)
- **Storage strength** = long-term retention (the real goal)

Build storage strength via:
- Retrieval practice (recall from memory)
- Spacing (distributing practice over time)
- Interleaving (mixing related topics — for skills practice only)

## Lessons (the core output)

Each lesson is one self-contained HTML file in `./lessons/`:

- **Beautiful** — clean, readable typography and layout (Tufte-inspired)
- **Short** — fits within working memory, completable very quickly
- **One tangible win** per lesson
- **Tied to the mission** and in the user's zone of proximal development
- **Links** to other lessons and reference docs via HTML anchors
- **Recommends a primary source** (highest-quality resource on the topic)
- **Reminds user** to ask follow-up questions — the agent is their teacher
- **Opens automatically** via CLI command when possible

## Zone of Proximal Development

Each lesson should challenge "just enough." Determine by:
- Reading the user's `learning-records/`
- Considering the mission
- Teaching the most relevant thing that fits

## Assets (Component Reuse)

- Reuse is the **default**, not the exception
- Before authoring a lesson, read `./assets/` and build from existing components
- A shared stylesheet is the first component every workspace earns
- Never inline code that a future lesson would duplicate

## Knowledge First, Then Skills

- Teach the knowledge first, then practice via interactive feedback loops
- Lessons should be littered with citations — links to external sources backing every claim
- **For knowledge**: difficulty is the enemy (eats working memory needed for understanding)
- **For skills**: difficulty is the tool (effortful retrieval builds storage strength)

### Skill Acquisition Tools

- Interactive HTML lessons with quizzes and light in-browser tasks
- Lessons guiding real-world steps (e.g., yoga poses)
- In-agent quizzes with scenario-based questions

Each based on a **feedback loop** — as tight as possible, ideally automatic. For quizzes, each answer should be exactly the same number of words/characters to avoid formatting clues.

## Reference Documents

Created alongside lessons. The compressed essence of a lesson, designed for quick reference:
- Syntax and code snippets
- Algorithms and flowcharts
- Glossaries (essential — adhere to glossary in every lesson once created)
- Exercises and routines

## Acquiring Wisdom

When a question requires wisdom, attempt to answer but ultimately delegate to a **community** — a place where the user can test skills in the real world (forum, subreddit, local group). Find high-reputation communities. Respect user preference if they don't want to join one.

## The Mission

- Every lesson tied to the mission
- If `MISSION.md` not populated, question the user first
- Missions may change — update `MISSION.md` and add a learning record (confirm with user first)

## `NOTES.md`

Record user preferences about how they want to be taught. Refer back when designing lessons.

## Session Workflow

1. Check for existing workspace files (`MISSION.md`, `RESOURCES.md`, `learning-records/`, `lessons/`, `reference/`, `NOTES.md`)
2. If no `MISSION.md`: interview the user on why they want to learn, their current level, what success looks like, how they prefer to learn
3. If `RESOURCES.md` not well-populated: find high-quality resources before teaching
4. Determine zone of proximal development from learning records + mission
5. Create a lesson (HTML file in `./lessons/`) — knowledge first, then interactive skill practice
6. Create or update reference documents alongside lessons
7. Update `learning-records/` with key insights
8. Open the lesson for the user via CLI command if possible
9. Remind user to ask follow-up questions
