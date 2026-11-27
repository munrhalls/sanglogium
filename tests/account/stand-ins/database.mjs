// The sign-in database, stood in: a real SQLite file in a fresh temp folder,
// deleted when the proof ends. The shop's sign-in code talks to it through the
// same driver it uses for Turso. The proof can make one write fail.

import { mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { Kysely } from 'kysely'
import { LibsqlDialect as RealLibsqlDialect } from 'kysely-libsql'

// The libsql client the shop's driver itself depends on, not a second copy.
const driverRequire = createRequire(createRequire(import.meta.url).resolve('kysely-libsql'))
const { createClient } = await import(pathToFileURL(driverRequire.resolve('@libsql/client')).href)

const folder = mkdtempSync(path.join(os.tmpdir(), 'account-proof-'))
process.on('exit', () => rmSync(folder, { recursive: true, force: true }))

const client = createClient({ url: `file:${path.join(folder, 'sign-in.db')}` })

let refuse = null

// The next statement whose SQL matches is refused once, as a lost connection would be.
export function refuseOnce(match) {
  refuse = match
}

function guard(sql) {
  if (refuse && refuse.test(sql)) {
    refuse = null
    throw new Error('stand-in sign-in database refused the write')
  }
}

const guarded = {
  execute: async (statement) => {
    guard(typeof statement === 'string' ? statement : statement.sql)
    return client.execute(statement)
  },
  batch: (...args) => client.batch(...args),
  transaction: async (mode) => {
    const tx = await client.transaction(mode)
    return {
      execute: async (statement) => {
        guard(typeof statement === 'string' ? statement : statement.sql)
        return tx.execute(statement)
      },
      batch: (...args) => tx.batch(...args),
      commit: () => tx.commit(),
      rollback: () => tx.rollback(),
      close: () => tx.close(),
      get closed() {
        return tx.closed
      },
    }
  },
  close: () => {},
  get closed() {
    return false
  },
}

export class LibsqlDialect extends RealLibsqlDialect {
  constructor() {
    super({ client: guarded })
  }
}

// For the proof's own reading and for creating the tables.
export const proofDb = new Kysely({ dialect: new RealLibsqlDialect({ client }) })

export async function rows(table) {
  const result = await client.execute(`select * from "${table}"`)
  return result.rows.map((row) => ({ ...row }))
}

export async function tables() {
  const result = await client.execute(`select name from sqlite_master where type = 'table' and name not like 'sqlite_%' and name not like 'kysely_%'`)
  return result.rows.map((row) => row.name)
}
