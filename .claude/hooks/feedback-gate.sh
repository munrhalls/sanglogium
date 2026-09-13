#!/usr/bin/env bash
# PostToolUse reminder (non-blocking). Stdout is fed back to the model as context.
printf 'FEEDBACK GATE: >3 tool calls since your last user-visible checkpoint? Send one line now (done / next / blocker).\n'
