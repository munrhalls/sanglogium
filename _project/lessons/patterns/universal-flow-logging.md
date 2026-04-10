# Pattern: Universal Flow Logging System

**Date:** 2026-04-09
**Source:** Generalization of event flow logging system
**Severity:** High
**Frequency:** Universal (applies to all development patterns)

## The Problem
Event flow logging was specific to event-driven architectures. Other patterns (procedural, functional, data pipelines, etc.) lacked comprehensive flow tracing and verification.

## Root Cause
- Logging pattern was too tightly coupled to event-driven concepts
- No generalized framework for different architecture types
- Missing verification patterns for non-event systems

## The Fix
Created universal flow logging system that adapts to any architecture type while maintaining:
- Complete flow tracing from start to finish
- Expectation verification at each step
- Human-readable story format
- Discrepancy logging for failures
- No silent failures

## Universal Flow Pattern

### Core Structure (Applies to Any Architecture)
```
=== [ACTION TYPE] START ===
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

=== [ACTION TYPE] COMPLETE ===
```

## Architecture-Specific Examples

### 1. Procedural Architecture
**Use Case:** Sequential function calls, data processing pipelines

```typescript
// Example: Data processing pipeline
function processData(inputData) {
  console.log(`=== DATA PROCESSING START ===`);
  
  // Step 1: Validation
  const expectedValidation = `validateInput(${JSON.stringify(inputData)})`;
  const actualValidation = `validateInput(${JSON.stringify(inputData)})`;
  console.log(`1. Validation: INPUT_VALIDATION`);
  console.log(`   Expected: ${expectedValidation}`);
  console.log(`   <DataProcessor> ${actualValidation}`);
  console.log(`   Expectation Met: ${expectedValidation === actualValidation}`);
  
  const isValid = validateInput(inputData);
  
  // Step 2: Transformation
  const expectedTransform = `transformData(${JSON.stringify(isValid)})`;
  const actualTransform = `transformData(${JSON.stringify(isValid)})`;
  console.log(`2. Transformation: DATA_TRANSFORM`);
  console.log(`   Expected: ${expectedTransform}`);
  console.log(`   <DataTransformer> ${actualTransform}`);
  console.log(`   Expectation Met: ${expectedTransform === actualTransform}`);
  
  const transformed = transformData(isValid);
  
  // Step 3: Output
  const expectedOutput = `generateOutput(${JSON.stringify(transformed)})`;
  const actualOutput = `generateOutput(${JSON.stringify(transformed)})`;
  console.log(`3. Output: OUTPUT_GENERATION`);
  console.log(`   Expected: ${expectedOutput}`);
  console.log(`   <OutputGenerator> ${actualOutput}`);
  console.log(`   Expectation Met: ${expectedOutput === actualOutput}`);
  
  const result = generateOutput(transformed);
  console.log(`=== DATA PROCESSING COMPLETE ===`);
  
  return result;
}
```

### 2. Functional Architecture
**Use Case:** Pure functions, composition, immutable data

```typescript
// Example: Functional composition chain
const processOrder = (order) => {
  console.log(`=== ORDER PROCESSING START ===`);
  
  // Step 1: Validate order
  const expectedValidate = `validateOrder(order)`;
  const actualValidate = `validateOrder(${JSON.stringify(order)})`;
  console.log(`1. Function: ORDER_VALIDATION`);
  console.log(`   Expected: ${expectedValidate}`);
  console.log(`   <OrderValidator> ${actualValidate}`);
  console.log(`   Expectation Met: ${expectedValidate === actualValidate}`);
  
  const validatedOrder = validateOrder(order);
  
  // Step 2: Calculate total
  const expectedCalculate = `calculateTotal(validatedOrder)`;
  const actualCalculate = `calculateTotal(${JSON.stringify(validatedOrder)})`;
  console.log(`2. Function: TOTAL_CALCULATION`);
  console.log(`   Expected: ${expectedCalculate}`);
  console.log(`   <TotalCalculator> ${actualCalculate}`);
  console.log(`   Expectation Met: ${expectedCalculate === actualCalculate}`);
  
  const total = calculateTotal(validatedOrder);
  
  // Step 3: Apply discount
  const expectedDiscount = `applyDiscount(total, validatedOrder.customer)`;
  const actualDiscount = `applyDiscount(${total}, ${JSON.stringify(validatedOrder.customer)})`;
  console.log(`3. Function: DISCOUNT_APPLICATION`);
  console.log(`   Expected: ${expectedDiscount}`);
  console.log(`   <DiscountApplier> ${actualDiscount}`);
  console.log(`   Expectation Met: ${expectedDiscount === actualDiscount}`);
  
  const finalTotal = applyDiscount(total, validatedOrder.customer);
  console.log(`=== ORDER PROCESSING COMPLETE ===`);
  
  return { ...validatedOrder, total: finalTotal };
};
```

