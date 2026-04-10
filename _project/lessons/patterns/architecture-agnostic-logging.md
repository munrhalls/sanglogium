# Pattern: Architecture-Agnostic Logging System

**Date:** 2026-04-09
**Source:** Universal flow logging generalization
**Severity:** High
**Frequency:** Systemic (applies to all development patterns)

## The Problem
Event flow logging was too tightly coupled to event-driven architectures. Other patterns (procedural, functional, data pipelines, service-oriented, object-oriented) lacked comprehensive flow tracing and verification.

## Root Cause
- Logging pattern assumed event-driven concepts (dispatch, state, work functions)
- No generalized framework for different architecture types
- Missing verification patterns for non-event systems
- No universal template that adapts to any flow type

## The Fix
Created architecture-agnostic logging system that works for any pattern:

### Universal Flow Template
```typescript
function createFlowLogger(flowName) {
  let stepNumber = 1;
  
  return {
    logStep(stepType, stepName, expectedCode, actualCode, componentName) {
      const expectationMet = expectedCode === actualCode;
      
      console.log(`${stepNumber}. ${stepType}: ${stepName}`);
      console.log(`   Expected: ${expectedCode}`);
      console.log(`   <${componentName}> ${actualCode}`);
      console.log(`   Expectation Met: ${expectationMet}`);
      
      if (!expectationMet) {
        console.log(`   Discrepancy: actual: ${actualCode} / expected: ${expectedCode}`);
      }
      
      stepNumber++;
    },
    
    startFlow(flowType) {
      console.log(`=== ${flowType} START ===`);
    },
    
    endFlow(flowType) {
      console.log(`=== ${flowType} COMPLETE ===`);
    }
  };
}
```

### Architecture-Specific Adaptations

#### Event-Driven: UI Event -> State -> Work -> Result -> State
```typescript
logger.logStep("Event", "START_VALIDATION", "dispatch({ type: 'START_VALIDATION' })", "dispatch({ type: 'START_VALIDATION' })", "CheckoutButton");
logger.logStep("State", "IDLE -> PROCESSING", "transition(prevState, 'START_VALIDATION', context)", "transition(prevState, 'START_VALIDATION', context)", "StateMachine");
```

#### Procedural: Step 1 -> Step 2 -> Step 3 -> Complete
```typescript
logger.logStep("Validation", "INPUT_VALIDATION", "validateInput(data)", "validateInput(data)", "DataProcessor");
logger.logStep("Transformation", "DATA_TRANSFORM", "transformData(validated)", "transformData(validated)", "DataTransformer");
```

#### Functional: Function 1 -> Function 2 -> Function 3 -> Result
```typescript
logger.logStep("Function", "ORDER_VALIDATION", "validateOrder(order)", "validateOrder(order)", "OrderValidator");
logger.logStep("Function", "TOTAL_CALCULATION", "calculateTotal(validatedOrder)", "calculateTotal(validatedOrder)", "TotalCalculator");
```

#### Data Pipeline: Extract -> Transform -> Load -> Complete
```typescript
logger.logStep("Extract", "DATA_EXTRACTION", "extractFromSource(source)", "extractFromSource(source)", "Extractor");
logger.logStep("Transform", "DATA_TRANSFORMATION", "transformData(rawData)", "transformData(rawData)", "Transformer");
```

#### Service-Oriented: Service 1 -> Service 2 -> Service 3 -> Result
```typescript
logger.logStep("Service", "ORDER_FETCH", "orderRepository.findById(orderId)", "orderRepository.findById(orderId)", "OrderRepository");
logger.logStep("Service", "INVENTORY_CHECK", "inventoryService.checkAvailability(productId)", "inventoryService.checkAvailability(productId)", "InventoryService");
```

#### Object-Oriented: Instantiate -> Method 1 -> Method 2 -> Persist
```typescript
logger.logStep("Method", "DATA_VALIDATION", "this.validateUserData(userData)", "this.validateUserData(userData)", "UserManager");
logger.logStep("Object", "USER_INSTANTIATION", "new User(userData)", "new User(userData)", "UserConstructor");
```

## Prevention
**MANDATORY:** For any architecture type:
1. Identify the flow type first (Event/Procedural/Functional/Pipeline/Service/Object)
2. Use universal flow logger with appropriate step types
3. Map the complete sequence from start to finish
4. Apply expectation verification at each step
5. Use exact code logging (no translations)
6. Include discrepancy logging for failed expectations

## Applicability
**When to apply:**
- Any architecture implementation requiring flow tracing
- Debugging complex system interactions
- Creating verification checkpoints for any pattern
- Systems with sequential operations that need complete tracing
- Cross-architecture debugging and maintenance

**Keywords:** ["architecture-agnostic", "universal-flow-logging", "procedural-logging", "functional-logging", "pipeline-logging", "service-logging", "object-logging", "pattern-agnostic"]
