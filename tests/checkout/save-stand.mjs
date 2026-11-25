// The session and the address check the save actions call.
// The real session talks to the cookie. The real check talks to the registry.
// Neither is used here. The proof scripts the checker's answer and reads what was saved.

let current = null
let saves = 0
let snapshot = null
let scripted = null
let checks = 0

export function beginSession(row) {
  saves = 0
  snapshot = null
  const data = {
    basket: [{ productId: 'a', quantity: 1 }],
    address: undefined,
    shippingCode: 'old',
    shippingCost: 500,
    shippingMethodName: 'Old',
    shippingCarrier: 'OldCarrier',
    shippingEstimatedDays: 2,
    checkoutSessionId: 'sess_save',
    ...row,
  }
  data.save = async () => {
    saves += 1
    const { save, ...rest } = data
    snapshot = structuredClone(rest)
  }
  current = data
  return current
}

export function getCheckoutSession() {
  if (!current) {
    const error = new Error('no session was started')
    error.proofBroken = true
    throw error
  }
  return current
}

export function saveCount() {
  return saves
}

export function savedSnapshot() {
  return snapshot
}

export function scriptCheck(result) {
  scripted = result
  checks = 0
}

export function checkCount() {
  return checks
}

export async function checkAddress() {
  checks += 1
  if (!scripted) {
    const error = new Error('the address check was not scripted')
    error.proofBroken = true
    throw error
  }
  return scripted
}