### 3. Data Pipeline Architecture
**Use Case:** ETL processes, batch processing, stream processing

```typescript
// Example: ETL pipeline
class ETLProcessor {
  async runPipeline(sourceData) {
    console.log(`=== ETL PIPELINE START ===`);
    
    // Step 1: Extract
    const expectedExtract = `extractFromSource(${sourceData.source})`;
    const actualExtract = `extractFromSource(${sourceData.source})`;
    console.log(`1. Extract: DATA_EXTRACTION`);
    console.log(`   Expected: ${expectedExtract}`);
    console.log(`   <Extractor> ${actualExtract}`);
    console.log(`   Expectation Met: ${expectedExtract === actualExtract}`);
    
    const rawData = await this.extractFromSource(sourceData.source);
    
    // Step 2: Transform
    const expectedTransform = `transformData(${JSON.stringify(rawData)})`;
    const actualTransform = `transformData(${JSON.stringify(rawData)})`;
    console.log(`2. Transform: DATA_TRANSFORMATION`);
    console.log(`   Expected: ${expectedTransform}`);
    console.log(`   <Transformer> ${actualTransform}`);
    console.log(`   Expectation Met: ${expectedTransform === actualTransform}`);
    
    const transformedData = await this.transformData(rawData);
    
    // Step 3: Load
    const expectedLoad = `loadToTarget(${JSON.stringify(transformedData)})`;
    const actualLoad = `loadToTarget(${JSON.stringify(transformedData)})`;
    console.log(`3. Load: DATA_LOADING`);
    console.log(`   Expected: ${expectedLoad}`);
    console.log(`   <Loader> ${actualLoad}`);
    console.log(`   Expectation Met: ${expectedLoad === actualLoad}`);
    
    const result = await this.loadToTarget(transformedData);
    console.log(`=== ETL PIPELINE COMPLETE ===`);
    
    return result;
  }
}
```

### 4. Service-Oriented Architecture
**Use Case:** Microservices, API calls, service composition

```typescript
// Example: Service orchestration
class OrderService {
  async processOrder(orderId) {
    console.log(`=== ORDER SERVICE START ===`);
    
    // Step 1: Fetch order
    const expectedFetch = `orderRepository.findById(${orderId})`;
    const actualFetch = `orderRepository.findById(${orderId})`;
    console.log(`1. Service: ORDER_FETCH`);
    console.log(`   Expected: ${expectedFetch}`);
    console.log(`   <OrderRepository> ${actualFetch}`);
    console.log(`   Expectation Met: ${expectedFetch === actualFetch}`);
    
    const order = await this.orderRepository.findById(orderId);
    
    // Step 2: Check inventory
    const expectedInventory = `inventoryService.checkAvailability(${order.productId})`;
    const actualInventory = `inventoryService.checkAvailability(${order.productId})`;
    console.log(`2. Service: INVENTORY_CHECK`);
    console.log(`   Expected: ${expectedInventory}`);
    console.log(`   <InventoryService> ${actualInventory}`);
    console.log(`   Expectation Met: ${expectedInventory === actualInventory}`);
    
    const availability = await this.inventoryService.checkAvailability(order.productId);
    
    // Step 3: Process payment
    const expectedPayment = `paymentService.processCharge(${order.total})`;
    const actualPayment = `paymentService.processCharge(${order.total})`;
    console.log(`3. Service: PAYMENT_PROCESSING`);
    console.log(`   Expected: ${expectedPayment}`);
    console.log(`   <PaymentService> ${actualPayment}`);
    console.log(`   Expectation Met: ${expectedPayment === actualPayment}`);
    
    const payment = await this.paymentService.processCharge(order.total);
    console.log(`=== ORDER SERVICE COMPLETE ===`);
    
    return { order, availability, payment };
  }
}
```

