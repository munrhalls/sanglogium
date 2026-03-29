# _project Directory

Project management workspace for Sang Logium development.

## Structure

```
_project/
├── sprints/
│   ├── active/        # Current sprint TODOs (kebab-case)
│   └── backlog/       # Future sprints
├── bugs/
│   └── active.md      # Current bug tracking
├── lessons/           # Project lessons learned
├── scope/
│   └── TEMPLATE.md    # Sprint scope contract template
├── audits/            # Audit reports
│   └── archive/
├── COMMANDS/          # AI command workflows
├── _archive/          # Archived/abandoned work
└── master-tasklist.todo  # Daily driver
```

## Naming Convention

- **All files/folders**: kebab-case (e.g., `homepage-testing-sprint.todo`)
- **Exceptions**: `_archive/`, `_index.md` (system prefixes)

## Adding New Sprints

1. Copy `scope/TEMPLATE.md`
2. Create in `sprints/active/{sprint-name}.todo`
3. Follow sequential DoD pattern
