# Commit Taxonomy Operationalization

## Problem Statement

73% of commits do not close DoDs (Definition of Done items), resulting in:
- Configuration theater (documentation without fixes)
- Illusory velocity (commits without forward progress)
- Analysis paralysis (unbounded scope exploration)

**Evidence:** `GIT_COMMIT_VELOCITY_AUDIT.md:98` — 2,117 commits analyzed, only 27% actual forward progress

---

## New Rule

**All "A" category commits (Actual Work) MUST include `closes D[N]` marker.**

Examples:
```
A300 fix: Resolve carousel navigation delay — closes D2, D3
A100 feat: Add VFS context template — closes D1
A200 refactor: Extract product card component — closes D5
```

---

## Commit Template

```
[CODE] [type]: [Description] — closes D[N], D[N]

[Optional body explaining implementation details]
```

### Categories

| Code | Meaning | Requires closes D[N] |
|------|---------|---------------------|
| A100 | Feature/Addition | YES |
| A200 | Refactoring | YES |
| A300 | Bug Fix | YES |
| C100 | Configuration | NO |
| D100 | Documentation | NO |
| P100 | Polish/Visual | NO |
| T100 | Test Only | NO |

---

## Verification

### Check Recent Commits for Compliance
```bash
# Count commits with DoD markers
git log --oneline --since="2026-03-01" | grep -c "closes D" || echo "0"

# List non-compliant A-category commits
git log --oneline --since="2026-03-01" | grep "^A" | grep -v "closes D"
```

### Target Metrics

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| DoD-closing commits | 27% | 70%+ | `git log --grep="closes D"` |
| A-category compliance | N/A | 95%+ | Manual audit monthly |
| Sprint completion rate | Low | High | DoD completion tracking |

---

## Enforcement

### Sprint Level
- Sprint specs MUST include numbered DoDs (D1, D2, D3...)
- Sprint review verifies `closes D[N]` in commit history
- Incomplete DoDs = sprint not complete

### PR Level  
- PR template includes: "Which DoDs does this close?"
- Reviewer checks for `closes D[N]` in commit messages

### Commit Level
- Pre-commit hook warning (optional): "A-category without closes D[N]"
- CI check: Flag A-category commits without DoD markers

---

## Impact

| Bottleneck | Before | After |
|------------|--------|-------|
| Config theater | 73% overhead | Reduced to <30% |
| Velocity tracking | Illusory | Accurate |
| Sprint planning | Unbounded | DoD-constrained |

---

## References

- `_project/research/GIT_COMMIT_VELOCITY_AUDIT.md`
- `_project/lessons/auto-lessons.md` (Lessons 5-6)
- `.windsurf/workflows/sprint.md`
