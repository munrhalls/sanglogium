// The email service, stood in. Every email lands in this outbox instead of a
// real inbox. The proof can make the service slow (like a real one) or down.

export const outbox = {
  mails: [],
  delayMs: 0,
  failures: 0,
  down: false,
}

export function mailsTo(address) {
  return outbox.mails.filter((mail) => mail.to === address)
}

// Every https link in an email, in order.
export function linksIn(mail) {
  return [...mail.html.matchAll(/href="([^"]+)"/g)].map((match) => match[1].replace(/&amp;/g, '&'))
}

export async function sendEmail(data) {
  if (outbox.delayMs) await new Promise((resolve) => setTimeout(resolve, outbox.delayMs))
  if (outbox.down || outbox.failures > 0) {
    if (outbox.failures > 0) outbox.failures -= 1
    throw new Error('stand-in email service is down')
  }
  outbox.mails.push({ ...data })
}
