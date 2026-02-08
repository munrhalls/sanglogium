import React from "react";

const TypographyDebugger = () => {
  return (
    <div className="bg-brand-700 text-brand-100 min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <section>
          <h2 className="text-h2 mb-4 font-bold">1. Trimmed Heading (H1)</h2>
          <div
            className="border-accent-600/30 relative border"
            style={{
              backgroundImage: "linear-gradient(#2a2a2a 1px, transparent 1px)",
              backgroundSize: "100% 8px",
            }}
          >
            <h1
              className={`text-h1 bg-accent-600/10 text-trim text-edge-cap font-bold leading-none`}
            >
              MONTSERRAT TRIM
            </h1>
          </div>
          <p className="text-small text-secondary-600 mt-2">
            Note: The blue/gold tint should start exactly at the top of the 'M'
            and end at the baseline.
          </p>
        </section>

        <section>
          <h2 className="text-h2 mb-4 font-bold">
            2. Trimmed Body (Paragraph)
          </h2>
          <div
            className="border-accent-600/30 relative border"
            style={{
              backgroundImage: "linear-gradient(#2a2a2a 1px, transparent 1px)",
              backgroundSize: "100% 8px",
            }}
          >
            <p className="text-body bg-accent-600/10">
              This paragraph is trimmed. In a standard CSS box, there would be
              "magic space" above this line. Now, the top border of the
              background color sits flush against the capital letters.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-h2 mb-4 font-bold">
            3. Comparison: Manual Control
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <span className="text-small text-accent-600 uppercase tracking-widest">
                Standard (Untrimmed)
              </span>
              <div className="mt-2 border border-white/10 p-0">
                <div className="text-h3 trim-none bg-white/5">
                  No Trim Applied
                </div>
              </div>
            </div>
            <div>
              <span className="text-small text-accent-600 uppercase tracking-widest">
                Utility (Trimmed)
              </span>
              <div className="mt-2 border border-white/10 p-0">
                <div className="text-h3 trim-both bg-white/5">
                  Utility Trim Applied
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TypographyDebugger;
