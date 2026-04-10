---
description: Generalized logging system for complete event flow verification with expectation tracking
---

# /logs Command - Universal Flow Logging System

## When to Use
- Any feature development requiring complete flow tracing
- Debugging complex system interactions
- Implementing any architecture type (event-driven, procedural, functional, etc.)
- Creating verification checkpoints for human-readable flow tracing
- Any system with sequential operations that need complete tracing

## Core Logging Pattern

### Universal Flow Story Format (Works for Any Architecture)
```
=== [FLOW TYPE] START ===
1. [STEP TYPE]: [STEP NAME]
   Expected: exactCodeExpected()
   <[COMPONENT]> exactCodeCalled()
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

2. [STEP TYPE]: [STEP NAME]
   Expected: exactCodeExpected()
   <[COMPONENT]> exactCodeCalled()
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

=== [FLOW TYPE] COMPLETE ===
```

### Architecture-Specific Patterns

#### Event-Driven Architecture
```
=== USER ACTION START ===
1. Event: START_VALIDATION
   Expected: dispatch({ type: "START_VALIDATION" })
   <CheckoutButton> dispatch({ type: "START_VALIDATION" })
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

2. State: IDLE -> PROCESSING
   Expected: transition(prevState, "START_VALIDATION", context)
   <StateMachine> transition(prevState, "START_VALIDATION", context)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

3. Work: validateBasket
   Expected: validateBasket(payload, idempotencyKey)
   <WorkExecutor> validateBasket(payload, idempotencyKey)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

4. Result: PASS_VALIDATION
   Expected: dispatch({ type: "PASS_VALIDATION", payload: { stripeUrl: url } })
   <WorkExecutor> dispatch({ type: "PASS_VALIDATION", payload: { stripeUrl: url })
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

5. State: PROCESSING -> SUCCESS
   Expected: transition(prevState, "PASS_VALIDATION", context)
   <StateMachine> transition(prevState, "PASS_VALIDATION", context)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)
=== USER ACTION COMPLETE ===
```

#### Procedural Architecture
```
=== DATA PROCESSING START ===
1. Validation: INPUT_VALIDATION
   Expected: validateInput(data)
   <DataProcessor> validateInput(data)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

2. Transformation: DATA_TRANSFORM
   Expected: transformData(validatedInput)
   <DataTransformer> transformData(validatedInput)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

3. Output: OUTPUT_GENERATION
   Expected: generateOutput(transformedData)
   <OutputGenerator> generateOutput(transformedData)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)
=== DATA PROCESSING COMPLETE ===
```

#### Functional Architecture
```
=== ORDER PROCESSING START ===
1. Function: ORDER_VALIDATION
   Expected: validateOrder(order)
   <OrderValidator> validateOrder(order)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

2. Function: TOTAL_CALCULATION
   Expected: calculateTotal(validatedOrder)
   <TotalCalculator> calculateTotal(validatedOrder)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

3. Function: DISCOUNT_APPLICATION
   Expected: applyDiscount(total, customer)
   <DiscountApplier> applyDiscount(total, customer)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)
=== ORDER PROCESSING COMPLETE ===
```

#### Data Pipeline Architecture
```
=== ETL PIPELINE START ===
1. Extract: DATA_EXTRACTION
   Expected: extractFromSource(source)
   <Extractor> extractFromSource(source)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

2. Transform: DATA_TRANSFORMATION
   Expected: transformData(rawData)
   <Transformer> transformData(rawData)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

3. Load: DATA_LOADING
   Expected: loadToTarget(transformedData)
   <Loader> loadToTarget(transformedData)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)
=== ETL PIPELINE COMPLETE ===
```

#### Service-Oriented Architecture
```
=== ORDER SERVICE START ===
1. Service: ORDER_FETCH
   Expected: orderRepository.findById(orderId)
   <OrderRepository> orderRepository.findById(orderId)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

2. Service: INVENTORY_CHECK
   Expected: inventoryService.checkAvailability(productId)
   <InventoryService> inventoryService.checkAvailability(productId)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

3. Service: PAYMENT_PROCESSING
   Expected: paymentService.processCharge(total)
   <PaymentService> paymentService.processCharge(total)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)
=== ORDER SERVICE COMPLETE ===
```

#### Object-Oriented Architecture
```
=== USER CREATION START ===
1. Method: DATA_VALIDATION
   Expected: this.validateUserData(userData)
   <UserManager> this.validateUserData(userData)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

2. Object: USER_INSTANTIATION
   Expected: new User(userData)
   <UserConstructor> new User(userData)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)

3. Method: USER_PERSISTENCE
   Expected: this.userRepository.save(user)
   <UserRepository> this.userRepository.save(user)
   Expectation Met: true/false
   Discrepancy: actual: { actual } / expected: { expected } (only if false)
=== USER CREATION COMPLETE ===
```

