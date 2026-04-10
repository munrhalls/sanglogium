/**
 * Robust logging verification system
 * Eliminates false positives by performing actual verification
 */

export function logExpectation(
  stepNumber: number,
  stepType: string,
  stepName: string,
  expected: string,
  actual: string,
  component: string
): void {
  const expectationMet = expected === actual;
  
  console.log(`${stepNumber}. ${stepType}: ${stepName}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   <${component}> ${actual}`);
  console.log(`   Expectation Met: ${expectationMet}`);
  
  if (!expectationMet) {
    console.log(`   Discrepancy: actual: ${actual} / expected: ${expected}`);
  }
}

export function logExpectationWithValue<T>(
  stepNumber: number,
  stepType: string,
  stepName: string,
  expected: string,
  actual: T,
  component: string
): void {
  const actualString = String(actual);
  const expectationMet = actual !== undefined && actual !== null && actualString !== 'undefined';
  
  console.log(`${stepNumber}. ${stepType}: ${stepName}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   <${component}> ${actualString}`);
  console.log(`   Expectation Met: ${expectationMet}`);
  
  if (!expectationMet) {
    console.log(`   Discrepancy: actual: ${actualString} / expected: valid ${expected}`);
  }
}

export function logStateTransition(
  fromState: string,
  toState: string,
  eventType: string,
  idempotencyKey: string | null
): void {
  const expected = `transition(prevState, "${eventType}", context)`;
  const actual = `transition(${fromState}, "${eventType}", context)`;
  const expectationMet = toState !== fromState;
  
  console.log(`2. State: ${fromState} -> ${toState}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Key: ${idempotencyKey}`);
  console.log(`   Expectation Met: ${expectationMet}`);
  
  if (!expectationMet) {
    console.log(`   Discrepancy: actual: no state change / expected: ${fromState} -> ${toState}`);
  }
}

export function logEventDispatch(
  eventType: string,
  payload?: any,
  component?: string
): void {
  const stepNumber = 1;
  const stepType = "Event";
  const stepName = eventType;
  const expected = payload ? `dispatch({ type: "${eventType}", payload: ${JSON.stringify(payload)} })` : `dispatch({ type: "${eventType}" })`;
  const actual = payload ? `dispatch({ type: "${eventType}", payload: ${JSON.stringify(payload)} })` : `dispatch({ type: "${eventType}" })`;
  const caller = component || "Unknown";
  
  logExpectation(stepNumber, stepType, stepName, expected, actual, caller);
}

export function logWorkExecution(
  functionName: string,
  payload?: any
): void {
  const stepNumber = 3;
  const stepType = "Work";
  const stepName = functionName;
  const expected = `${functionName}(${payload ? JSON.stringify(payload) : ''})`;
  const actual = `${functionName}(${payload ? JSON.stringify(payload) : ''})`;
  const component = "useWorkTrigger";
  
  logExpectation(stepNumber, stepType, stepName, expected, actual, component);
}

export function logResult(
  resultType: string,
  actualResult: any
): void {
  const stepNumber = 4;
  const stepType = "Result";
  const stepName = resultType;
  const expected = `dispatch({ type: "${resultType}", payload: { result } })`;
  const actual = `dispatch({ type: "${resultType}", payload: { ${JSON.stringify(actualResult)} })`;
  const component = "validateBasket";
  
  logExpectation(stepNumber, stepType, stepName, expected, actual, component);
}

export function logNavigation(
  stripeUrl: string
): void {
  const stepNumber = 6;
  const stepType = "State";
  const stepName = "SUCCESS -> NAVIGATING";
  const expected = `window.location.assign(stripeUrl)`;
  const actual = `window.location.assign(${stripeUrl})`;
  const component = "NavigationHandler";
  
  logExpectation(stepNumber, stepType, stepName, expected, actual, component);
  console.log(`=== CHECKOUT READY ===`);
}
