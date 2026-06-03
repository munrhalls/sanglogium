---
description: Index and organize organic learning lessons from real-time sessions into thematic folders
---

# /Learn-Organically-Index Command Protocol

**Role:** Organic Learning Archivist + Thematic Curator

**Purpose:** Process raw organic learning sessions from date folders and organize them into thematic folders without touching the original content.

---

## System Directive

1. **Preserve Organic Content**: Date folders and their files are NEVER modified
2. **Extract Themes**: Identify patterns and create thematic summaries
3. **Cross-Reference**: Link themes to original sessions
4. **Update Index**: Maintain searchable thematic organization

---

## Execution Protocol

### Phase 1: Scan Date Folders (2 minutes)

**Identify Sessions:**
```bash
# Find all session files
find _training/real-time -name "*.md" -path "*/YYYY-MM-DD/*"
```

**Extract Metadata:**
- Date from folder name
- Time range from filename
- Duration from content
- Key themes from content

### Phase 2: Thematic Analysis (3 minutes)

**Pattern Recognition:**
Read each session and identify:
- Mental state techniques
- Cognitive load strategies
- Work mode patterns
- Interference management
- Rhythm building
- Problem analysis approaches

**Theme Mapping:**
```markdown
| Pattern | Theme Folder | Example |
|---------|--------------|---------|
| "heart breathing" | themes/mental-state/ | Presence technique |
| "lay of the land" | themes/cognitive-load/ | Info gathering |
| "tiny writing" | themes/work-modes/ | Focus technique |
| "toxic thoughts" | themes/interference-management/ | Mental filtering |
| "reg min distances" | themes/rhythm-building/ | Work rhythm |
| "huge failure" | themes/problem-analysis/ | Pattern recognition |
```

### Phase 3: Create Thematic Summaries (3 minutes)

**For Each Theme:**
1. **Check if exists**: `themes/[theme]/[pattern].md`
2. **If not exists**: Create new thematic lesson
3. **If exists**: Update with new insights
4. **Cross-reference**: Add link to original session

**Template:**
```markdown
# [Theme]: [Pattern Name]

**Date:** YYYY-MM-DD
**Source:** Real-time sessions
**Severity:** [Critical/High/Medium/Low]
**Frequency:** [One-time/Recurring/Systemic]

## Pattern Description
[Extracted from organic sessions]

## Session References
- [YYYY-MM-DD HH--MM to-HH-MM](../../YYYY-MM-DD/HH--MM to-HH-MM.md)
- [Additional sessions...]

## Key Insights
[Distilled wisdom from multiple sessions]

## Application Rules
[Actionable guidance]

## Keywords**
["keyword1", "keyword2", "keyword3"]
```

### Phase 4: Update Index (2 minutes)

**Update INDEX.md:**
- Add new themes if discovered
- Update keyword lists
- Add session count
- Update last modified date

**Update README.md:**
- Document new patterns
- Update usage examples
- Add integration notes

---

## Quality Standards

### Organic Preservation Rules
- **NEVER** modify date folders
- **NEVER** edit session files
- **NEVER** change original content
- **ALWAYS** preserve exact wording

### Thematic Organization Rules
- **DO** extract patterns accurately
- **DO** maintain original meaning
- **DO** add cross-references
- **DON'T** add personal interpretations

### Indexing Rules
- **DO** maintain keyword consistency
- **DO** update session counts
- **DO** add new themes as discovered
- **DON'T** remove old themes

---

## Command Flow

```
/learn-organically-index

Phase 1: Scan
  |- Find all session files
  |- Extract metadata
  |- List themes found

Phase 2: Analyze
  |- Pattern matching
  |- Theme assignment
  |- Cross-reference planning

Phase 3: Summarize
  |- Create/update theme files
  |- Add session links
  |- Distill insights

Phase 4: Index
  |- Update INDEX.md
  |- Update README.md
  |- Verify completeness
```

---

## Example Output

After running command:
```
Scanned: 2 sessions
Themes identified: 6
New lessons created: 6
Cross-references added: 12
Index updated: Yes
```

---

## Integration Points

This command supports:
- `/organic-learn` - Raw capture workflow
- `/learn` - Codified lesson system
- Memory system - Context retrieval
- Workflows - Process improvements

---

*Version: 1.0*
*Created: 2026-04-09*
*Principle: Organic preservation + Thematic organization*
