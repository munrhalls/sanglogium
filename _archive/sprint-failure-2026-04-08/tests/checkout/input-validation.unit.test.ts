import { describe, it, expect } from "vitest";

type BasketCheckoutItem = {
  _id: string;
  quantity: number;
};

// Re-implement validation functions for testing (they're private in route.ts)
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

function sanitizeQuantity(quantity: unknown): number | null {
  const num = typeof quantity === "string" ? parseInt(quantity, 10) : quantity;
  if (typeof num !== "number" || !Number.isFinite(num) || num < 1 || num > 99) {
    return null;
  }
  return Math.floor(num);
}

function validateBasketItem(item: unknown): item is BasketCheckoutItem {
  if (!item || typeof item !== "object") return false;

  const { _id, quantity } = item as Record<string, unknown>;

  if (typeof _id !== "string" || _id.length < 1 || _id.length > 64) {
    return false;
  }

  const sanitizedQty = sanitizeQuantity(quantity);
  if (sanitizedQty === null) {
    return false;
  }

  return true;
}

function validateBasket(basket: unknown): BasketCheckoutItem[] | null {
  if (!Array.isArray(basket) || basket.length === 0 || basket.length > 50) {
    return null;
  }

  const validated: BasketCheckoutItem[] = [];
  for (const item of basket) {
    if (!validateBasketItem(item)) {
      return null;
    }
    validated.push({
      _id: sanitizeId(item._id as string),
      quantity: sanitizeQuantity(item.quantity) as number,
    });
  }

  // Check for duplicate product IDs
  const idSet = new Set(validated.map((i) => i._id));
  if (idSet.size !== validated.length) {
    return null;
  }

  return validated;
}

describe("Input Validation", () => {
  describe("sanitizeId", () => {
    it("should remove invalid characters", () => {
      expect(sanitizeId("abc<script>")).toBe("abcscript");
      expect(sanitizeId('prod_123"; DROP TABLE')).toBe("prod_123DROPTABLE");
    });

    it("should truncate to 64 characters", () => {
      const longId = "a".repeat(100);
      expect(sanitizeId(longId).length).toBe(64);
    });

    it("should preserve valid characters", () => {
      expect(sanitizeId("prod_123-ABC")).toBe("prod_123-ABC");
    });
  });

  describe("sanitizeQuantity", () => {
    it("should accept valid quantities", () => {
      expect(sanitizeQuantity(1)).toBe(1);
      expect(sanitizeQuantity(99)).toBe(99);
      expect(sanitizeQuantity(5)).toBe(5);
    });

    it("should reject invalid quantities", () => {
      expect(sanitizeQuantity(0)).toBeNull();
      expect(sanitizeQuantity(100)).toBeNull();
      expect(sanitizeQuantity(-1)).toBeNull();
      expect(sanitizeQuantity("abc")).toBeNull();
    });

    it("should handle string numbers", () => {
      expect(sanitizeQuantity("5")).toBe(5);
      expect(sanitizeQuantity("10")).toBe(10);
    });

    it("should floor decimals", () => {
      expect(sanitizeQuantity(5.7)).toBe(5);
    });
  });

  describe("validateBasketItem", () => {
    it("should validate correct items", () => {
      expect(validateBasketItem({ _id: "prod_123", quantity: 2 })).toBe(true);
    });

    it("should reject items with missing _id", () => {
      expect(validateBasketItem({ quantity: 2 })).toBe(false);
    });

    it("should reject items with invalid quantity", () => {
      expect(validateBasketItem({ _id: "prod_123", quantity: 0 })).toBe(false);
      expect(validateBasketItem({ _id: "prod_123", quantity: 100 })).toBe(false);
    });

    it("should reject null items", () => {
      expect(validateBasketItem(null)).toBe(false);
      expect(validateBasketItem(undefined)).toBe(false);
    });
  });

  describe("validateBasket", () => {
    it("should validate correct basket", () => {
      const basket = [
        { _id: "prod_123", quantity: 2 },
        { _id: "prod_456", quantity: 1 },
      ];
      const result = validateBasket(basket);
      expect(result).toHaveLength(2);
      expect(result?.[0]._id).toBe("prod_123");
    });

    it("should reject empty basket", () => {
      expect(validateBasket([])).toBeNull();
    });

    it("should reject too many items", () => {
      const basket = Array(51).fill({ _id: "prod_123", quantity: 1 });
      expect(validateBasket(basket)).toBeNull();
    });

    it("should reject duplicate product IDs", () => {
      const basket = [
        { _id: "prod_123", quantity: 2 },
        { _id: "prod_123", quantity: 1 },
      ];
      expect(validateBasket(basket)).toBeNull();
    });

    it("should reject non-array input", () => {
      expect(validateBasket(null)).toBeNull();
      expect(validateBasket({})).toBeNull();
      expect(validateBasket("string")).toBeNull();
    });
  });
});
