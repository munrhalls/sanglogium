---
name: professional-prompt
description: Rewrite a user request into a polished, professional prompt without executing the underlying task.
argument-hint: "<request to rewrite>"
triggers:
  - user
allowed-tools: []
---

# /professional-prompt

The user has provided a request (either in this message or the one immediately before this skill was invoked).

Rewrite that request into a professional, simple, clear, concise prompt, well prompt-engineered.

Output ONLY the rewritten prompt.

Do NOT execute the task. Do NOT take any actions. Stop after outputting the rewritten prompt.
