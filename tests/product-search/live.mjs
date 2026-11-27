// The real catalogue for the search proofs, read-only and published documents only: the shop's own query
// text and params, sent to the shop's own project and dataset (platform/sanity/env.ts, filled from .env.local
// when that file exists).
//
// To spare the shop's quota, reads travel in groups: up to GROUP reads go in one request as one query object,
// each under its own key with its params renamed, and a read asked twice in one run is sent once.
// sameAsSingle() proves on this run's own reads that a grouped read and a single read give the same answer.
//
// A read that fails is retried; if it still fails it is counted in `failed`, and a proof with failed reads
// gives no verdict (a failed read is not a NO).

import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const GROUP = 100
const PARALLEL = 4
const PROBES = 5

export async function openCatalogue() {
  const envFile = path.join(root, '.env.local')
  if (existsSync(envFile)) process.loadEnvFile(envFile)
  const { projectId, dataset, apiVersion } = await import('@/platform/sanity/env')
  const url = `https://${projectId}.apicdn.sanity.io/v${String(apiVersion).replace(/^v/, '')}/data/query/${dataset}?perspective=published`

  const stats = { requests: 0, bytes: 0, failed: 0 }
  const memo = new Map()
  const probes = []
  let queue = []
  let running = 0
  let scheduled = false

  async function send(query, params) {
    for (let attempt = 1; ; attempt += 1) {
      let status = 0
      let text = ''
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, params }) })
        status = response.status
        text = await response.text()
        if (response.ok) {
          stats.requests += 1
          stats.bytes += Buffer.byteLength(text)
          return JSON.parse(text).result
        }
      } catch (error) {
        text = String(error?.message ?? error)
      }
      const retry = status === 0 || status === 429 || status >= 500
      if (!retry || attempt >= 4) throw new Error(`the catalogue answered ${status || 'nothing'}: ${text.slice(0, 160)}`)
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
    }
  }

  function pump() {
    scheduled = false
    while (running < PARALLEL && queue.length > 0) {
      const group = queue.slice(0, GROUP)
      queue = queue.slice(GROUP)
      running += 1
      const parts = []
      const params = {}
      group.forEach((read, i) => {
        parts.push(`"r${i}": (${read.query.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => `$r${i}_${name}`)})`)
        for (const [name, value] of Object.entries(read.params)) params[`r${i}_${name}`] = value
      })
      send(`{${parts.join(', ')}}`, params)
        .then((result) => group.forEach((read, i) => read.resolve(result[`r${i}`] ?? null)))
        .catch((error) => {
          stats.failed += group.length
          group.forEach((read) => read.reject(error))
        })
        .finally(() => {
          running -= 1
          pump()
        })
    }
  }

  function read(query, params = {}) {
    const key = `${query}\u0000${JSON.stringify(params)}`
    if (!memo.has(key)) {
      if (probes.length < PROBES) probes.push({ query, params, key })
      memo.set(key, new Promise((resolve, reject) => {
        queue.push({ query, params, resolve, reject })
        if (queue.length >= GROUP) pump()
        else if (!scheduled) {
          scheduled = true
          setImmediate(pump)
        }
      }))
    }
    // Each caller gets its own copy, so code that changes what it was given cannot change another search.
    return memo.get(key).then((value) => structuredClone(value))
  }

  async function sameAsSingle() {
    for (const probe of probes) {
      const grouped = JSON.stringify(await memo.get(probe.key))
      const single = JSON.stringify(await send(probe.query, probe.params))
      if (grouped !== single) return `a grouped read differs from the same read sent alone: ${probe.query.slice(0, 80)}`
    }
    return probes.length === 0 ? 'no read was made' : null
  }

  return { read, sameAsSingle, stats }
}
