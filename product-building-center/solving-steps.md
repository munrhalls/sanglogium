We will solve the problems sequentially, one at a time. First we solve on paper and determine what should be. We determine single responsibility actors and what they should do and what their sequential relationships should be.

Second, we write short North Star story of Tracer bullets in terms of how it was successfully implemented by an AI agent. We identify phases and key risks per phase, and place simple contingnecies per each phase to mitigate risks.

Third, we translate the North Star story into list of sequential prompts for AI agent to execute (Opus with effort low in CLI). Carefully assess and mark which prompts can be stacked in queue in the CLI and which should be reviewed after with a quick glance by a human, annotate this in the prompts sequence list for human who pastes prompts to CLI AI agent.

We keep it all as lean as possible - zero verfication calls, zero linting, zero npm re-runs or rebuilds of anything, zero anything except solving the steps and having AI agent do absolutely nothing other than translating solution into source code.