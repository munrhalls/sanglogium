---
description: Compress research and audit artifacts into load-bearing facts for Opus sprint generation
---

# /compress [FEATURE_NAME]

**Input:** Research artifacts (`_project/research/*.md`) + Audit report (`_project/sprints/01_audit_*.md`)
**Output:** `_project/sprints/02_compressed_[FEATURE_NAME].md` — token-optimized context for Opus sprint generation

---

## Philosophy

> **Opus doesn't need to discover. It only needs to decide and structure.**

The expensive part of Opus isn't output tokens — it's wasted input tokens on raw, uncompressed data that a cheap model could have pre-digested. This command is the compression layer that reduces Opus input by 10x while preserving 100% of decision quality.

**Load-bearing fact:** Any fact that, if missing or wrong, would cause the sprint doc to drift or the cheap executor model to fail.

---

## Execution Protocol

### Phase 1: Input Discovery (2 minutes)

**Goal:** Locate and catalog all research and audit artifacts for this feature.

**Actions:**
1. Scan `_project/research/` for files matching `[feature-name]` or related topics
2. Read `_project/sprints/01_audit_[FEATURE_NAME].md`
3. Identify codebase files referenced in audit
4. Build input manifest

**Output:**
```markdown
## Compression Input Manifest

| Source | File Path | Size (tokens est.) | Relevance |
|--------|-----------|-------------------|-----------|
| Research | `_project/research/nextjs-rsc-patterns.md` | ~2000 | Data fetching |
| Research | `_project/research/sanity-groq-best-practices.md` | ~1500 | Query patterns |
| Audit | `_project/sprints/01_audit_products-discovery.md` | ~1200 | Gap analysis |
| Codebase | `tailwind.config.ts` | ~400 | Design tokens |
| Codebase | `app/(store)/page.tsx` | ~300 | Existing patterns |
| **TOTAL RAW** | | **~5400** | |
| **TARGET COMPRESSED** | | **~500-800** | 10x reduction |
```

---

### Phase 2: Fact Extraction — Design System (3 minutes)

**Goal:** Extract exact tokens the sprint will reference. No prose, no explanation.

**Sources:** `tailwind.config.ts`, audit gap analysis, existing component patterns

**Output Format:**
```markdown
## C:DESIGN — Load-Bearing Tokens

### Colors (exact class names)
| Token | Value | Usage |
|-------|-------|-------|
| `bg-surface-card` | `#1a1a1a` | Product card background |
| `bg-surface-elevated` | `#242424` | Sidebar, elevated surfaces |
| `text-primary` | `#ffffff` | Headings, primary text |
| `text-secondary` | `#a0a0a0` | Metadata, descriptions |
| `border-subtle` | `#333333` | Card borders, dividers |

### Typography (exact class names)
| Token | Classes | Usage |
|-------|---------|-------|
| `type-heading-lg` | `text-2xl font-bold` | Page titles |
| `type-heading-md` | `text-lg font-semibold` | Card titles |
| `type-body` | `text-sm` | Descriptions |
| `type-overline` | `text-xs uppercase tracking-wider` | Section labels |

### Spacing (exact values)
| Token | Value | Usage |
|-------|-------|-------|
| `gap-grid` | `gap-4` | Product grid gaps |
| `px-section` | `px-6 lg:px-8` | Section padding |
| `py-card` | `p-4` | Card internal padding |

### Shadows/Elevation
| Token | Value | Usage |
|-------|-------|-------|
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.3)` | Product cards |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `radius-card` | `rounded-lg` | Cards |
| `radius-button` | `rounded-md` | Buttons |
```

**Extraction Rules:**
- **ONLY** tokens that appear in `tailwind.config.ts` or are verified in existing components
- **NO** suggestions for new tokens — if it's not in config, it doesn't exist
- **NO** prose about "consider using" — only "use this exact class"

---

### Phase 3: Fact Extraction — Component Patterns (3 minutes)

**Goal:** Map existing component patterns the sprint must align with.

**Sources:** Codebase scan of analogous components, audit spatial architecture

