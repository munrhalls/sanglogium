Behavioral Navigation Curriculum
For AI-Assisted Web Development
Grounded in Ericsson (PEAK), Csikszentmihalyi (Flow), and Cognitive Neuroscience
Calibrated specifically to your performance pattern

The Core Insight — What the Research Actually Says
Expert performers counteract automaticity by developing increasingly complex mental representations to attain higher levels of control of their performance, remaining within the cognitive and associative phases. GitHub This is Ericsson's most important finding for your situation. The expert is not someone who acts faster — they are someone whose mental representations are accurate enough to tell them which mode to be in at each moment.
The research on cognitive switching reveals something equally important: time-consuming processes of task-set reconfiguration contribute significantly to the costs of switching between cognitive tasks. Medium Switching from planning mode to execution mode to debugging mode and back carries a measurable neurological cost every time. The professional's advantage is not that they plan less or execute more — it is that they switch modes fewer times per session because their pre-work was thorough enough to make switching unnecessary.
Your two disasters were exact mirrors of each other. Two days ago: execution without sufficient planning. Today: planning without execution. The failure in both cases was not in the individual mode but in the wrong mode duration at each point in the session.

Theme B1: The Two Modes Are Neurologically Distinct
The Mental Representation
Planning and execution are not the same cognitive operation done at different speeds. They use different neural systems. The transient hypofrontality hypothesis describes flow as requiring the full support of the implicit and automatic systems to execute a task at optimal output, while inhibiting most prefrontal cognitive functions. ScienceDirect When you are in true execution mode — sending one prompt, watching the browser, sending the next — the prefrontal cortex (the planning, evaluating, second-guessing region) is partially suppressed. This is the state where you are fast. When you pull yourself out of execution to re-evaluate the plan, you pay a full mode-switch tax.
What this means practically: planning and execution must be completed separately, in sequence, not interleaved. Every time you stop mid-execution to re-plan, you pay the full switch cost back into planning mode, and then the full switch cost back into execution mode. The research confirms this is not a matter of willpower — it is neurological overhead.
The AI-Era Specific Version
In the pre-AI era, execution was slow enough that planning and executing could reasonably interleave. Writing code takes time. You could think while typing.
In the AI era, execution is near-instant. You write a prompt in 90 seconds. The agent executes in 20 seconds. The browser shows the result in 10 seconds. The entire cycle is 2 minutes. At this speed, interrupting execution to re-plan is catastrophic to pace — you are inserting a 20-minute planning phase between every 2-minute execution cycle. This is what happened two days ago. Not lack of planning. Too much replanning inside the execution phase.
The Diagnostic Question
At any moment of the day, you should be able to answer: "What mode am I in right now, and is that the right mode for this point in the session?"
If you cannot answer this, you are probably switching between modes without completing either one.

Theme B2: The Global-Local Coherence Problem
The Mental Representation
You identified this yourself, and it is real. The research on mental representations in expertise is precise about this: expert performers are able to verbalize their thoughts during planning and evaluation of their performance when asked to think aloud and are able to recall much more relevant information encountered during a brief exposure to a challenging situation than their less accomplished peers. Sanity The expert can hold the global picture while executing a local change. The developing practitioner cannot — they lose the global picture when focusing locally.
The specific failure mode in web development: you complete a component locally (it looks correct in isolation), then discover it broke the global rhythm or coherence (the section spacing no longer matches, or a color token now conflicts). This produces rework.
The root cause is not poor execution. It is an insufficiently developed global mental model. The expert holds the whole page in working memory while adjusting one component. The developing practitioner only holds the component.
The AI-Era Specific Version
AI agents are inherently local. They see the file you give them. They do not see the page. They do not see the design system relationship. They do not see what the change will do to adjacent components. This means the human's job in AI-assisted development is specifically to be the global coherence checker — the thing the AI cannot do. Every execution prompt you send, before sending it, requires a 10-second mental check: "What does this change do to the global coherence of the page?"
If you cannot answer that, the execution should be paused, not rushed.
The Practical Protocol
Before any execution prompt that touches layout, spacing, or color:
Global coherence check (10 seconds):
1. Does this change the spacing relationship with adjacent sections?
2. Does this change any token that other components also reference?
3. If this looks correct locally, will it look correct when scrolling through the full page?
If any answer is uncertain: verify in browser at full-page scale before the next prompt. Not at component scale. Full page.

