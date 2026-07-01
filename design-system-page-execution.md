# Design System Page — Gap Fixes: Execution Spec for Devin

## Context

**Repo:** sang-logium (Next.js 15 App Router, React 19, Tailwind CSS)  
**Page route:** `/design-system-test`  
**Page file:** `app/design-system-test/page.tsx`  
**Layout file:** `app/design-system-test/layout.tsx`  
**Tailwind config:** `tailwind.config.ts` (root)

**Objective of this page:** Prove to a hiring reviewer that the developer:
1. Designed the design system (made intentional decisions)
2. Engineered it into a Tailwind config accessible app-wide
3. Orchestrated correct implementation across the entire codebase

**DO NOT** change any other file in the project. Only touch `app/design-system-test/page.tsx` and `app/design-system-test/layout.tsx`.

---

## Gap Register (confirmed before translation)

| # | Gap | Type |
|---|-----|------|
| G1 | Page does not scroll — globals.css applies `overflow:hidden` to html+body | Critical Bug |
| G2 | `@import` Google Fonts inside `<style>` tag in body — invalid CSS, font may not load | Critical Bug |
| G3 | No proof that design tokens are actually used in the app | Objective Failure |
| G4 | Tailwind plugin (`.btn-primary`, `.btn-secondary`, `.btn-ghost-primary`) not shown — the config→app bridge is invisible | Objective Failure |
| G5 | Semantic tokens (`text.primary`, `surface.card`, etc.) not shown — raw hex scales shown instead | Objective Failure |
| G6 | Section 08 Spacing shows Tailwind default scale (4/8/12…) as if it's a custom system — it is not | False Positive |
| G7 | Hero subtitle "11 Tokens · 1 Cohesive Language" is factually wrong and undersells | False Positive |
| G8 | Principle 04 "Touch-safe: Minimum 44px tap targets" claims more than the config proves | False Positive |
| G9 | Section 02 Color Theory is a standalone section repeating what Section 01 already implies | Over-complication |
| G10 | Section 09 Visual Hierarchy is a 48px-padded full mock card — too heavy, duplicates §03 and §06 | Over-complication |
| G11 | Hero subtitle missing the three key verbs: Designed / Engineered into Config / Implemented | Structural miss |
| G12 | No reference to tailwind.config.ts — viewer cannot see the config-layer architecture | Structural miss |

---

## Key facts for the new sections (do not invent — use these exact figures)

- `btn-primary`, `btn-secondary`, `btn-ghost-primary` Tailwind classes are used across **33 files** in the app
- Semantic token classes (`text-text-*`, `bg-surface-*`, `border-border-*`) are used across **57 files**
- The classes come from `uiComponentsPlugin` defined in `tailwind.config.ts`
- Custom screens in config: `pointer-fine`, `pointer-coarse`, `lg-touch`, `lg-desktop`

---

## Phase 1 — Fix blocking bugs (do first, nothing else can be verified until scroll works)

### Task 1.1 — Fix scroll and font loading by rewriting layout.tsx

**File:** `app/design-system-test/layout.tsx`

**Problem:** The current layout imports `../globals.css` which sets `html { overflow: hidden }` and `body { overflow: hidden; height: 100dvh }`. This makes the page a sealed non-scrolling box.  
Additionally the page.tsx has an `@import` inside a `<style>` tag — invalid CSS position for `@import`.  
Fix both by: removing the globals.css import from layout (the design-system-test page uses zero Tailwind classes — all its styles are in the inline `<style>` block), and loading Google Fonts properly via `<link>` tags in `<head>`.

**Replace the entire file with:**

```tsx
export default function DesignSystemTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#070808" }}>
        {children}
      </body>
    </html>
  );
}
```

**DoD:** File saved. No import of globals.css. Google Fonts loaded via `<link>` in `<head>`.

---

### Task 1.2 — Remove the @import line from page.tsx style block

**File:** `app/design-system-test/page.tsx`

