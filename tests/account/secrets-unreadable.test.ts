// Does the sign-in database keep Anna's password or her two-factor key
// anywhere in readable form?
//
// Cannot lie: The proof searches every row of the stand-in database for the
// exact password and key it just used, and finds Anna's email there as a
// control.

import { prove, customer, turnOnTwoFactor } from './shop.test.ts'
import { rows, tables } from './stand-ins/database.mjs'

prove('Does the sign-in database keep Anna\'s password or her two-factor key anywhere in readable form?', 'no', async () => {
  const anna = await customer('anna')
  const { problem } = await turnOnTwoFactor(anna)
  if (problem) throw new Error(`control: ${problem}`)
  const secrets = { 'her password': anna.password, 'her two-factor key': anna.twoFactorKey.secret, 'her two-factor key as the phone shows it': anna.twoFactorKey.encoded, 'a backup code': anna.backupCodes[0] }
  let sawEmail = false
  const found = []
  for (const table of await tables()) {
    for (const row of await rows(table)) {
      const text = JSON.stringify(row)
      if (text.includes(anna.email)) sawEmail = true
      for (const [what, value] of Object.entries(secrets)) if (text.includes(value)) found.push(`${what} in the ${table} table`)
    }
  }
  if (!sawEmail) throw new Error('control: the search did not find her email either')
  return found.length ? `found ${[...new Set(found)].join(', ')}` : null
})