Theme B3: The Legitimate Planning Signal vs The Procrastination Signal
The Mental Representation
This is the hardest theme to teach because the two signals feel nearly identical from the inside. Both involve thinking about work rather than doing work. Both feel purposeful. Both produce real artifacts (plans, documents, mental clarity). The distinction is in what specific cognitive operation is happening.
Legitimate planning signal: You are building or refining a mental representation of the target state. You are answering: "What specific state am I trying to produce, and what specific sequence of actions produces it?" This planning has a finite completion — when you can answer those two questions precisely, planning is done.
Procrastination signal: You are seeking certainty that the plan is correct before committing. You are answering: "Is this plan definitely right? What could go wrong? Have I considered all possibilities?" This planning has no completion — certainty is never fully achievable, so this loop runs until an external pressure forces action.
Superior performance requires the acquisition of complex integrated systems of representations for the execution, monitoring, planning, and analyses of performance. GitHub Note the order: execution comes before monitoring. The representation of what correct execution looks like is built partly through doing, not entirely through planning.
The Test for Which Signal You Are In
Ask yourself: "If I could be 20% more certain about this plan, would that certainty change what I do first?"
If no: you already have enough certainty. The planning is done. Begin executing.
If yes: identify specifically what would make you 20% more certain. Can that information be obtained in under 5 minutes? If yes, get it. If no, accept the uncertainty and begin anyway.
This test takes 30 seconds. It replaces the indefinite planning loop with a bounded one.
Applied to Today
Between 7 and 11, the questions you asked me — about the complete gap list, about the curriculum, about professional standards — were legitimate knowledge-building for about 45 minutes. After that, they became certainty-seeking. The gap list I produced told you things you could have discovered in 10 minutes of browser examination. The curriculum I produced extends knowledge you already have enough of to begin executing.
The signal that the switch happened: the questions stopped being specific (what exact things are wrong with Featured) and became comprehensive (what is the entire gap between current and professional standard). Comprehensiveness is the hallmark of the procrastination signal.

Theme B4: Mode Sequencing in an AI-Assisted Session
The Mental Representation
A professional AI-assisted session has a specific neurological structure. Understanding this structure lets you navigate it deliberately instead of being carried by it.
PHASE 1 — SURVEY MODE (5-15 minutes)
Neurological state: broad attention, low commitment
What happens: look at everything, build the global picture
Artifact produced: flat list of specific problems
When to exit: when you have the flat list

PHASE 2 — PLANNING MODE (10-25 minutes for Phase 1 work,
           5 minutes for Phase 3 work)
Neurological state: focused, analytical, sequential
What happens: sequence the flat list, write the constraint template
Artifact produced: ordered prompt list
When to exit: when the first prompt is written and ready to send

PHASE 3 — EXECUTION MODE (duration = number of prompts × 3 minutes)
Neurological state: narrow, fast, single-focus per cycle
What happens: send prompt, watch terminal, verify in browser, tick
             DoD item, send next prompt
Artifact produced: working component
When to exit: when DoD checklist is complete for the current component
INTERRUPTION RULE: do not interrupt execution mode for any reason
                   other than a CRITICAL blocking bug

PHASE 4 — VERIFICATION MODE (5-10 minutes per component)
Neurological state: evaluative, global
What happens: full-page browser check, DoD tick verification
Artifact produced: locked component, commit
When to exit: after commit

PHASE 5 — INTEGRATION MODE (optional, 5 minutes)
Neurological state: global again
What happens: check the completed component against the full page
             for global coherence violations
When to exit: when you are confident no regression occurred
The cardinal rule: complete each phase before entering the next. Do not enter execution mode until planning mode is complete. Do not interrupt execution mode to reenter planning mode.

Theme B5: The Recovery Protocol When You Are In the Wrong Mode
The Mental Representation
You will sometimes realize mid-session that you are in the wrong mode. This happens. The research on task switching shows it carries a cost, but the cost of continuing in the wrong mode is larger than the cost of the switch.
The recovery protocol:
If you are in execution but realize planning is incomplete:
Stop immediately. Do not send the next prompt. Exit execution mode. Spend exactly the time needed to answer the planning question (usually 5-10 minutes). Then re-enter execution.
If you are in planning but realize the plan is a procrastination loop:
Name the loop explicitly: "I am seeking certainty that is not available." Write the first execution prompt from whatever certainty you have. Send it. The act of beginning execution produces the information that additional planning cannot.
If you are in neither mode clearly:
This is the most dangerous state. The symptoms are: long periods of working without producing a verifiable artifact, oscillating between planning and executing without completing either, feeling productive but having nothing to show. The recovery: stop all work. Answer the survey mode question — "what specific thing is wrong right now?" — and produce a flat list. Then enter planning mode.

