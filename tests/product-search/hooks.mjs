// A pretend browser for the phone proof: just enough of React's hooks, Next's router, nuqs and the window to run the
// shop's own search hooks (useSearchOverlay, useSearchController, useVisualViewportBox) in plain node.
// phone.test.ts points `react`, `next/navigation` and `nuqs` here. Nothing in it decides a verdict: it only runs the
// shop's hooks the way a browser would, one render after another, effects after each render, timers on a pretend clock.

const BASE = 'https://shop.invalid'
const hosts = new Set()
let active = null
let ids = 0

export function renderHook(fn) {
  const host = { fn, slots: [], pending: [], value: undefined, busy: false, dirty: false }
  host.render = () => {
    if (host.busy) {
      host.dirty = true
      return
    }
    host.busy = true
    try {
      let rounds = 0
      do {
        host.dirty = false
        active = { host, index: 0 }
        host.value = host.fn()
        active = null
        const effects = host.pending
        host.pending = []
        for (const effect of effects) {
          effect.slot.cleanup?.()
          effect.slot.cleanup = effect.run() || undefined
        }
        if (++rounds > 50) throw new Error('a hook never settles')
      } while (host.dirty)
    } finally {
      host.busy = false
    }
  }
  hosts.add(host)
  host.render()
  return {
    get current() {
      return host.value
    },
    unmount() {
      hosts.delete(host)
      for (const s of host.slots) s?.cleanup?.()
    },
  }
}
const renderAll = () => [...hosts].forEach((h) => h.render())

function slot(init) {
  const { host } = active
  const i = active.index++
  if (!(i in host.slots)) host.slots[i] = init()
  return host.slots[i]
}
const same = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => Object.is(x, b[i]))

export function useState(initial) {
  const host = active.host
  const s = slot(() => ({ value: typeof initial === 'function' ? initial() : initial }))
  s.set ??= (next) => {
    const value = typeof next === 'function' ? next(s.value) : next
    if (Object.is(value, s.value)) return
    s.value = value
    host.render()
  }
  return [s.value, s.set]
}
export function useEffect(run, deps) {
  const host = active.host
  const s = slot(() => ({ deps: undefined, first: true }))
  if (s.first || !deps || !same(deps, s.deps)) host.pending.push({ slot: s, run })
  s.first = false
  s.deps = deps
}
export const useLayoutEffect = useEffect
export function useMemo(make, deps) {
  const s = slot(() => ({ deps: undefined, value: undefined, first: true }))
  if (s.first || !same(deps, s.deps)) s.value = make()
  s.first = false
  s.deps = deps
  return s.value
}
export const useCallback = (fn, deps) => useMemo(() => fn, deps)
export const useRef = (initial) => slot(() => ({ current: initial }))
export const useId = () => slot(() => ({ id: `:r${ids++}:` })).id
export const forwardRef = (render) => render
export default { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef, useId, forwardRef }

// ---- the browser: one history, one address, one screen, one clock ----
export const browser = {
  entries: ['/'],
  index: 0,
  url() {
    return this.entries[this.index]
  },
  start(entries) {
    this.entries = [...entries]
    this.index = entries.length - 1
  },
  push(href) {
    this.entries = this.entries.slice(0, this.index + 1)
    this.entries.push(href)
    this.index += 1
    renderAll()
  },
  replace(href) {
    this.entries[this.index] = href
    renderAll()
  },
  back() {
    if (this.index > 0) this.index -= 1
    renderAll()
  },
}

// next/navigation
export const useRouter = () => ({ push: (href) => browser.push(href), replace: (href) => browser.replace(href) })
export const useSearchParams = () => new URL(browser.url(), BASE).searchParams
export const usePathname = () => new URL(browser.url(), BASE).pathname

// nuqs: a boolean URL param, written with push or replace as the parser or the call says (nuqs's own default is replace)
export const parseAsBoolean = {
  withOptions: (options) => ({ ...options, kind: 'boolean' }),
}
export function useQueryState(key, parser = {}) {
  const raw = new URL(browser.url(), BASE).searchParams.get(key)
  const value = raw === null ? null : raw === 'true'
  const set = (next, options = {}) => {
    const url = new URL(browser.url(), BASE)
    if (next === null || next === false) url.searchParams.delete(key)
    else url.searchParams.set(key, String(next))
    const href = `${url.pathname}${url.search}`
    if ((options.history ?? parser.history ?? 'replace') === 'push') browser.push(href)
    else browser.replace(href)
    return Promise.resolve(url.searchParams)
  }
  return [value, set]
}

// a pretend clock for setTimeout / clearTimeout
export const clock = {
  now: 0,
  timers: new Map(),
  next: 1,
  install() {
    globalThis.setTimeout = (fn, ms = 0) => {
      const id = this.next++
      this.timers.set(id, { at: this.now + ms, fn })
      return id
    }
    globalThis.clearTimeout = (id) => this.timers.delete(id)
  },
  async advance(ms) {
    const until = this.now + ms
    for (;;) {
      const due = [...this.timers].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0]
      if (!due) break
      this.timers.delete(due[0])
      this.now = due[1].at
      due[1].fn()
      await settle()
    }
    this.now = until
    await settle()
  },
}
const realImmediate = setImmediate
export const settle = async () => {
  for (let i = 0; i < 5; i += 1) await new Promise((resolve) => realImmediate(resolve))
}
