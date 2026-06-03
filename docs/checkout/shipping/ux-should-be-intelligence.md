Viewed AddressForm.tsx:1-247

I now have all the intelligence needed. Let me write the spec:

Edited shipping-page-design-specs.md

Done. Here is the complete spec:

---

## Shipping Page — Visual Design Specification

The spec is at [shipping-page-design-specs.md](file:///C:/Users/janpi/.gemini/antigravity/brain/09689016-9ba8-4391-aea6-02a46beb3d03/artifacts/shipping-page-design-specs.md).

### What it covers (17 sections, zero gaps)

**Diagnosed problems (§1)** — 11 current issues catalogued with severity, including the critical mobile truncation, the checkbox vs. radio confusion, the grey CTA, and the missing funnel context.

**Design token mapping (§2)** — every colour, typography, and component token from `tailwind.config.ts` that applies to this page, with hex values included for traceability.

**Layout architecture (§3)** — page shell, content column, vertical rhythm.

**Progress indicator spec (§4)** — 3-step funnel breadcrumb (Adres → Dostawa → Płatność), mobile (circles only) vs desktop (full labels), using `.type-overline` + `accent[500]`.

**Option card spec (§5–§6)** — full 4-state system (idle / hover / selected / focused / disabled), fixed right column `min-w-[88px]` to fix truncation, 20px radio indicator, selected summary line below list.

**CTA button spec (§7)** — both desktop inline and mobile sticky bar, including the missing upward shadow on the sticky bar.

**Empty & error states (§8–§9)** — exact token usage, no full-page takeovers.

**Typography hierarchy table (§10)**, **spacing reference table (§11)**, **responsive behaviour (§12)**, **accessibility checklist (§13)**, **motion spec (§14)**.

**Address page alignment (§15)** — explicit cross-reference to maintain checkout-wide visual consistency.

**What is already correct (§16)** — 9 items confirmed good, no changes needed.

**Prioritised change list (§17)** — P0/P1/P2 ranking for implementation hand-off.