## Implementation Template

### Step 1: Define Your Flow Type
```typescript
// Identify your architecture type and flow pattern
// Event-Driven: UI Event -> State -> Work -> Result -> State
// Procedural: Step 1 -> Step 2 -> Step 3 -> Complete
// Functional: Function 1 -> Function 2 -> Function 3 -> Result
// Data Pipeline: Extract -> Transform -> Load -> Complete
// Service-Oriented: Service 1 -> Service 2 -> Service 3 -> Result
// Object-Oriented: Instantiate -> Method 1 -> Method 2 -> Persist
```

### Step 2: Create Universal Flow Logger
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

### Step 3: Implement in Your Components
```typescript
// Example: Event-Driven Architecture
const handleUserAction = () => {
  const logger = createFlowLogger("USER ACTION");
  logger.startFlow("USER ACTION");

  const expectedEvent = 'dispatch({ type: "START_WORK" })';
  const actualEvent = 'dispatch({ type: "START_WORK" })';

  logger.logStep("Event", "START_WORK", expectedEvent, actualEvent, "YourComponent");

  dispatch({ type: "START_WORK" });

  logger.endFlow("USER ACTION");
};

// Example: Procedural Architecture
function processData(data) {
  const logger = createFlowLogger("DATA PROCESSING");
  logger.startFlow("DATA PROCESSING");

  const expectedValidate = 'validateInput(data)';
  const actualValidate = 'validateInput(data)';
  logger.logStep("Validation", "INPUT_VALIDATION", expectedValidate, actualValidate, "DataProcessor");

  const validated = validateInput(data);

  const expectedTransform = 'transformData(validated)';
  const actualTransform = 'transformData(validated)';
  logger.logStep("Transformation", "DATA_TRANSFORM", expectedTransform, actualTransform, "DataTransformer");

  const transformed = transformData(validated);

  logger.endFlow("DATA PROCESSING");
  return transformed;
}

// Example: Functional Architecture
const processOrder = (order) => {
  const logger = createFlowLogger("ORDER PROCESSING");
  logger.startFlow("ORDER PROCESSING");

  const expectedValidate = 'validateOrder(order)';
  const actualValidate = 'validateOrder(order)';
  logger.logStep("Function", "ORDER_VALIDATION", expectedValidate, actualValidate, "OrderValidator");

  const validatedOrder = validateOrder(order);

  const expectedCalculate = 'calculateTotal(validatedOrder)';
  const actualCalculate = 'calculateTotal(validatedOrder)';
  logger.logStep("Function", "TOTAL_CALCULATION", expectedCalculate, actualCalculate, "TotalCalculator");

  const total = calculateTotal(validatedOrder);

  logger.endFlow("ORDER PROCESSING");
  return { ...validatedOrder, total };
};

// Example: Data Pipeline Architecture
class ETLProcessor {
  async runPipeline(sourceData) {
    const logger = createFlowLogger("ETL PIPELINE");
    logger.startFlow("ETL PIPELINE");

    const expectedExtract = `extractFromSource(${sourceData.source})`;
    const actualExtract = `extractFromSource(${sourceData.source})`;
    logger.logStep("Extract", "DATA_EXTRACTION", expectedExtract, actualExtract, "Extractor");

    const rawData = await this.extractFromSource(sourceData.source);

    const expectedTransform = `transformData(${JSON.stringify(rawData)})`;
    const actualTransform = `transformData(${JSON.stringify(rawData)})`;
    logger.logStep("Transform", "DATA_TRANSFORMATION", expectedTransform, actualTransform, "Transformer");

    const transformedData = await this.transformData(rawData);

    const expectedLoad = `loadToTarget(${JSON.stringify(transformedData)})`;
    const actualLoad = `loadToTarget(${JSON.stringify(transformedData)})`;
    logger.logStep("Load", "DATA_LOADING", expectedLoad, actualLoad, "Loader");

    const result = await this.loadToTarget(transformedData);
    logger.endFlow("ETL PIPELINE");

    return result;
  }
}

// Example: Service-Oriented Architecture
class OrderService {
  async processOrder(orderId) {
    const logger = createFlowLogger("ORDER SERVICE");
    logger.startFlow("ORDER SERVICE");

    const expectedFetch = `orderRepository.findById(${orderId})`;
    const actualFetch = `orderRepository.findById(${orderId})`;
    logger.logStep("Service", "ORDER_FETCH", expectedFetch, actualFetch, "OrderRepository");

    const order = await this.orderRepository.findById(orderId);

    const expectedInventory = `inventoryService.checkAvailability(${order.productId})`;
    const actualInventory = `inventoryService.checkAvailability(${order.productId})`;
    logger.logStep("Service", "INVENTORY_CHECK", expectedInventory, actualInventory, "InventoryService");

    const availability = await this.inventoryService.checkAvailability(order.productId);

    logger.endFlow("ORDER SERVICE");
    return { order, availability };
  }
}

// Example: Object-Oriented Architecture
class UserManager {
  createUser(userData) {
    const logger = createFlowLogger("USER CREATION");
    logger.startFlow("USER CREATION");

    const expectedValidate = 'this.validateUserData(userData)';
    const actualValidate = 'this.validateUserData(userData)';
    logger.logStep("Method", "DATA_VALIDATION", expectedValidate, actualValidate, "UserManager");

    this.validateUserData(userData);

    const expectedCreate = 'new User(userData)';
    const actualCreate = 'new User(userData)';
    logger.logStep("Object", "USER_INSTANTIATION", expectedCreate, actualCreate, "UserConstructor");

    const user = new User(userData);

    const expectedSave = 'this.userRepository.save(user)';
    const actualSave = 'this.userRepository.save(user)';
    logger.logStep("Method", "USER_PERSISTENCE", expectedSave, actualSave, "UserRepository");

    this.userRepository.save(user);
    logger.endFlow("USER CREATION");

    return user;
  }
}
```

