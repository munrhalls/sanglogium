import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock window.location and history
const mockLocation = {
  search: "?checkout=cancelled",
  pathname: "/basket"
};

const mockHistory = {
  replaceState: vi.fn()
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true
});

// Mock URLSearchParams
class MockURLSearchParams {
  constructor(private search: string) {}

  get(key: string): string | null {
    if (this.search.includes("checkout=cancelled")) return "cancelled";
    return null;
  }
}

vi.mock("url", () => ({
  URLSearchParams: MockURLSearchParams
}));

// Mock server-only modules
vi.mock("server-only", () => ({}));

// Mock the usePreCheckout hook
const { mockReset, mockUsePreCheckout } = vi.hoisted(() => {
  const mockReset = vi.fn();
  const mockUsePreCheckout = vi.fn(() => ({
    state: "IDLE",
    reset: mockReset
  }));
  return { mockReset, mockUsePreCheckout };
});

vi.mock("@/app/components/features/basket/checkout/usePreCheckout", () => ({
  usePreCheckout: mockUsePreCheckout
}));

// Mock server actions
vi.mock("@/app/actions/checkout", () => ({
  validateBasket: vi.fn()
}));

vi.mock("@/app/actions/checkout/releaseInventoryLock", () => ({
  releaseInventoryLock: vi.fn()
}));

// Mock store
vi.mock("@/store/store", () => ({
  useBasketStore: vi.fn(),
  selectBasketTotal: vi.fn()
}));

describe("BasketPage - Cancel URL Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHistory.replaceState.mockClear();
    mockReset.mockClear();
    mockUsePreCheckout.mockReturnValue({
      state: "IDLE",
      reset: mockReset
    });
  });

  it("URL has ?checkout=cancelled AND state is SUCCESS: reset() called; URL cleaned", async () => {
    mockUsePreCheckout.mockReturnValue({
      state: "SUCCESS",
      reset: mockReset
    });
    mockLocation.search = "?checkout=cancelled";

    // Import after mocks are set up
    const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;

    // Render the component
    renderHook(() => BasketPage());

    // Verify reset was called and URL was cleaned
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockHistory.replaceState).toHaveBeenCalledWith({}, "", "/basket");
  });

  it("URL has ?checkout=cancelled AND state is ERROR_NETWORK: reset() NOT called; URL cleaned", async () => {
    mockUsePreCheckout.mockReturnValue({
      state: "ERROR_NETWORK",
      reset: mockReset
    });
    mockLocation.search = "?checkout=cancelled";

    // Import after mocks are set up
    const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;

    // Render the component
    renderHook(() => BasketPage());

    // Verify reset was NOT called (only SUCCESS state triggers reset) but URL was cleaned
    expect(mockReset).not.toHaveBeenCalled();
    expect(mockHistory.replaceState).toHaveBeenCalledWith({}, "", "/basket");
  });

  it("URL has ?checkout=cancelled AND state is IDLE: URL cleaned; no dispatch", async () => {
    mockUsePreCheckout.mockReturnValue({
      state: "IDLE",
      reset: mockReset
    });
    mockLocation.search = "?checkout=cancelled";

    // Import after mocks are set up
    const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;

    // Render the component
    renderHook(() => BasketPage());

    // Verify reset was NOT called but URL was cleaned
    expect(mockReset).not.toHaveBeenCalled();
    expect(mockHistory.replaceState).toHaveBeenCalledWith({}, "", "/basket");
  });

  it("URL does NOT have param: no effect", async () => {
    mockUsePreCheckout.mockReturnValue({
      state: "IDLE",
      reset: mockReset
    });
    mockLocation.search = "?other=value";

    // Import after mocks are set up
    const BasketPage = (await import("@/app/components/features/basket/BasketPage")).default;

    // Render the component
    renderHook(() => BasketPage());

    // Verify nothing was called
    expect(mockReset).not.toHaveBeenCalled();
    expect(mockHistory.replaceState).not.toHaveBeenCalled();
  });
});
