Token Cost Analysis
Within same conversation window:

Each subsequent prompt includes the full conversation history (all previous messages, tool calls, outputs)
Token cost = new prompt + entire accumulated context
Example: If first prompt costs 5K tokens, second prompt costs ~5K (new) + 5K (history) = ~10K tokens
New conversation window:

Fresh start with zero history
Token cost = only the new prompt itself
Same request = ~5K tokens (no accumulated baggage)
Multiplier difference:

Subsequent requests in same window: ~2-3x more expensive per request (linear accumulation)
After 5 requests in same window, you're burning ~5x the tokens vs. a fresh window
New window per request: Baseline cost, no multiplier
Significant Ways to Lower Token Burn
1. Use new windows strategically (biggest impact)

Start fresh window when task is complete or context is no longer needed
You're doing this well by committing work between sprints
2. Minimize context in requests

Don't paste entire files; cite line ranges instead (file.tsx:30-50)
Use code_search to find relevant sections rather than reading whole files
Ask focused questions instead of broad ones
3. Batch related work

Group similar fixes/changes in one window before committing
Reduces window switches (each switch = new context cost)
4. Use memory strategically

Store important architectural decisions, patterns, or recurring context in memory
Retrieve once, reference many times (saves re-explaining)
5. Avoid verbose outputs

Request concise responses ("brief summary only")
Skip explanations for routine changes
6. Leverage tool efficiency

Use multi_edit for multiple changes to same file (1 tool call vs. many)
Use code_search to pinpoint locations before reading files
Batch independent tool calls in parallel
Your Current Pattern
You're already doing well—committing after each sprint closes the window naturally. The arrow removal + image fix work you just completed is a good example of batching related work before commit.

Recommendation: Continue closing windows after sprint items are complete. For long exploratory tasks, consider saving findings to a workspace file (like your COMMIT_TEMPLATE.txt) to avoid re-explaining context.