**Output Format:**
```markdown
## C:COMPONENTS — Existing Patterns

### Pattern: Product Grid (analogous: HomepageFeatured)
| Element | File | Key Pattern |
|---------|------|-------------|
| Grid container | `app/(store)/_components/FeaturedGrid.tsx` | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| Card component | `app/(store)/_components/FeaturedCard.tsx` | Image aspect `[4/3]`, title clamp 2 lines |
| Data fetch | `app/(store)/page.tsx` | `getFeaturedProducts()` returns `FeaturedProduct[]` |
| Type location | `types/product.ts` | `FeaturedProduct` interface |

### Pattern: RSC + Client Boundary
| Boundary | File | Rule |
|----------|------|------|
| Server Component | Page files | Data fetching, no hooks |
| Client Component | `*_client.tsx` | Interactivity, hooks allowed |
| Props passing | `Serializable only` | No functions, no class instances |

### Pattern: GROQ Queries
| Query Type | File | Pattern |
|------------|------|---------|
| Product list | `lib/sanity/queries.ts` | `*[_type == "product"]{_id, name, price, image}` |
| Image handling | `lib/sanity/imageUrl.ts` | `urlFor(image).width(400).url()` |
| VFS filtering | `lib/catalogue/` | `count(catalogueLocationKeys[@ in $keys]) > 0` |

### Pattern: URL State
| State Type | Implementation |
|------------|----------------|
| Pagination | `?page=1` — `searchParams.get('page')` |
| Sorting | `?sort=price-asc` — predefined options |
| Filtering | `?category=slug` — VFS key mapping |
```

**Extraction Rules:**
- **ONLY** patterns from existing, working components
- **EXACT** file paths — no "something like"
- **COPY-PASTABLE** code snippets for patterns the cheap model will replicate
- **NO** "we could do X" — only "we do X here"

---

### Phase 4: Fact Extraction — Gaps & DoDs (3 minutes)

**Goal:** Convert audit gaps into unambiguous DoD targets.

**Sources:** `01_audit_[FEATURE].md` Gap Analysis section

**Output Format:**
```markdown
## C:GAPS — Audit Gaps → Sprint DoDs

| Gap ID | Component | Current State | Target State | Sprint DoD |
|--------|-----------|---------------|--------------|------------|
| G-01 | ProductCard | No image container | `aspect-[4/3] bg-surface-productImage` | Card has fixed aspect image container |
| G-02 | ShopHeader | Generic title | `type-overline` style + section anchor | Header uses design system overline |
| G-03 | FilterSidebar | No visual separation | `bg-surface-elevated border-r` | Sidebar has elevated surface treatment |
| G-04 | Pagination | Missing | Client component with URL state | Pagination controls update URL params |

### Gap Dependencies
- G-01 must complete before G-03 (sidebar holds cards)
- G-02 is independent
- G-04 depends on data layer verification
```

**Compression Rules:**
- **STRIP** all "why this matters" prose
- **STRIP** all "consider alternative approaches"
- **KEEP** exact Gap IDs — they trace back to audit
- **KEEP** current/target state contrast — defines Done

---

### Phase 5: Fact Extraction — Constraints & Boundaries (2 minutes)

**Goal:** Define hard boundaries the sprint cannot cross.

**Sources:** `.windsurfrules`, lessons index, audit risk section

**Output Format:**
```markdown
## C:CONSTRAINTS — Hard Boundaries

### Scope Boundaries
| Boundary | Rule | Violation Risk |
|----------|------|----------------|
| CSS | Tailwind classes ONLY — no arbitrary values | Medium |
| Globals | NEVER modify `globals.css` | High |
| Data | NO schema changes, NO migrations | Critical |
| VFS | Use existing `lib/catalogue/` functions only | Medium |

### Architecture Boundaries
| Boundary | Rule | Rationale |
|----------|------|-----------|
| Server Components | Default for all pages | Data fetching happens here |
| Client Components | `use client` only for interactivity | Minimize client bundle |
| GROQ | All queries in `lib/sanity/queries.ts` | Centralized, testable |
| Types | Use generated Sanity types | `sanity.types.ts` is source of truth |

### Precedent Rules
| Decision | Precedent File | Must Follow |
|----------|----------------|-------------|
| Card styling | `FeaturedCard.tsx` | Same pattern, different data |
| Grid layout | `FeaturedGrid.tsx` | Same responsive breakpoints |
| Image handling | `lib/sanity/imageUrl.ts` | Same loader, same sizes |
| Error boundaries | `app/error.tsx` | Same pattern |
```

**Extraction Rules:**
- **ONLY** constraints from `.windsurfrules` or verified lessons
- **NO** "generally good practice" — only "this project requires"
- **PRECEDENT** references — "do it like this existing file"

---

### Phase 6: Cross-Reference Validation (2 minutes)

**Goal:** Verify all referenced tokens, files, and patterns exist.

