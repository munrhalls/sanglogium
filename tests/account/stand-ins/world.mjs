// The proof's clock and the edge of the network.
// The clock only moves when the proof moves it forward. Every call to the
// network is refused unless a stand-in answers it, so the proof cannot reach
// the real sign-in database, Sanity, the email service or Google.

const RealDate = globalThis.Date
let offset = 0

class ProofDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(RealDate.now() + offset)
    else super(...args)
  }
  static now() {
    return RealDate.now() + offset
  }
}
globalThis.Date = ProofDate

export const clock = {
  forward(ms) {
    offset += ms
  },
}

export const minutes = (n) => n * 60 * 1000
export const hours = (n) => n * minutes(60)
export const days = (n) => n * hours(24)

const answers = []
export const network = { touched: null }

export function answerNetwork(match, handler) {
  answers.push({ match, handler })
}

globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  for (const answer of answers) if (answer.match(url)) return answer.handler(input, init)
  network.touched ??= new URL(url).host
  throw new Error(`the proof refuses the network: ${new URL(url).host}`)
}
