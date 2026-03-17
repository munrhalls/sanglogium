import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";

export default function ButtonTestPage() {
  return (
    <div
      className="min-h-screen px-8 py-16 flex flex-col gap-16 overflow-y-auto"
      style={{ background: "#070808" }}
    >
      <h1 style={{ fontSize: "11px", color: "#6E6D6B" }}>
        Button System — Design System Test
      </h1>

      <div className="flex flex-col gap-8">
        <p style={{ fontSize: "11px", color: "#6E6D6B" }}>
          btn-primary — main CTA
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="btn-primary px-8 py-3">EXPLORE</button>
          <button className="btn-primary px-8 py-3" disabled>
            EXPLORE (disabled)
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <p style={{ fontSize: "11px", color: "#6E6D6B" }}>
          btn-cart — add to cart
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="btn-cart px-3 py-2">
            <ShoppingCart size={18} />
            Add
          </button>
          <button className="btn-cart px-6 py-3" disabled>
            <ShoppingCart size={18} />
            Add to Cart (disabled)
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <p style={{ fontSize: "11px", color: "#6E6D6B" }}>
          btn-ghost — secondary action
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="btn-ghost">See More</button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <p style={{ fontSize: "11px", color: "#6E6D6B" }}>
          btn-ghost alongside type-overline — no color conflict check
        </p>
        <div className="flex flex-col gap-3">
          <p className="type-overline">New Arrivals</p>
          <button className="btn-ghost">See More</button>
        </div>
      </div>
    </div>
  );
}
