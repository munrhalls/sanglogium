#!/usr/bin/env node

/**
 * Checkout Context Template
 * 
 * Run: node scripts/context-for-checkout-task.mjs
 * 
 * Provides instant context for Checkout flow debugging and development.
 * Eliminates 10-30 min/session context rebuild friction.
 */

const CHECKOUT_CONTEXT = {
  overview: `
# Checkout Flow Context

## Purpose
The checkout flow handles address validation, payment processing, and order
creation. It integrates Clerk auth, Stripe payments, and the FSM order lifecycle.

## Key Principle
Checkout is a multi-step process: Address → Payment → Confirmation.
Each step has validation gates and error handling.
`,

  files: {
    actions: [
      "app/actions/address/address.ts — Address validation and formatting",
      "app/actions/checkout/getOrderBySession.ts — Fetch order by Stripe session"
    ],
    api: [
      "app/api/order/route.ts — Order API endpoint",
      "app/api/webhook/stripe/route.ts — Stripe webhook handler"
    ],
    components: [
      "app/(store)/checkout/ — Checkout page components"
    ],
    fsm: [
      "sanity/schemaTypes/orderType.ts — Order schema with FSM states"
    ]
  },

  flow: {
    step1_address: {
      name: "Step 1: Address Collection",
      description: "User enters shipping address",
      validation: [
        "Required fields: name, street, city, postal code, country",
        "Address format validation per country",
        "Phone number validation"
      ],
      output: "Validated address object"
    },
    step2_payment: {
      name: "Step 2: Payment Processing",
      description: "Stripe integration for payment",
      states: [
        "CREATED_UNPAID — Order created, awaiting payment",
        "PAYMENT_FAILED — Card declined or error",
        "PAID_CONFIRMED — Payment successful"
      ],
      integration: "Stripe Checkout session"
    },
    step3_confirmation: {
      name: "Step 3: Order Confirmation",
      description: "Post-payment order creation",
      actions: [
        "Create order in Sanity with PAID_CONFIRMED status",
        "Link to Clerk user (if authenticated)",
        "Send confirmation email",
        "Move to TO_PACK in FSM"
      ]
    }
  },

  keyConcepts: {
    guestCheckout: {
      description: "Orders can be placed without account",
      field: "isGuest boolean in order schema",
      behavior: "clerkUserId is null for guest orders"
    },
    stripeIntegration: {
      description: "Stripe handles payment processing",
      flow: [
        "Create Stripe Checkout session",
        "Redirect to Stripe hosted page",
        "Webhook receives payment confirmation",
        "Update order status to PAID_CONFIRMED"
      ]
    },
    addressValidation: {
      description: "Multi-layer address validation",
      layers: [
        "Client-side: Format validation",
        "Server-side: Required field check",
        "External: Address verification API (optional)"
      ]
    },
    orderNumber: {
      description: "Human-readable order identifier",
      format: "ORD-YYYY-XXXX (e.g., ORD-2024-0001)",
      generation: "Auto-generated on order creation"
    }
  },

  errorHandling: {
    paymentFailed: {
      trigger: "Card declined, insufficient funds, etc.",
      state: "PAYMENT_FAILED",
      userAction: "Retry with different payment method",
      orderAction: "Remains in CREATED_UNPAID or moves to PAYMENT_FAILED"
    },
    addressInvalid: {
      trigger: "Carrier rejects address during packing",
      state: "HOLD_ADDRESS_INVALID",
      resolution: "Contact customer for correct address"
    }
  },

  commonTasks: {
    debugPaymentIssue: [
      "1. Check Stripe Dashboard for session status",
      "2. Verify webhook is receiving events",
      "3. Check order status in Sanity",
      "4. Review app/api/webhook/stripe/route.ts logs",
      "5. Verify PAID_CONFIRMED transition occurred"
    ],
    addAddressField: [
      "1. Modify address validation in app/actions/address/address.ts",
      "2. Update form components",
      "3. Test validation with edge cases",
      "4. Update order schema if storing new field"
    ],
    debugOrderNotFound: [
      "1. Verify session_id in URL",
      "2. Check getOrderBySession.ts logs",
      "3. Verify order exists in Sanity",
      "4. Check orderId vs orderNumber confusion",
      "5. Verify API endpoint is responding"
    ],
    implementGuestCheckout: [
      "1. Set isGuest = true in order",
      "2. Leave clerkUserId = null",
      "3. Ensure customerEmail is required",
      "4. Test order lookup by email",
      "5. Verify email notifications work"
    ]
  },

  verificationCommands: {
    syntax: "node -c scripts/context-for-checkout-task.mjs",
    addressAction: "cat app/actions/address/address.ts | head -50",
    orderAction: "cat app/actions/checkout/getOrderBySession.ts",
    build: "npm run build"
  }
};

function printSection(title, content) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}\n`);
  
  if (typeof content === "string") {
    console.log(content);
  } else if (Array.isArray(content)) {
    content.forEach(item => console.log(`  • ${item}`));
  } else if (typeof content === "object") {
    Object.entries(content).forEach(([key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        console.log(`\n  [${key}]`);
        if (value.name) console.log(`  Name: ${value.name}`);
        if (value.description) console.log(`  Description: ${value.description}`);
        
        Object.entries(value).forEach(([k, v]) => {
          if (k === "name" || k === "description") return;
          if (Array.isArray(v)) {
            console.log(`    ${k}:`);
            v.forEach(item => console.log(`      • ${item}`));
          } else {
            console.log(`    ${k}: ${v}`);
          }
        });
      } else if (Array.isArray(value)) {
        console.log(`\n  [${key}]`);
        value.forEach(item => console.log(`    • ${item}`));
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
  }
}

function main() {
  console.log(CHECKOUT_CONTEXT.overview);
  
  printSection("FILES — Actions", CHECKOUT_CONTEXT.files.actions);
  printSection("FILES — API", CHECKOUT_CONTEXT.files.api);
  printSection("FILES — Components", CHECKOUT_CONTEXT.files.components);
  printSection("CHECKOUT FLOW", CHECKOUT_CONTEXT.flow);
  printSection("KEY CONCEPTS", CHECKOUT_CONTEXT.keyConcepts);
  printSection("ERROR HANDLING", CHECKOUT_CONTEXT.errorHandling);
  printSection("COMMON TASKS", CHECKOUT_CONTEXT.commonTasks);
  printSection("VERIFICATION COMMANDS", CHECKOUT_CONTEXT.verificationCommands);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("  Checkout Context Output Complete");
  console.log(`${"=".repeat(60)}\n`);
}

main();