**Find and delete this exact line** (it is the first line inside the `<style>` tag):

```
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');
```

**Leave everything else in the `<style>` block untouched.**

**DoD:** The `@import` line is gone. The `<style>` block now starts with `* { box-sizing: border-box; margin: 0; padding: 0; }`.

---

## Phase 2 — Fix hero subtitle and false-positive principle (fast text-only changes)

### Task 2.1 — Rewrite hero subtitle (fixes G7 + G11)

**File:** `app/design-system-test/page.tsx`

**Find:**
```tsx
          11 Tokens · 1 Cohesive Language · Built Solo
```

**Replace with:**
```tsx
          Designed · Engineered into Config · Implemented Across 57+ Files
```

**DoD:** New subtitle text visible in hero section. No other markup changed.

---

### Task 2.2 — Fix Principle 04 "Touch-safe" (fixes G8)

**File:** `app/design-system-test/page.tsx`

**Find this object inside the principles array:**
```tsx
              { n: "04", title: "Touch-safe", body: "Minimum 44px tap targets. Interaction states designed for both pointer and coarse touch." },
```

**Replace with:**
```tsx
              { n: "04", title: "Touch-safe", body: "Navigation controls use 44px minimum height. Tailwind config registers pointer-fine and pointer-coarse as custom media query breakpoints — interactive states are explicitly differentiated for desktop hover and touch." },
```

**DoD:** Principle 04 body updated. No other principles changed.

---

## Phase 3 — Remove false-positive Section 08, replace with real custom spacing tokens (fixes G6)

### Task 3.1 — Replace Section 08 Spacing content

**File:** `app/design-system-test/page.tsx`

**Find the entire section block for Section 08** — it starts with:
```tsx
        {/* 08 · WHITE SPACE */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">08 · Spacing & White Space</div>
          <div style={{ display: "flex", gap: 0, alignItems: "flex-end" }}>
            {[
              { size: 4, label: "4" },
```
and ends with:
```tsx
          </div>
        </section>
```
(the closing of the spacing bars flex container and then the section)

**Replace the entire section 08 block with:**

```tsx
        {/* 08 · SPACING — custom tokens only */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">08 · Spacing Tokens</div>
          <p style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
            Custom spacing tokens defined in <code style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37", background: "rgba(212,175,55,0.08)", padding: "1px 6px", borderRadius: 2 }}>tailwind.config.ts</code> — each tied to a layout constraint, not arbitrary multiples.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 640 }}>
            {[
              { token: "spacing.112", value: "28rem", note: "Feature media area — max-width for product spotlight images" },
              { token: "spacing.128", value: "32rem", note: "Hero container — large viewport hero sections" },
              { token: "spacing.feature-media", value: "450px", note: "Product media max-width — product detail image column" },
              { token: "spacing.desktop-header-h", value: "var(--desktop-header-h) / 64px", note: "Desktop nav height — synced via CSS custom property" },
              { token: "spacing.mobile-menu-h", value: "var(--mobile-menu-h) / 44px", note: "Mobile nav height — 44px = minimum touch target" },
            ].map((row) => (
              <div
                key={row.token}
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 200px 1fr",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(74,73,72,0.35)",
                  alignItems: "start",
                }}
              >
                <code style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37", letterSpacing: "0.02em" }}>{row.token}</code>
                <span style={{ fontSize: 12, color: "#9A9997", fontFamily: "monospace" }}>{row.value}</span>
                <span style={{ fontSize: 12, color: "#6E6D6B", lineHeight: 1.6 }}>{row.note}</span>
              </div>
            ))}
          </div>
        </section>
```

**DoD:** Section 08 now shows only the 5 genuinely custom spacing tokens from tailwind.config.ts, in a table layout. The old bar-chart of Tailwind defaults is gone.

---

## Phase 4 — Remove Section 02 Color Theory (fixes G9)

### Task 4.1 — Delete the standalone Color Theory section

**File:** `app/design-system-test/page.tsx`

