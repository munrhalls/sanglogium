// The shape every search proof shares: questions named by their list id, findings sorted, one report.
//
// A question passes when it has no finding. A finding is one plain sentence about one case.
// `node <proof> R1 R2` answers only those questions; `--full` prints every finding, not only the first five.
// Exit 0 every question passed, 1 one or more are NO, 2 no verdict (a read failed or the proof broke).

export class ProofBroken extends Error {}

export function broken(message) {
  throw new ProofBroken(`proof broken: ${message}`)
}

const args = process.argv.slice(2)
export const full = args.includes('--full')

export function chosen(known) {
  const asked = args.filter((arg) => !arg.startsWith('--'))
  for (const id of asked) if (!known.includes(id)) broken(`there is no question ${id} here`)
  return asked.length > 0 ? known.filter((id) => asked.includes(id)) : known
}

// questions: [{ id, text, checked, unit, findings: string[], perCase? }], already limited to the chosen ones.
// perCase false: the findings are statements about the whole question, not one per case.
export function report(questions) {
  let nos = 0
  for (const question of questions) {
    if (question.checked === 0) broken(`${question.id} checked nothing`)
    const findings = [...question.findings].sort()
    console.log(`${question.id} ${question.text}`)
    const perCase = question.perCase !== false
    if (findings.length === 0) {
      console.log(perCase ? `  PASS — ${question.checked} of ${question.checked} ${question.unit}` : `  PASS — ${question.checked} ${question.unit} checked`)
      continue
    }
    nos += 1
    console.log(perCase ? `  NO — ${findings.length} of ${question.checked} ${question.unit}:` : `  NO — ${question.checked} ${question.unit} checked:`)
    const shown = full ? findings : findings.slice(0, 5)
    for (const finding of shown) console.log(`    ${finding}`)
    if (shown.length < findings.length) console.log(`    … ${findings.length - shown.length} more (--full prints all)`)
  }
  console.log(nos === 0 ? 'PASS' : `${nos} NO`)
  return nos === 0 ? 0 : 1
}

export async function run(main) {
  try {
    process.exitCode = await main()
  } catch (error) {
    console.log(error instanceof ProofBroken ? error.message : `proof broken: ${error?.stack ?? error}`)
    process.exitCode = 2
  }
}

// A judge must say NO to answers we spoiled on purpose, for exactly the spoiled case, and keep every
// other verdict. cases: [{ key, ... }], judge(case, answer) -> finding | null, answers: Map key -> answer,
// spoil(case, answer) -> a spoiled copy. Returns null when the judge passed this test.
export function spoilTest(cases, judge, answers, spoil) {
  const before = cases.map((c) => judge(c, answers.get(c.key)))
  const target = cases.findIndex((c, i) => before[i] === null && spoil(c, answers.get(c.key)) !== null)
  if (target < 0) return null
  const spoiled = new Map(answers)
  spoiled.set(cases[target].key, spoil(cases[target], answers.get(cases[target].key)))
  for (let i = 0; i < cases.length; i += 1) {
    const after = judge(cases[i], spoiled.get(cases[i].key))
    if (i === target && after === null) return `a spoiled answer for ${cases[i].key} was judged yes`
    if (i !== target && (after === null) !== (before[i] === null)) return `spoiling ${cases[target].key} changed the verdict for ${cases[i].key}`
  }
  return null
}