## Verification Checklist

### Before Implementation
- [ ] Identify your architecture type (Event-Driven, Procedural, Functional, Data Pipeline, Service-Oriented, Object-Oriented)
- [ ] Define complete flow from start to finish
- [ ] Identify all steps in the flow sequence
- [ ] Create expectation contracts for each step
- [ ] Set up universal flow logger infrastructure

### During Implementation
- [ ] Add logging to each step in your flow sequence
- [ ] Use appropriate step types (Event, State, Function, Service, Method, etc.)
- [ ] Add expectation met verification for each step
- [ ] Add discrepancy logging for failed expectations
- [ ] Verify exact code logging (no translations)

### After Implementation
- [ ] Test complete flow and verify all expectations are met
- [ ] Test failure scenarios and verify discrepancy logging works
- [ ] Ensure logs follow universal story format
- [ ] Verify no silent failures or missing steps
- [ ] Confirm logs are human-readable and tell complete story

## Common Patterns

### Form Submission Flow
```
=== USER SUBMITS FORM ===
1. Event: SUBMIT_FORM
   Expected: dispatch({ type: "SUBMIT_FORM", payload: formData })
   <FormComponent> dispatch({ type: "SUBMIT_FORM", payload: formData })
   Expectation Met: true

2. State: IDLE -> SUBMITTING
   Expected: transition(prevState, "SUBMIT_FORM", context)
   Context: { formData, validationErrors: null }
   Expectation Met: true

3. Work: submitForm
   Expected: submitForm(formData)
   <FormSubmitter> submitForm(formData)
   Expectation Met: true

4. Result: SUBMIT_SUCCESS
   Expected: dispatch({ type: "SUBMIT_SUCCESS", payload: { response } })
   <FormSubmitter> dispatch({ type: "SUBMIT_SUCCESS", payload: { response } })
   Expectation Met: true

5. State: SUBMITTING -> SUCCESS
   Expected: transition(prevState, "SUBMIT_SUCCESS", context)
   Expectation Met: true
=== FORM SUBMISSION COMPLETE ===
```

### API Data Fetching Flow
```
=== USER REQUESTS DATA ===
1. Event: FETCH_DATA
   Expected: dispatch({ type: "FETCH_DATA", payload: { endpoint } })
   <DataComponent> dispatch({ type: "FETCH_DATA", payload: { endpoint } })
   Expectation Met: true

2. State: IDLE -> LOADING
   Expected: transition(prevState, "FETCH_DATA", context)
   Context: { endpoint, loading: true }
   Expectation Met: true

3. Work: fetchData
   Expected: fetchData(endpoint)
   <DataFetcher> fetchData(endpoint)
   Expectation Met: true

4. Result: FETCH_SUCCESS
   Expected: dispatch({ type: "FETCH_SUCCESS", payload: { data } })
   <DataFetcher> dispatch({ type: "FETCH_SUCCESS", payload: { data } })
   Expectation Met: true

5. State: LOADING -> LOADED
   Expected: transition(prevState, "FETCH_SUCCESS", context)
   Expectation Met: true
=== DATA FETCH COMPLETE ===
```

