import { backendClient } from "../backendClient";
import { CreateOrderOptions, CreateOrderResponse, Order } from "./orderTypes";

/**
 * Generate a unique order number in format: ORD-YYYY-NNNN
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the count of orders created this year
  const orderCount = await backendClient.fetch<number>(
    `count(*[_type == "order" && dates.orderedAt >= $yearStart])`,
    {
      yearStart: `${year}-01-01T00:00:00.000Z`,
    }
  );

  const orderNum = String(orderCount + 1).padStart(4, "0");
  return `ORD-${year}-${orderNum}`;
}

/**
 * Generate a unique order ID
 */
function generateOrderId(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate order data before creating
 */
function validateOrderData(options: CreateOrderOptions): string | null {
  // Validate required fields
  if (!options.customerEmail || !options.customerEmail.includes("@")) {
    return "Valid customer email is required";
  }

  if (!options.items || options.items.length === 0) {
    return "Order must contain at least one item";
  }

  // Validate items
  for (const item of options.items) {
    if (!item.productId || !item.name) {
      return "All items must have productId and name";
    }
    if (item.quantity < 1) {
      return "Item quantity must be at least 1";
    }
    if (item.price < 0) {
      return "Item price cannot be negative";
    }
    if (item.subtotal !== item.price * item.quantity) {
      return "Item subtotal must equal price × quantity";
    }
  }

  // Validate shipping address
  const addr = options.shippingAddress;
  if (
    !addr.name ||
    !addr.line1 ||
    !addr.city ||
    !addr.postalCode ||
    !addr.country
  ) {
    return "Complete shipping address is required";
  }

  // Validate pricing
  const pricing = options.pricing;
  if (!pricing || pricing.subtotal < 0 || pricing.total < 0) {
    return "Valid pricing information is required";
  }
  if (!pricing.currency) {
    return "Currency is required";
  }

  return null;
}

/**
 * Create a new order in Sanity
 *
 * @param options Order creation options
 * @returns Order creation result or error
 */
export async function createOrder(
  options: CreateOrderOptions
): Promise<CreateOrderResponse> {
  try {
    // Validate input data
    const validationError = validateOrderData(options);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Generate unique identifiers
    const orderNumber = await generateOrderNumber();
    const orderId = generateOrderId();
    const now = new Date().toISOString();

    // Build the order document
    const orderData: Omit<Order, "_id"> = {
      _type: "order",

      // Identifiers
      orderNumber,
      orderId,

      // Customer info
      clerkUserId: options.clerkUserId,
      customerEmail: options.customerEmail,
      customerPhone: options.customerPhone,
      isGuest: options.isGuest ?? false,

      // Items (with calculated subtotals)
      items: options.items.map((item) => ({
        ...item,
        subtotal: item.price * item.quantity,
        returnStatus: item.returnStatus ?? "none",
      })),

      // Addresses
      shippingAddress: options.shippingAddress,
      billingAddress: options.billingAddress,

      // Shipping
      shippingMethod: options.shippingMethod,

      // Pricing
      pricing: options.pricing,

      // Status
      status: "pending_payment",

      // Timestamps
      dates: {
        orderedAt: now,
      },

      // Payment
      payment: options.payment,

      // Metadata
      metadata: options.metadata,
    };

    // Create the order in Sanity
    const createdOrder = await backendClient.create(orderData);

    return {
      success: true,
      order: createdOrder as Order,
    };
  } catch (error) {
    console.error("Error creating order:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
      details: error,
    };
  }
}

/**
 * Legacy alias for backward compatibility
 */
export const addOrder = createOrder;
