export default function DesignSystemPage() {
  return (
    <div
      style={{
        fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
        background: "#070808",
        minHeight: "100vh",
        color: "#F6E3D5",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── scrollbar ── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px; }

        /* ── section label ── */
        .section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #D4AF37;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(212,175,55,0.2);
        }

        /* ── swatch ── */
        .swatch {
          border-radius: 3px;
          transition: transform 0.2s ease;
          cursor: default;
        }
        .swatch:hover { transform: scale(1.05); }

        /* ── type specimen ── */
        .type-row {
          display: flex;
          align-items: baseline;
          gap: 24px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(74,73,72,0.4);
        }
        .type-row:last-child { border-bottom: none; }
        .type-meta {
          min-width: 120px;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #9A9997;
          text-transform: uppercase;
        }

        /* ── button demos ── */
        .btn-primary {
          background: #F6E3D5;
          color: #151B1B;
          font-weight: 700;
          font-family: inherit;
          font-size: 14px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 3px;
          border: none;
          padding: 12px 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary:hover {
          background: #E8C9B5;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .btn-secondary {
          background: transparent;
          color: #F6E3D5;
          font-weight: 600;
          font-family: inherit;
          font-size: 14px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 3px;
          border: 1px solid rgba(246,227,213,0.3);
          padding: 12px 28px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .btn-secondary:hover {
          border-color: rgba(246,227,213,0.7);
          background: rgba(246,227,213,0.04);
        }
        .btn-ghost {
          background: transparent;
          color: #D4AF37;
          font-weight: 600;
          font-family: inherit;
          font-size: 14px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: none;
          padding: 12px 28px;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }
        .btn-ghost::after {
          content: '';
          position: absolute;
          bottom: 8px;
          left: 28px;
          right: 28px;
          height: 1px;
          background: #D4AF37;
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .btn-ghost:hover::after { transform: scaleX(1); }

        /* ── surface card ── */
        .surface-card {
          border-radius: 4px;
          padding: 20px;
          transition: box-shadow 0.2s ease;
        }
        .surface-card:hover {
          box-shadow: 0 8px 30px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.08);
        }

        /* ── radius demo ── */
        .radius-box {
          width: 64px;
          height: 64px;
          background: rgba(212,175,55,0.15);
          border: 1px solid rgba(212,175,55,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #D4AF37;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        /* ── shadow demo ── */
        .shadow-card {
          background: #1A1A19;
          border-radius: 4px;
          padding: 24px;
          text-align: center;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #9A9997;
          text-transform: uppercase;
          min-width: 140px;
        }

        /* ── motion strip ── */
        .motion-item {
          height: 56px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
        }
        .motion-fade {
          background: rgba(212,175,55,0.1);
          color: #D4AF37;
          border: 1px solid rgba(212,175,55,0.2);
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .motion-fade:hover {
          background: rgba(212,175,55,0.2);
          border-color: rgba(212,175,55,0.5);
        }
        .motion-slide {
          background: rgba(246,227,213,0.05);
          color: #F6E3D5;
          border: 1px solid rgba(246,227,213,0.1);
          transition: transform 0.2s ease, background 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .motion-slide::before {
          content: '';
          position: absolute;
          left: -100%;
          top: 0; bottom: 0;
          width: 100%;
          background: rgba(246,227,213,0.06);
          transition: left 0.3s ease;
        }
        .motion-slide:hover::before { left: 0; }
        .motion-scale {
          background: rgba(212,175,55,0.08);
          color: #D4AF37;
          border: 1px solid rgba(212,175,55,0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .motion-scale:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,175,55,0.15);
        }
      `}</style>

      {/* ─────────────────── HERO ─────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 40px 64px",
          borderBottom: "1px solid rgba(74,73,72,0.3)",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.4em",
            fontWeight: 600,
            color: "#D4AF37",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Sang Logium
        </div>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#F6E3D5",
            lineHeight: 1.05,
            marginBottom: 20,
          }}
        >
          Design System
        </h1>
        <p
          style={{
            fontSize: 14,
            letterSpacing: "0.2em",
            color: "#9A9997",
            textTransform: "uppercase",
            fontWeight: 400,
          }}
        >
          Designed · Engineered into Config · Implemented Across 57+ Files
        </p>
        <div
          style={{
            width: 64,
            height: 1,
            background: "#D4AF37",
            margin: "32px auto 0",
          }}
        />
      </div>

      {/* ─────────────────── CONTENT ─────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 120px" }}>

        {/* 01 · COLOR PALETTE */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">01 · Color Palette</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Brand */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6E6D6B", textTransform: "uppercase", marginBottom: 12 }}>Brand — Warm Neutral</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  ["#FEFCFB", "50"],
                  ["#FDF9F7", "100"],
                  ["#FAEEE6", "200"],
                  ["#F8E6D9", "300"],
                  ["#F6E3D5", "400 ↑ Primary Text"],
                  ["#E8C9B5", "500"],
                  ["#C9A18A", "600"],
                  ["#151B1B", "700 ↑ Page Surface"],
                  ["#0D0F0F", "800"],
                  ["#070808", "900 ↑ Body"],
                ].map(([color, label]) => (
                  <div key={color} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div
                      className="swatch"
                      style={{
                        width: 52,
                        height: 52,
                        background: color,
                        border: color === "#070808" || color === "#0D0F0F" || color === "#151B1B"
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "none",
                      }}
                    />
                    <div style={{ fontSize: 9, color: "#6E6D6B", letterSpacing: "0.05em", textAlign: "center", maxWidth: 52, lineHeight: 1.4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6E6D6B", textTransform: "uppercase", marginBottom: 12 }}>Accent — Editorial Gold</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  ["#FBF6E8", "100"],
                  ["#F5E9C8", "200"],
                  ["#EEDB9F", "300"],
                  ["#E5C158", "400"],
                  ["#D4AF37", "500 ↑ Primary Gold"],
                  ["#B8952E", "600"],
                  ["#8F7324", "700"],
                  ["#6B561C", "800"],
                ].map(([color, label]) => (
                  <div key={color} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div className="swatch" style={{ width: 52, height: 52, background: color }} />
                    <div style={{ fontSize: 9, color: "#6E6D6B", letterSpacing: "0.05em", textAlign: "center", maxWidth: 52, lineHeight: 1.4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#6E6D6B", textTransform: "uppercase", marginBottom: 12 }}>Status</div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  ["#4ADE80", "Success"],
                  ["#EF4444", "Error"],
                  ["#F59E0B", "Warning"],
                ].map(([color, label]) => (
                  <div key={color} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="swatch" style={{ width: 32, height: 32, background: color, borderRadius: 2 }} />
                    <span style={{ fontSize: 12, color: "#9A9997", letterSpacing: "0.05em" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
              { token: "border.secondary",hex: "#4A4948", cls: "border-border-secondary", usage: "Subtle dividers (default border)" },
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

        {/* 03 · TYPOGRAPHY */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">03 · Typography Scale</div>
          <div style={{ fontFamily: "Montserrat, sans-serif" }}>
            {[
              { label: "Display 1", size: "clamp(3rem, 4vw + 2rem, 5.625rem)", weight: 700, ls: "-0.02em", lh: 1.1, text: "Audiophile Grade" },
              { label: "Display 2", size: "clamp(2.25rem, 3vw + 1.5rem, 4.25rem)", weight: 700, ls: "-0.015em", lh: 1.12, text: "Precision Engineering" },
              { label: "H1", size: "clamp(1.6875rem, 2.25vw + 1.16rem, 3.1875rem)", weight: 700, ls: "-0.01em", lh: 1.2, text: "In-Ear Monitors" },
              { label: "H2", size: "clamp(1.25rem, 1.69vw + 0.854rem, 2.375rem)", weight: 600, ls: "-0.005em", lh: 1.25, text: "Featured Collection" },
              { label: "H3", size: "clamp(1.125rem, 1.03vw + 0.883rem, 1.8125rem)", weight: 600, ls: "0.05em", lh: 1.2, text: "Driver Technology" },
              { label: "H4", size: "clamp(1rem, 0.56vw + 0.868rem, 1.375rem)", weight: 600, ls: "0.1em", lh: 1.2, text: "Technical Specifications" },
              { label: "Body", size: "16px", weight: 400, ls: "0em", lh: 1.5, text: "Engineered for the critical listener who demands accuracy across the full frequency range." },
              { label: "Action", size: "14px", weight: 600, ls: "0.05em", lh: 1.5, text: "Add to Basket" },
              { label: "Small", size: "12px", weight: 400, ls: "0.05em", lh: 1.33, text: "Free shipping on orders over £50" },
              { label: "Tiny", size: "10px", weight: 500, ls: "0.05em", lh: 1.4, text: "SKU · SL-4024 · IN STOCK" },
            ].map((row) => (
              <div key={row.label} className="type-row">
                <div className="type-meta">{row.label}</div>
                <div
                  style={{
                    fontSize: row.size,
                    fontWeight: row.weight,
                    letterSpacing: row.ls,
                    lineHeight: row.lh,
                    color: "#F6E3D5",
                    flex: 1,
                  }}
                >
                  {row.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 04 · BORDER RADIUS */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">04 · Border Radius</div>
          <p style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
            Intentionally minimal. lg=4px, md=3px, sm=2px. Avoids the "friendly" rounded-pill aesthetic in favour of an editorial, architectural edge — consistent with luxury audio hardware.
          </p>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "lg", value: "4px", note: "Cards, containers" },
              { label: "md", value: "3px", note: "Buttons, inputs" },
              { label: "sm", value: "2px", note: "Tags, badges" },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                <div
                  className="radius-box"
                  style={{ borderRadius: r.value }}
                >
                  {r.value}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#D4AF37", letterSpacing: "0.1em" }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "#6E6D6B", marginTop: 2 }}>{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 05 · SHADOWS */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">05 · Shadows</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "card", shadow: "0 4px 20px rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.05)", note: "Default card" },
              { label: "cardHover", shadow: "0 8px 30px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.08)", note: "Hover state" },
              { label: "button", shadow: "0 2px 8px rgba(0,0,0,0.15)", note: "Button default" },
              { label: "buttonHover", shadow: "0 4px 16px rgba(0,0,0,0.25)", note: "Button hover" },
            ].map((s) => (
              <div key={s.label} className="shadow-card" style={{ boxShadow: s.shadow }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#D4AF37", marginBottom: 8, letterSpacing: "0.1em" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#6E6D6B" }}>{s.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 06 · BUTTONS */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">06 · Buttons</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn-primary">Add to Basket</button>
            <button className="btn-secondary">View Details</button>
            <button className="btn-ghost">Explore Collection</button>
            <button className="btn-primary" disabled style={{ opacity: 0.4, cursor: "not-allowed" }}>Out of Stock</button>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "#6E6D6B", letterSpacing: "0.05em" }}>
            Hover each button to see interaction states
          </div>
        </section>

        {/* 07 · SURFACES */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">07 · Surface Layers</div>
          <p style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
            Three distinct dark surfaces create visual depth and hierarchy without colour. Each layer is perceptible but never jarring.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { bg: "#070808", label: "Body / bg-brand-900", border: "1px solid rgba(255,255,255,0.06)" },
              { bg: "#0D0F0F", label: "Subtle / bg-brand-800", border: "1px solid rgba(255,255,255,0.06)" },
              { bg: "#151B1B", label: "Page Surface / bg-brand-700", border: "none" },
              { bg: "#1A1A19", label: "Card / surface-card", border: "none" },
              { bg: "#2E2E2D", label: "Elevated / surface-elevated", border: "none" },
            ].map((s) => (
              <div
                key={s.label}
                className="surface-card"
                style={{
                  background: s.bg,
                  border: s.border,
                  minWidth: 160,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: "#F6E3D5", letterSpacing: "0.05em", marginBottom: 6 }}>{s.bg}</div>
                <div style={{ fontSize: 10, color: "#6E6D6B", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

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

        {/* 10 · MOTION */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">10 · Motion & Interaction</div>
          <p style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
            All transitions: 200ms ease. Three motion patterns — fade opacity, reveal sweep, and lift. Each is hover-triggered, never on mount, never distracting.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 560 }}>
            <div className="motion-item motion-fade">Fade · 200ms</div>
            <div className="motion-item motion-slide">Sweep · 300ms</div>
            <div className="motion-item motion-scale">Lift · 200ms</div>
          </div>
        </section>

        {/* 11 · DESIGN PRINCIPLES */}
        <section style={{ paddingTop: 72 }}>
          <div className="section-label">11 · Design Principles</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { n: "01", title: "Restraint", body: "Every token earns its place. No decorative radius, no gratuitous shadow, no colour without purpose." },
              { n: "02", title: "Hierarchy first", body: "Overline → headline → subtitle → body → caption. The eye always knows where to go next." },
              { n: "03", title: "Product is hero", body: "Background, typography, spacing — all in service of the product image. The UI disappears." },
              { n: "04", title: "Touch-safe", body: "Navigation controls use 44px minimum height. Tailwind config registers pointer-fine and pointer-coarse as custom media query breakpoints — interactive states are explicitly differentiated for desktop hover and touch." },
            ].map((p) => (
              <div key={p.n} style={{ padding: "24px 20px", borderTop: "1px solid rgba(212,175,55,0.2)" }}>
                <div style={{ fontSize: 10, color: "#D4AF37", letterSpacing: "0.3em", fontWeight: 700, marginBottom: 12 }}>{p.n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F6E3D5", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#6E6D6B", lineHeight: 1.7 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(74,73,72,0.3)",
          padding: "32px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "#4A4948",
          textTransform: "uppercase",
        }}
      >
        <span>Sang Logium Design System</span>
        <span>Designed & Built Solo · Next.js 15 + React 19</span>
      </div>
    </div>
  );
}