**Find and delete the entire block** — starts with:
```tsx
        {/* 02 · COLOR THEORY */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">02 · Color Theory</div>
```
and ends with the closing `</section>` of that block (after the 3 theory cards).

The block to delete is approximately 40 lines — from the `{/* 02 · COLOR THEORY */}` comment through its `</section>`.

**Do not renumber any other sections.** Leave all other section labels exactly as they are (03, 04, 05… will stay at their numbers).

**DoD:** Section 02 Color Theory is gone. Section 01 Color Palette is still there. Section 03 Typography Scale follows immediately after Section 01. No other sections changed.

---

## Phase 5 — Add two new proof sections (fixes G3, G4, G5, G12)

These are NEW sections inserted into page.tsx. Insert both AFTER Section 01 (Color Palette) and BEFORE Section 03 (Typography Scale).

### Task 5.1 — Add Semantic Token Map section

**File:** `app/design-system-test/page.tsx`

**Find the comment** that marks the start of Section 03 Typography:
```tsx
        {/* 03 · TYPOGRAPHY */}
```

**Insert the following block IMMEDIATELY BEFORE that comment:**

```tsx
        {/* SEMANTIC TOKENS */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">Semantic Token Map</div>
          <p style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7, marginBottom: 32, maxWidth: 640 }}>
            The design system separates <em style={{ color: "#9A9997", fontStyle: "normal" }}>raw values</em> (hex scales) from <em style={{ color: "#D4AF37", fontStyle: "normal" }}>semantic roles</em> (named intent). Every component in the app references a role — not a hex code. Changing a token in{" "}
            <code style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37", background: "rgba(212,175,55,0.08)", padding: "1px 6px", borderRadius: 2 }}>tailwind.config.ts</code>{" "}
            propagates to every usage automatically.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "180px 120px 200px 1fr", gap: 16, padding: "8px 0 12px", borderBottom: "1px solid rgba(212,175,55,0.25)" }}>
              {["Token", "Resolves to", "Tailwind class", "Used as"].map((h) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A4948" }}>{h}</span>
              ))}
            </div>
            {/* Token rows */}
            {[
              { token: "text.primary",    hex: "#F6E3D5", cls: "text-text-primary",    usage: "Headings, product names" },
              { token: "text.body",       hex: "#FAEEE6", cls: "text-text-body",       usage: "Body copy, descriptions" },
              { token: "text.accent",     hex: "#D4AF37", cls: "text-text-accent",     usage: "Overlines, active labels" },
              { token: "text.caption",    hex: "#9A9997", cls: "text-text-caption",    usage: "Metadata, timestamps" },
              { token: "text.secondary",  hex: "#C7C6C4", cls: "text-text-secondary",  usage: "Supporting copy" },
              { token: "surface.page",    hex: "#151B1B", cls: "bg-surface-page",      usage: "Page-level background" },
              { token: "surface.card",    hex: "#1A1A19", cls: "bg-surface-card",      usage: "Product cards, panels" },
              { token: "surface.elevated",hex: "#2E2E2D", cls: "bg-surface-elevated",  usage: "Dropdowns, drawers" },
              { token: "border.primary",  hex: "#E5E4E2", cls: "border-border-primary", usage: "Prominent dividers" },
              { token: "border.secondary",hex: "#4A4948", cls: "border-border-secondary","usage": "Subtle dividers (default border)" },
            ].map((row) => (
              <div
                key={row.token}
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 120px 200px 1fr",
                  gap: 16,
                  padding: "13px 0",
                  borderBottom: "1px solid rgba(74,73,72,0.3)",
                  alignItems: "center",
                }}
              >
                <code style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37" }}>{row.token}</code>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 2, background: row.hex, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }} />
                  <code style={{ fontFamily: "monospace", fontSize: 11, color: "#6E6D6B" }}>{row.hex}</code>
                </div>
                <code style={{ fontFamily: "monospace", fontSize: 11, color: "#9A9997" }}>{row.cls}</code>
                <span style={{ fontSize: 12, color: "#6E6D6B" }}>{row.usage}</span>
              </div>
            ))}
          </div>
        </section>
```