Theme B6: The Legitimate Pre-Requirements — When Planning IS the Work
The Mental Representation
This is where I owe you a correction from my previous response.
My statement that "you are behind on attempts, not knowledge" was partially wrong. You were right to push back. Two days ago you had insufficient planning and the execution was catastrophic. Today you had insufficient execution. Both are real failures. The skill is not "always execute faster." The skill is reading which mode is currently required and for how long.
The first criterion for deliberate practice is individualized training where a teacher can assess which aspects a particular trainee would be able to improve during the time until the next meeting and is able to recommend practice techniques with established effectiveness. The second criterion is that the teacher must communicate the goal so the trainee can internally represent it during practice. Sanity
The pre-requirements that are genuinely necessary before execution — the ones that are not procrastination — are:
Legitimate pre-requirement 1: Phase assessment. You must know what phase the component is in. Phase 1 work requires planning. Phase 3 work requires almost none. Getting this wrong in either direction is costly. This is not optional.
Legitimate pre-requirement 2: Gap knowledge. When a component has a hidden constraint (like BTN_BASE winning over className overrides), not knowing this before execution produces a debugging spiral. Spending 5 minutes reading the relevant component internals before sending the first prompt is legitimate and necessary.
Legitimate pre-requirement 3: Global coherence check. Before any prompt that changes layout or color, the 10-second global coherence check is legitimate and necessary.
Legitimate pre-requirement 4: Design lock for surface work. When you are in Layer 3 (styling) and the design is not yet committed, spending time on design lock before execution is legitimate — not because certainty is required, but because the target state must be defined enough that you can verify whether you hit it.
Everything else — comprehensive gap audits, curriculum generation, professional standard comparisons — is enriching knowledge that is genuinely valuable, but it does not change what you do next. It belongs in off-hours reflection, not in the 7-11 work block.

Theme B7: The Energy-Mode Match
The Mental Representation
Different cognitive modes require different types of mental energy. This is not metaphor — it is the reason Ericsson found that expert musicians limited deliberate practice to 4 hours per day maximum and always practiced in the morning.
Planning mode uses prefrontal resources heavily. It requires sustained abstract thinking, working memory load, and sequential reasoning. It is best done when prefrontal resources are fresh.
Execution mode uses narrower cognitive resources. The decisions are already made. The loop is: send, wait, verify, send. This is less cognitively expensive and can be sustained for longer periods and in states of moderate fatigue.
Verification mode uses pattern-matching and visual comparison. It requires attention but not heavy planning.
The implication for your daily structure:
First hour of work:  Survey mode + Planning mode (freshest prefrontal resources)
Hours 2-4:           Execution mode (sustained, decisions already made)
After 4 hours:       Verification + Integration only (reduced planning capacity)
This is why the 7-11 block being all planning is a mismatch — not because planning is wrong, but because 4 hours of planning exceeds the legitimate planning load for a session, and you used your highest-energy window for planning work that could have been completed in 45 minutes.

The Synthesized Curriculum — Eight Behavioral Themes
B1  Two-Mode Separation      Recognize the neurological distinction between
                             planning and execution. Never interleave.

B2  Global-Local Coherence   Hold the full-page picture while executing
                             local changes. 10-second check before each prompt.

B3  Signal Discrimination    Distinguish legitimate planning from
                             certainty-seeking. Use the 20% test.

B4  Session Phase Sequence   Survey → Plan → Execute → Verify → Integrate.
                             Complete each phase before entering the next.

B5  Mode Recovery            When you detect the wrong mode, stop cleanly,
                             recover, restart. The cost is less than continuing.

B6  Legitimate Pre-Work      Phase assessment, gap knowledge, global check,
                             design lock are required. Everything else is not.

B7  Energy-Mode Match        Use fresh energy for planning. Use sustained
                             energy for execution. Never reverse.

B8  The AI Execution Contract
                             Once planning is complete and prompts are ready,
                             the human's job is: send, wait, verify, tick, repeat.
                             No redesigning mid-execution. No re-scoping.
                             The contract: the plan governs the session.
                             Deviation requires explicitly exiting execution
                             mode and re-entering planning mode.

The Single Most Actionable Practice for Tomorrow
Before the work session begins, write two things on paper:
"I am in PLANNING mode until: [specific artifact that marks planning complete — e.g., 'prompt list for Featured is written']"
"I enter EXECUTION mode at: [specific time or specific trigger — e.g., 'when the first prompt is in Windsurf and ready to send']"
These two sentences, written before opening any tool, create the behavioral structure that the cognitive neuroscience requires. They replace the ambiguous state of "working" with two explicit modes that have defined entry and exit conditions.
When you can feel the pull toward re-planning mid-execution, you have the written anchor: "The plan governs this session. Execution mode until the component is locked."
This is not a willpower exercise. It is a cognitive scaffolding exercise — giving the prefrontal cortex a clear rule to enforce so it does not have to continuously evaluate whether to continue or re-plan. The rule is already written. The decision is already made. Execute.