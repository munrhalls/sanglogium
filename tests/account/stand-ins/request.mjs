// Next's request headers and cookies, stood in. Each stand-in browser runs its
// server calls inside its own request, so two browsers at once never share one.
// Cookies the server sets during a call land in that browser's cookie jar.

import { AsyncLocalStorage } from 'node:async_hooks'

export const requestScope = new AsyncLocalStorage()

export async function headers() {
  const browser = requestScope.getStore()
  return browser ? browser.requestHeaders() : new Headers()
}

export async function cookies() {
  const browser = requestScope.getStore()
  if (!browser) throw new Error('`cookies` was called outside a request scope.')
  return {
    get: (name) => browser.liveCookies().map(([n, value]) => ({ name: n, value })).find((c) => c.name === name),
    getAll: () => browser.liveCookies().map(([name, value]) => ({ name, value })),
    has: (name) => browser.liveCookies().some(([n]) => n === name),
    set: (name, value, options = {}) => browser.keepCookie(name, value, options),
    delete: (name) => browser.jar.delete(name),
  }
}

export async function draftMode() {
  return { isEnabled: false }
}