**DoD:** Semantic token map section is visible, showing 10 token rows with name / hex swatch / Tailwind class / usage. Positioned after the Color Palette section and before Typography.

---

### Task 5.2 — Add Config Architecture section (with plugin proof)

**File:** `app/design-system-test/page.tsx`

**Find** the same marker comment:
```tsx
        {/* 03 · TYPOGRAPHY */}
```

**Insert the following block IMMEDIATELY BEFORE that comment** (after the Semantic Token Map you just added in Task 5.1):

```tsx
        {/* CONFIG ARCHITECTURE */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">Config Architecture</div>
          <p style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7, marginBottom: 32, maxWidth: 640 }}>
            The entire design system lives in one file:{" "}
            <code style={{ fontFamily: "monospace", fontSize: 12, color: "#D4AF37", background: "rgba(212,175,55,0.08)", padding: "1px 6px", borderRadius: 2 }}>tailwind.config.ts</code>.
            A custom Tailwind plugin compiles component classes at build time. One config change propagates across the entire app with zero component edits.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900 }}>

            {/* Code block — token declaration */}
            <div style={{ background: "#0D0F0F", borderRadius: 4, padding: "24px", border: "1px solid rgba(74,73,72,0.4)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#D4AF37", textTransform: "uppercase", marginBottom: 16 }}>Token Declaration</div>
              <pre style={{ fontFamily: "monospace", fontSize: 12, color: "#9A9997", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{`const surface = {
  page:     brand[700],    // #151B1B
  card:     secondary[900],// #1A1A19
  elevated: secondary[800],// #2E2E2D
} as const;

const textTokens = {
  primary: brand[400],  // #F6E3D5
  body:    brand[200],  // #FAEEE6
  accent:  accent[500], // #D4AF37
} as const;

