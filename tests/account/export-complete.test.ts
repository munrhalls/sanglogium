// Does Anna's export also hold what the sign-in database keeps about her (her
// account, sign-in methods and devices), without any secret?
//
// Cannot lie: The proof reads Anna's rows from the stand-in sign-in database
// and looks for each in the export, and looks for every secret too.

import { prove, customer, exportFor } from './shop.test.ts'
import { rows } from './stand-ins/database.mjs'

prove('Does Anna\'s export also hold what the sign-in database keeps about her (her account, sign-in methods and devices), without any secret?', 'yes', async () => {
  const anna = await customer('anna')
  const download = await exportFor(anna)
  if (download.status !== 200) return `the export answered ${download.status}`
  const text = download.text
  const sessions = (await rows('session')).filter((row) => row.userId === anna.userId)
  const accounts = (await rows('account')).filter((row) => row.userId === anna.userId)
  if (!sessions.length || !accounts.length) throw new Error('control: her sign-in rows were not found')
  const missing = []
  for (const row of accounts) if (!text.includes(row.providerId)) missing.push('her sign-in methods')
  for (const row of sessions) if (!text.includes(row.ipAddress) || !text.includes(row.userAgent)) missing.push('the devices she signed in from')
  const secrets = [...sessions.map((row) => row.token), ...accounts.map((row) => row.password).filter(Boolean)]
  if (secrets.some((value) => text.includes(value))) return 'the export holds a session key or password hash'
  return missing.length ? `the export leaves out ${[...new Set(missing)].join(' and ')}` : null
})
