export default function TypographyTestPage() {
  return (
    <div
      style={{ fontFamily: "inherit", background: "white", color: "black" }}
      className="min-h-screen px-8 py-16 overflow-y-auto"

    >
      <h1 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "2rem" }}>
        Typography Scale — Design System Test
      </h1>

      {/* display-1 */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          display-1 | 48px → 90px | hero headline
        </p>
        <p className="text-cap text-display-1 font-bold">The quick brown fox</p>
        <p className="text-cap text-display-1 font-bold">The quick brown fox</p>
      </div>

      {/* display-2 */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          display-2 | 36px → 72px | section headline alternative
        </p>
        <p className="text-cap text-display-2 font-semibold">The quick brown fox</p>
        <p className="text-cap text-display-2 font-semibold">The quick brown fox</p>
      </div>

      {/* h1 */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          h1 | 28px → 48px | primary section headline
        </p>
        <h1 className="text-cap text-h1 text-cap font-semibold">The quick brown fox</h1>
        <h1 className="text-cap text-h1 text-cap font-semibold">The quick brown fox</h1>
      </div>

      {/* h2 */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          h2 | 24px → 36px | secondary section headline
        </p>
        <h2 className="text-cap text-h2 text-cap font-semibold">The quick brown fox</h2>
        <h2 className="text-cap text-h2 text-cap font-semibold">The quick brown fox</h2>
      </div>

      {/* h3 */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          h3 | 20px → 28px | tertiary headline, card titles, subheadlines
        </p>
        <h3 className="text-cap text-h3 text-cap font-medium">The quick brown fox</h3>
        <h3 className="text-cap text-h3 text-cap font-medium">The quick brown fox</h3>
      </div>

      {/* h4 */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          h4 | 16px → 21px | small headline, metadata labels
        </p>
        <h4 className="text-cap text-h4 text-cap font-medium">The quick brown fox</h4>
        <h4 className="text-cap text-h4 text-cap font-medium">The quick brown fox</h4>
      </div>

      {/* body */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          body | 14px → 16px | paragraph text
        </p>
        <p className="text-cap text-body">The quick brown fox</p>
        <p className="text-cap text-body">The quick brown fox</p>
      </div>

      {/* small */}
      <div className="py-8 border-b border-black">
        <p style={{ fontSize: "12px", marginBottom: "0.5rem" }}>
          small | 12px → 14px | captions, labels, overlines
        </p>
        <small className="text-cap">The quick brown fox</small>
        <br />
        <small className="text-cap">The quick brown fox</small>
      </div>
    </div>
  );
}