// → extend: { colors: { surface, text: textTokens } }
// → accessible as: bg-surface-card, text-text-primary`}</pre>
            </div>

            {/* Code block — plugin */}
            <div style={{ background: "#0D0F0F", borderRadius: 4, padding: "24px", border: "1px solid rgba(74,73,72,0.4)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#D4AF37", textTransform: "uppercase", marginBottom: 16 }}>Component Plugin — 33 Files</div>
              <pre style={{ fontFamily: "monospace", fontSize: 12, color: "#9A9997", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{`// uiComponentsPlugin compiles utility
// classes at build time:

// In tailwind.config.ts:
".btn-primary": {
  backgroundColor: theme("colors.brand.400"),
  color: theme("colors.brand.700"),
  borderRadius: theme("borderRadius.md"),
  ...
}

// In any component:
<button className="btn-primary">
  Add to Basket
</button>
// Used across 33 files — auth, checkout,
// basket, hero, product cards, newsletter`}</pre>
            </div>

          </div>

          {/* Stats bar */}
          <div
            style={{
              display: "flex",
              gap: 0,
              marginTop: 20,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(74,73,72,0.4)",
              maxWidth: 900,
            }}
          >
            {[
              { n: "1", label: "Config file" },
              { n: "3", label: "Custom plugins" },
              { n: "33", label: "Files using btn-* classes" },
              { n: "57", label: "Files using semantic tokens" },
            ].map((stat, i) => (
              <div
                key={stat.n}
                style={{
                  flex: 1,
                  padding: "20px 16px",
                  textAlign: "center",
                  borderRight: i < 3 ? "1px solid rgba(74,73,72,0.4)" : "none",
                  background: i % 2 === 0 ? "#0D0F0F" : "#1A1A19",
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, color: "#D4AF37", letterSpacing: "-0.02em", lineHeight: 1 }}>{stat.n}</div>
                <div style={{ fontSize: 11, color: "#6E6D6B", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
```

**DoD:** Config Architecture section visible with two code blocks (token declaration + plugin usage) and the 4-stat bar (1 config / 3 plugins / 33 files / 57 files). Positioned after Semantic Token Map, before Typography.

---

## Phase 6 — Compress Section 09 Visual Hierarchy (fixes G10)

### Task 6.1 — Replace the mock card with a tight type specimen

**File:** `app/design-system-test/page.tsx`

**Find the entire Section 09 block** — starts with:
```tsx
        {/* 09 · VISUAL HIERARCHY */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">09 · Visual Hierarchy</div>
          <div
            style={{
              background: "#0D0F0F",
              borderRadius: 4,
              padding: "48px",
```
and ends with its closing `</section>`.

**Replace the entire block with:**

```tsx
        {/* 09 · VISUAL HIERARCHY */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">09 · Visual Hierarchy</div>
          <p style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
            Six levels of hierarchy — each maps to a named text token. The eye moves from overline → headline → subtitle → body → caption without instruction.
          </p>
          <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { role: "Overline",  token: "text-text-accent",   color: "#D4AF37", size: "10px",   weight: 700, ls: "0.4em",  text: "FEATURED COLLECTION" },
              { role: "Headline",  token: "text-text-primary",  color: "#F6E3D5", size: "clamp(1.6875rem, 2vw, 2.5rem)", weight: 700, ls: "-0.01em", text: "Reference-Grade IEMs" },
              { role: "Subtitle",  token: "text-text-secondary", color: "#C7C6C4", size: "clamp(1.125rem, 1vw, 1.375rem)", weight: 300, ls: "0.01em", text: "Engineered for the critical listener." },
              { role: "Body",      token: "text-text-body",     color: "#FAEEE6", size: "16px",   weight: 400, ls: "0em",    text: "From studio professionals to discerning audiophiles, each IEM is tuned to reveal the music exactly as the artist intended." },
              { role: "Caption",   token: "text-text-caption",  color: "#9A9997", size: "12px",   weight: 400, ls: "0.05em", text: "12 models · Free shipping on orders over £50" },
              { role: "Tiny",      token: "text-text-caption",  color: "#6E6D6B", size: "10px",   weight: 500, ls: "0.1em",  text: "SKU · SL-4024 · IN STOCK" },
            ].map((row) => (
              <div key={row.role} style={{ display: "flex", alignItems: "baseline", gap: 20, padding: "14px 0", borderBottom: "1px solid rgba(74,73,72,0.3)" }}>
                <div style={{ minWidth: 70, fontSize: 10, color: "#4A4948", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>{row.role}</div>
                <div style={{ flex: 1, fontSize: row.size, fontWeight: row.weight, letterSpacing: row.ls, color: row.color, lineHeight: 1.3 }}>{row.text}</div>
                <code style={{ fontSize: 10, color: "#4A4948", fontFamily: "monospace", flexShrink: 0, display: "none" }}>{row.token}</code>
              </div>
            ))}
          </div>
        </section>
```

**DoD:** Section 09 is now a compact 6-row type specimen table showing role → live text specimen. The heavy mock-card is gone.

---

## Execution order

Run phases strictly in this order. Each phase is independent of later phases but depends on earlier ones:

```
Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5  →  Phase 6
(bugs)      (text)      (spacing)   (cut §02)   (new §§)    (compress)
```

After all phases, the page should:
- Scroll normally
- Load Montserrat from Google Fonts
- Hero reads: "Designed · Engineered into Config · Implemented Across 57+ Files"
- Sections: Color Palette → Semantic Token Map → Config Architecture → Typography → Border Radius → Shadows → Buttons → Surfaces → Spacing (custom tokens only) → Visual Hierarchy (compact) → Motion → Principles (with corrected Principle 04)
- Two new sections added (Semantic Token Map, Config Architecture)
- Section 02 Color Theory removed
- Section 08 Spacing shows only real custom tokens

**Touch nothing else in the repo.**