## Best Practices

### Do's
- Log every event dispatch with exact code
- Log every state transition with before/after states
- Log every work function call with parameters
- Log every result with complete payload
- Use exact code strings, not human translations
- Include expectation met verification for each step
- Show discrepancy details only when expectations fail

### Don'ts
- Don't log without expectation verification
- Don't use human translations instead of actual code
- Don't skip logging for "simple" operations
- Don't create silent failures or missing steps
- Don't log discrepancies when expectations are met
- Don't mock core functionality in verification

## Integration with Existing Systems

### React Components
```typescript
const YourComponent = () => {
  const dispatch = useYourDispatch();
  const state = useYourState();

  const handleAction = () => {
    // Log event dispatch
    const expected = `dispatch({ type: "ACTION", payload: ${JSON.stringify(payload)} })`;
    const actual = `dispatch({ type: "ACTION", payload: ${JSON.stringify(payload)} })`;
    console.log(`1. Event: ACTION`);
    console.log(`   Expected: ${expected}`);
    console.log(`   <YourComponent> ${actual}`);
    console.log(`   Expectation Met: ${expected === actual}`);

    dispatch({ type: "ACTION", payload });
  };

  return <button onClick={handleAction}>Action</button>;
};
```

### State Machines
```typescript
const yourStateMachine = (state: string, event: YourEvent, context: YourContext) => {
  // Log state transition
  const expected = `transition(${state}, "${event.type}", context)`;
  const actual = `transition(${state}, "${event.type}", context)`;
  console.log(`2. State: ${state} -> ${getNextState(state, event)}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   <StateMachine> ${actual}`);
  console.log(`   Expectation Met: ${expected === actual}`);

  return transitionLogic(state, event, context);
};
```

### Work Functions
```typescript
const yourWorkFunction = async (payload: any) => {
  // Log work execution
  const expected = `yourWorkFunction(${JSON.stringify(payload)})`;
  const actual = `yourWorkFunction(${JSON.stringify(payload)})`;
  console.log(`3. Work: yourWorkFunction`);
  console.log(`   Expected: ${expected}`);
  console.log(`   <WorkExecutor> ${actual}`);
  console.log(`   Expectation Met: ${expected === actual}`);

  try {
    const result = await actualWorkLogic(payload);

    // Log result
    const resultExpected = `dispatch({ type: "WORK_SUCCESS", payload: ${JSON.stringify(result)} })`;
    const resultActual = `dispatch({ type: "WORK_SUCCESS", payload: ${JSON.stringify(result)} })`;
    console.log(`4. Result: WORK_SUCCESS`);
    console.log(`   Expected: ${resultExpected}`);
    console.log(`   <WorkExecutor> ${resultActual}`);
    console.log(`   Expectation Met: ${resultExpected === resultActual}`);

    return result;
  } catch (error) {
    // Log error
    console.log(`4. Result: WORK_FAILED`);
    console.log(`   Expected: work success`);
    console.log(`   <WorkExecutor> work error: ${error}`);
    console.log(`   Expectation Met: false`);
    console.log(`   Discrepancy: actual: error / expected: success`);

    throw error;
  }
};
```

## Success Criteria

1. **Universal Flow Tracing**: Every step from start to finish is logged (any architecture)
2. **Expectation Verification**: Each step has expectation met verification
3. **Discrepancy Visibility**: Failed expectations show actual vs expected
4. **Human Readable**: Logs tell complete story without technical jargon
5. **No Silent Failures**: Every failure is immediately visible in logs
6. **Exact Code Logging**: No translations or abstractions in logged code
7. **Consistent Format**: All flows follow the same numbered story format
8. **Architecture Agnostic**: Works for Event-Driven, Procedural, Functional, Data Pipeline, Service-Oriented, Object-Oriented

## Troubleshooting

### Common Issues
- **Missing Steps**: Ensure every event, state change, and work function is logged
- **False Expectations**: Verify expected code matches actual implementation
- **Silent Failures**: Check that all error paths have logging
- **Translation Errors**: Use exact code strings, not human descriptions
- **Missing Discrepancies**: Ensure discrepancy logging only appears when expectations fail

### Debug Steps
1. Check each numbered step appears in sequence
2. Verify expectation met logic is correct
3. Test failure scenarios to see discrepancy logging
4. Ensure no silent transitions between steps
5. Validate exact code strings match implementation
