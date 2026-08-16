# No Parallel Fallback Commands

## Rule

Never launch a "real" command and a fallback/duplicate command in parallel.

## Enforcement

- Run one command at a time.
- Wait for its result.
- Then decide the next step.

## Tool Availability Verification

If you are unsure whether a CLI is installed, verify first with a single check:

- `which <command>` on Unix
- `Get-Command <command>` on PowerShell
- `<command> --version`
- `<command> --help`

Do not launch a fallback alongside the main command.

## Rationale

Preemptive parallel fallbacks waste time, create race conditions, and force the user to cancel redundant work. This rule applies to every agent session on this repository.
