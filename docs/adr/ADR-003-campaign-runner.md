# ADR-003: Campaigns Run Through the Campaign Runner

## Status
Accepted

## Date
2026-10-05

## Context

An architect plans work as thematic axes, each an ordered list of phase files, and executor agents carry out the phases. Axes that depend on each other ran in waves. At every wave boundary the owner relaunched executors by hand and merged one PR per axis. Execution was parallel inside a wave, but wall-clock time was set by the manual relaunching. The per-axis PRs added review steps that had no review value.

## Decision

A deterministic script with no AI, `~/work/global/workflow/run-campaign.mjs`, runs each campaign:
- The architect writes `_project/working-memory/run-order.json`, which maps each axis to the axes it needs.
- Each phase runs as a fresh headless executor process. The phases of one axis run one at a time, in order.
- An axis starts once every axis it needs is merged into `<campaign>/integration`, and it branches from that branch's tip.
- A finished axis merges only when there is no conflict and `node tools/check-turn.mjs --all` passes.
- A STOP, a conflict or a failed check stops that axis and every axis that needs it. Rerunning the command resumes.
- When every axis is merged, the runner opens one PR per campaign. Executors never sync, push or open PRs.
- `main` requires a PR, and the rule applies to admins too.

## Consequences

- Campaigns run as fast as their dependencies allow. The owner starts one command and reviews one PR.
- The rules are enforced by code, not by prompts.
- The remaining risk is a dependency missing from `run-order.json`. Phase preconditions and the merge gate catch it.
- The runner was accepted after a throwaway acceptance test, PR #103, which was closed without merging.
