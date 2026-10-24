// Hello-world preflight for Jev (typesafe-ai/jev) via Vercel AI Gateway.
// Run: node --env-file=.env.local tools/jev-hello.mjs
import { experimental_decide as decide } from 'ai'

const result = await decide({
  model: 'typesafe-ai/jev',
  state: 'The support agent issued a full refund to the customer.',
  questions: {
    refunded: {
      type: 'boolean',
      instructions: 'Was a refund issued?',
    },
  },
})

console.log(JSON.stringify(result, null, 2))
