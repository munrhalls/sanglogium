// Admin proof.
//
// One line per question. PASS means the shop answered the way the question says
// it must. NO means it did not, and the words after the question say what really
// happened. A NO is a true answer. Never edit a question to match the shop.
//
// Nothing here calls Stripe, Sanity, Resend or the sign-in database. Each is a
// stand-in in tests/admin/standins.mjs that records every call, and the stand-ins
// are checked against their own rules before the shop is asked anything.
// Made-up people live at .invalid addresses. The same run twice prints the same lines.
//
// All questions:
//   node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/admin/load.mjs tests/admin/admin.test.ts
// One group: add entry, config, list, notices or ci at the end.
//
// Exit 0: every line PASS. 1: one or more NO. 2: the proof itself broke.

import { standInsKeepTheirRules, firstLine } from './standins.mjs'

const groups: Record<string, string> = {
  entry: './entry.test.ts',
  config: './config.test.ts',
  list: './list.test.ts',
  notices: './notices.test.ts',
  ci: './ci.test.ts',
}

// The shop's own log lines are not answers; they are muted so only the questions print.
const print = console.log.bind(console)

async function main(): Promise<number> {
  const picked = process.argv.slice(2)
  for (const name of picked) {
    if (!groups[name]) {
      print(`proof broken: there is no group called ${name}`)
      return 2
    }
  }
  const chosen = picked.length ? picked : Object.keys(groups)
  let total = 0
  let wrong = 0
  for (const name of ["log", "info", "warn", "error", "debug"] as const) console[name] = () => {}
  try {
    await standInsKeepTheirRules()
    for (const name of chosen) {
      const group = await import(groups[name])
      print(`\n${group.title}`)
      for (const answer of await group.ask()) {
        total += 1
        if (!answer.pass) wrong += 1
        print(`${answer.pass ? 'PASS' : 'NO  '} ${answer.id}: ${answer.question} ${answer.said}`)
      }
    }
  } catch (error) {
    print((error as { proofBroken?: boolean })?.proofBroken ? (error as Error).message : `proof broken: ${firstLine(error)}`)
    return 2
  }
  print('')
  print(wrong ? `NO: ${wrong} of ${total} questions` : 'PASS')
  return wrong ? 1 : 0
}

process.exitCode = await main()
