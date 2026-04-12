// Simple script to create a single test price in Stripe
const fs = require('fs')
const path = require('path')

// Load .env file
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '')
  }
})

// Set environment variables
Object.assign(process.env, envVars)

// Load Stripe
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function createTestPrice() {
  console.log('Creating Stripe test price for checkout tests...')
  
  try {
    // Create a test product first
    const product = await stripe.products.create({
      name: 'Test Product for Checkout',
      description: 'Test product for guest checkout inventory reservation',
      type: 'service'
    })
    
    console.log(`Created product: ${product.id}`)
    
    // Create price in PLN (not USD)
    const price = await stripe.prices.create({
      currency: 'pln',
      unit_amount: 10000, // 100.00 PLN
      product: product.id,
      nickname: 'Test Product - 100 PLN',
      metadata: {
        test: 'guest-checkout-inventory-reservation'
      }
    })
    
    console.log(`\nCreated price: ${price.id}`)
    console.log(`Currency: ${price.currency.toUpperCase()}`)
    console.log(`Amount: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`)
    
    // Update the setup script with the new price ID
    console.log('\nUpdating setup-test-data.cjs with new price ID...')
    
    const setupScriptPath = path.join(__dirname, 'setup-test-data.cjs')
    let setupContent = fs.readFileSync(setupScriptPath, 'utf8')
    
    // Replace the old price ID with the new one
    setupContent = setupContent.replace(
      /stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo'/g,
      `stripePriceId: '${price.id}'`
    )
    
    fs.writeFileSync(setupScriptPath, setupContent)
    console.log('Updated setup script with new price ID')
    
    console.log('\nReady to run test data setup!')
    
  } catch (error) {
    console.error('Failed to create price:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  createTestPrice()
}

module.exports = { createTestPrice }
