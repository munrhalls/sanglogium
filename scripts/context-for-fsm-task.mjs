#!/usr/bin/env node

/**
 * FSM (Finite State Machine) Context Template
 * 
 * Run: node scripts/context-for-fsm-task.mjs
 * 
 * Provides instant context for Order Lifecycle FSM debugging and development.
 * Eliminates 10-30 min/session context rebuild friction.
 */

const FSM_CONTEXT = {
  overview: `
# Finite State Machine (FSM) — Order Lifecycle Context

## Purpose
The FSM represents every physical event that can happen to an order in a single
'status' field using ENUM values. It's the simplest possible state management.

## Key Principle
FSM states are the ABSOLUTE source of truth for order lifecycle.
NEVER bypass FSM state validation.
Order state transitions MUST follow strict, pre-determined enumerable transitions.
`,

  files: {
    schema: [
      "sanity/schemaTypes/orderType.ts — Order schema with FSM status enum",
      "sanity/ORDER_MANAGEMENT_SYSTEM.md — Complete FSM documentation"
    ],
    implementation: [
      "app/(admin)/manager/ — Order management UI",
      "app/(admin)/packer/ — Packing workflow UI",
      "app/actions/checkout/ — Checkout flow actions"
    ]
  },

  fsmStates: {
    phase1_money: {
      name: "Phase 1: The Money (Genesis)",
      states: {
        CREATED_UNPAID: "User exists, Cart exists. No money yet.",
        PAYMENT_FAILED: "Card declined. User retrying.",
        PAID_CONFIRMED: "Money in bank. Ready for warehouse."
      }
    },
    phase2_warehouse: {
      name: "Phase 2: The Warehouse (The Forward Pipe)",
      states: {
        TO_PACK: "The standard state. Visible in 'Active Duty' queue.",
        PACKING_LOCKED: "A worker has opened it. Prevents double-packing.",
        PACKED_LABEL_GENERATED: "Box is sealed, label is on. Waiting for truck.",
        SHIPPED_IN_TRANSIT: "Scanned by carrier.",
        DELIVERED_SUCCESS: "End of line (Happy Path)."
      }
    },
    phase3_exceptions: {
      name: "Phase 3: The Exceptions (The Holds)",
      states: {
        HOLD_INVENTORY_MISSING: "Packer couldn't find item.",
        HOLD_ADDRESS_INVALID: "API rejected the address.",
        HOLD_WAITING_CUSTOMER_CHOICE: "We emailed them: 'Ship partial or cancel?'",
        HOLD_WAITING_PAYMENT_BALANCE: "They changed the order, now owe $5 more."
      }
    },
    phase4_cancellation: {
      name: "Phase 4: The Cancellation (The Backward Pipe)",
      note: '"Cancelled" is a process, not a state.',
      states: {
        CANCELLED_PENDING_UNPACK: "Manager clicked cancel, but box is on packing table. Task: 'Open box, put items on shelf.'",
        CANCELLED_RESTOCKED: "Worker confirmed items back on shelf. Inventory +1. (Dead State)",
        REFUNDED_NO_RESTOCK: "Cancelled before ever touched. (Dead State)"
      }
    },
    phase5_returns: {
      name: "Phase 5: The Returns (Post-Delivery)",
      states: {
        RETURN_REQUESTED: "Label sent to customer.",
        RETURN_RECEIVED_PENDING_INSPECTION: "Box arrived at warehouse.",
        RETURNED_RESTOCKED: "Item good. Inventory +1.",
        RETURNED_DISCARDED: "Item damaged/unusable."
      }
    }
  },

  keyConcepts: {
    idempotentQueues: {
      description: "Inngest background queues guarantee exactly-once execution",
      useCases: ["Stripe refunds", "Inventory re-stocking", "Email notifications"],
      criticalRule: "All state side effects must be idempotent"
    },
    stateTransitions: {
      description: "Valid state transitions are strictly defined",
      example: "CREATED_UNPAID → PAYMENT_FAILED (valid)",
      invalidExample: "DELIVERED_SUCCESS → TO_PACK (invalid)"
    },
    deadStates: {
      description: "Terminal states that end the lifecycle",
      states: ["DELIVERED_SUCCESS", "CANCELLED_RESTOCKED", "REFUNDED_NO_RESTOCK", "RETURNED_RESTOCKED", "RETURNED_DISCARDED"]
    }
  },

  commonTasks: {
    addNewState: [
      "1. Determine phase (Money/Warehouse/Exceptions/Cancellation/Returns)",
      "2. Add to orderType.ts status enum",
      "3. Document in ORDER_MANAGEMENT_SYSTEM.md",
      "4. Define valid transitions to/from this state",
      "5. Update any UI that displays state",
      "6. Add state handling in Inngest queue if needed"
    ],
    debugStateIssue: [
      "1. Check current order.status in Sanity",
      "2. Verify state is valid enum value",
      "3. Check phase-appropriate handling",
      "4. Review Inngest queue logs for side effects",
      "5. Verify idempotency of any retries"
    ],
    implementTransition: [
      "1. Define fromState and toState",
      "2. Validate transition is allowed",
      "3. Update order.status in Sanity",
      "4. Trigger Inngest queue for side effects",
      "5. Log transition for audit trail"
    ]
  },

  verificationCommands: {
    schema: "cat sanity/schemaTypes/orderType.ts | grep -A 50 'status:'",
    documentation: "cat sanity/ORDER_MANAGEMENT_SYSTEM.md",
    typegen: "npm run typegen",
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
      if (typeof value === "object" && !Array.isArray(value) && value.name) {
        console.log(`\n  [${key}] ${value.name}`);
        if (value.note) console.log(`  NOTE: ${value.note}`);
        if (value.states) {
          Object.entries(value.states).forEach(([k, v]) => {
            console.log(`    • ${k}: ${v}`);
          });
        }
      } else if (typeof value === "object" && !Array.isArray(value)) {
        console.log(`\n  [${key}]`);
        Object.entries(value).forEach(([k, v]) => {
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
  console.log(FSM_CONTEXT.overview);
  
  printSection("FILES — Schema", FSM_CONTEXT.files.schema);
  printSection("FILES — Implementation", FSM_CONTEXT.files.implementation);
  printSection("FSM STATES", FSM_CONTEXT.fsmStates);
  printSection("KEY CONCEPTS", FSM_CONTEXT.keyConcepts);
  printSection("COMMON TASKS", FSM_CONTEXT.commonTasks);
  printSection("VERIFICATION COMMANDS", FSM_CONTEXT.verificationCommands);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("  FSM Context Output Complete");
  console.log(`${"=".repeat(60)}\n`);
}

main();
