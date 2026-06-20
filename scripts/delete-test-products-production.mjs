#!/usr/bin/env node
/**
 * Delete test products from production Sanity dataset.
 * Usage:
 *   node scripts/delete-test-products-production.mjs           <- dry-run (safe, read-only)
 *   node scripts/delete-test-products-production.mjs --delete  <- executes deletion
 */

import { createClient } from 'next-sanity'
import dotenv from 'dotenv'
import readline from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token     = process.env.SANITY_STUDIO_READ_WRITE
const dataset   = 'production'  // hardcoded — never change this to an env var
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'

if (!projectId) { console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID missing in .env'); process.exit(1) }
if (!token)     { console.error('❌ SANITY_STUDIO_READ_WRITE missing in .env');      process.exit(1) }

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

const deleteMode = process.argv.includes('--delete')

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()) }))
}

async function main() {
  console.log('=== Delete Test Products from Production ===')
  console.log(`Dataset  : ${dataset}`)
  console.log(`Mode     : ${deleteMode ? '⚠️  DELETE' : '🔍 DRY-RUN (read-only)'}\n`)

  const products = await client.fetch(`
    *[_type == "product" && (name match "test" || name match "Test")]{
      _id, name, slug, displayPrice, stock
    } | order(name asc)
  `)

  if (products.length === 0) {
    console.log('✅ No test products found in production. Nothing to do.')
    return
  }

  console.log(`Found ${products.length} test product(s):\n`)
  products.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`)
    console.log(`     _id   : ${p._id}`)
    console.log(`     slug  : ${p.slug?.current ?? 'none'}`)
    console.log(`     price : ${p.displayPrice ?? 'none'}`)
    console.log(`     stock : ${p.stock ?? 'none'}`)
    console.log()
  })

  if (!deleteMode) {
    console.log('ℹ️  DRY-RUN complete — no changes made.')
    console.log('   Verify the list above, then run with --delete to proceed.')
    return
  }

  console.log('⚠️  WARNING: This permanently deletes the products listed above from PRODUCTION.')
  const answer = await prompt('Type "confirm" to proceed (anything else cancels): ')
  if (answer !== 'confirm') {
    console.log('❌ Cancelled — no changes made.')
    return
  }

  console.log('\nDeleting...\n')
  let deleted = 0, failed = 0
  for (const p of products) {
    try {
      await client.delete(p._id)
      console.log(`  ✅ Deleted : ${p.name} (${p._id})`)
      deleted++
    } catch (err) {
      console.log(`  ❌ Failed  : ${p.name} (${p._id})`)
      console.log(`     Error  : ${err.message}`)
      if (err.message?.includes('referential integrity')) {
        console.log(`     Fix    : Open Sanity Studio → find this product → check "References" tab → remove references first`)
      }
      failed++
    }
  }

  console.log(`\n=== Done: ${deleted} deleted, ${failed} failed ===`)
  if (failed > 0) process.exit(1)
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