### 5. Class-Based OO Architecture
**Use Case:** Object instantiation, method calls, inheritance chains

```typescript
// Example: Object lifecycle management
class UserManager {
  createUser(userData) {
    console.log(`=== USER CREATION START ===`);
    
    // Step 1: Validate data
    const expectedValidate = `this.validateUserData(${JSON.stringify(userData)})`;
    const actualValidate = `this.validateUserData(${JSON.stringify(userData)})`;
    console.log(`1. Method: DATA_VALIDATION`);
    console.log(`   Expected: ${expectedValidate}`);
    console.log(`   <UserManager> ${actualValidate}`);
    console.log(`   Expectation Met: ${expectedValidate === actualValidate}`);
    
    this.validateUserData(userData);
    
    // Step 2: Create user object
    const expectedCreate = `new User(${JSON.stringify(userData)})`;
    const actualCreate = `new User(${JSON.stringify(userData)})`;
    console.log(`2. Object: USER_INSTANTIATION`);
    console.log(`   Expected: ${expectedCreate}`);
    console.log(`   <UserConstructor> ${actualCreate}`);
    console.log(`   Expectation Met: ${expectedCreate === actualCreate}`);
    
    const user = new User(userData);
    
    // Step 3: Save to database
    const expectedSave = `this.userRepository.save(${JSON.stringify(user)})`;
    const actualSave = `this.userRepository.save(${JSON.stringify(user)})`;
    console.log(`3. Method: USER_PERSISTENCE`);
    console.log(`   Expected: ${expectedSave}`);
    console.log(`   <UserRepository> ${actualSave}`);
    console.log(`   Expectation Met: ${expectedSave === actualSave}`);
    
    this.userRepository.save(user);
    console.log(`=== USER CREATION COMPLETE ===`);
    
    return user;
  }
}
```

## Universal Implementation Template

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

// Usage example
const logger = createFlowLogger("Data Processing");

logger.startFlow("DATA PROCESSING");
logger.logStep("Function", "VALIDATION", "validateInput(data)", "validateInput(data)", "DataProcessor");
logger.logStep("Function", "TRANSFORMATION", "transformData(validated)", "transformData(validated)", "DataTransformer");
logger.endFlow("DATA PROCESSING");
```

## Prevention
**MANDATORY:** For any architecture type:
1. Identify the flow type (Event, Procedural, Functional, Data Pipeline, Service, Object)
2. Map the complete sequence from start to finish
3. Apply universal logging pattern with expectation verification
4. Use exact code logging (no translations)
5. Include discrepancy logging for failed expectations

## Applicability
**When to apply:**
- **Event-Driven**: UI Event -> State -> Work -> Result -> State
- **Procedural**: Step 1 -> Step 2 -> Step 3 -> Complete
- **Functional**: Function 1 -> Function 2 -> Function 3 -> Result
- **Data Pipeline**: Extract -> Transform -> Load -> Complete
- **Service-Oriented**: Service 1 -> Service 2 -> Service 3 -> Result
- **Object-Oriented**: Instantiate -> Method 1 -> Method 2 -> Persist

**Keywords:** ["universal-flow-logging", "architecture-agnostic", "complete-trace", "expectation-verification", "procedural-logging", "functional-logging", "pipeline-logging", "service-logging", "object-logging"]