**Validation Checklist:**
```markdown
## Validation: Verified References

| Category | Item | Exists | Verified |
|----------|------|--------|----------|
| Token | `bg-surface-card` | ✅ `tailwind.config.ts` | ✅ |
| Token | `type-overline` | ✅ `tailwind.config.ts` | ✅ |
| File | `FeaturedCard.tsx` | ✅ `app/(store)/_components/` | ✅ |
| File | `lib/sanity/queries.ts` | ✅ | ✅ |
| Pattern | VFS query syntax | ✅ `lib/catalogue/` | ✅ |

### Compressed Token Count
| Section | Facts | Est. Tokens |
|---------|-------|-------------|
| C:DESIGN | 15 tokens | ~150 |
| C:COMPONENTS | 12 patterns | ~200 |
| C:GAPS | 4 gaps | ~150 |
| C:CONSTRAINTS | 10 rules | ~150 |
| **TOTAL** | **41 facts** | **~650** |

**Compression Ratio:** 5400 raw → 650 compressed = **8.3x reduction**
```

**Validation Rules:**
- **EVERY** referenced token must exist in config
- **EVERY** referenced file must exist in codebase
- **EVERY** pattern must have precedent
- **FLAG** any missing references with `[VERIFY REQUIRED]`

---

## Output Structure

Final compressed artifact saved to: `_project/sprints/02_compressed_[FEATURE_NAME].md`

```markdown
# Compressed Context: [Feature Name]

> **Compression Date:** [YYYY-MM-DD]
> **Sources:** [List of research/audit files]
> **Compression Ratio:** [Raw → Compressed = Xx reduction]
> **Verified:** [Yes/No — missing refs flagged]

---

## C:DESIGN — Load-Bearing Tokens
[Phase 2 output — exact Tailwind classes, colors, spacing]

---

## C:COMPONENTS — Existing Patterns
[Phase 3 output — file paths, code patterns, GROQ shapes]

---

## C:GAPS — Audit Gaps → Sprint DoDs
[Phase 4 output — Gap IDs, current/target states, dependencies]

---

## C:CONSTRAINTS — Hard Boundaries
[Phase 5 output — scope limits, architecture rules, precedents]

---

## Quality Metrics

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| Token reduction | 5x | Xx | ✅/❌ |
| All tokens verified | 100% | X% | ✅/❌ |
| All files exist | 100% | X% | ✅/❌ |
| Zero prose | Yes | Yes/No | ✅/❌ |
| Gap traceability | All G-XX | Listed | ✅/❌ |
```

---

## Usage in Pipeline

### Pre-Opus Checklist
Before feeding to Opus for `/sprint` generation:

```markdown
- [ ] Compressed context is <1000 tokens
- [ ] All referenced tokens verified in `tailwind.config.ts`
- [ ] All referenced files exist in codebase
- [ ] Gap IDs trace back to `01_audit_*.md`
- [ ] No prose, no suggestions, only facts
```

### Opus Prompt Template
```
Generate sprint doc using this compressed context.

[Insert C:DESIGN, C:COMPONENTS, C:GAPS, C:CONSTRAINTS sections]

Constraints:
- Use ONLY the exact tokens listed in C:DESIGN
- Follow ONLY the patterns in C:COMPONENTS
- Address EVERY Gap ID in C:GAPS with 1:1 DoD mapping
- Respect ALL boundaries in C:CONSTRAINTS

Output: Professional sprint .todo file with:
- 3-5 scope contracts, each <30 min execution
- 1:1 DoD mapping to Gap IDs
- Pass 1/2/3 sequencing per scope contract
- Layer 1-4 build order per component
```

---

## Constraint Rules

- **NO** prose explanations — only facts
- **NO** "consider" or "could" — only "use" and "must"
- **NO** suggestions for new tokens — only existing
- **NO** hypothetical patterns — only verified precedent
- **YES** exact file paths
- **YES** exact class names
- **YES** Gap ID traceability
- **YES** compression ratio target (5x minimum)

---

## Success Metrics

The `/compress` command succeeds when:

1. **Token Reduction:** 5x-10x fewer input tokens to Opus
2. **Decision Quality:** Sprint doc quality matches uncompressed input
3. **Drift Prevention:** Cheap model executes without inventing tokens/classes
4. **Speed:** Compression takes <15 minutes (cheap model time)
5. **Verification:** 100% of referenced facts exist in codebase

---

## Failure Modes

| Failure | Cause | Prevention |
|---------|-------|------------|
| Missing token reference | Token not in config | Phase 6 validation checklist |
| Wrong file path | Refactor drift | Always verify file existence |
| Compressed but incomplete | Over-zealous stripping | Gap traceability requirement |
| Still too long | Poor source selection | Input manifest size check |
| Opus still drifts | Ambiguous constraints | Precedent rules section |

---

## Related Commands

- `/research` — Generates raw research artifacts
- `/audit` — Generates gap analysis with G-XX IDs
- `/sprint` — Consumes compressed context to generate sprint
- `/build` — Executes Pass/Layer per compressed sprint doc
