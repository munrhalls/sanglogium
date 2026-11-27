// Search on a phone: the keyboard, the Back button, the size of every control, the search box, and typing speed.
//
// One question per list id. All yes means done:
//   M1  with the on-screen keyboard up, the search sheet ends at the keyboard's top edge, so the list and the
//       "See all results" row stay reachable (and the popup on tablets keeps that row above the keyboard)
//   M2  after opening the sheet and going anywhere from it, Back returns to the page the shopper started on and the
//       sheet stays shut; Back (or the close button) with the sheet open just closes it
//   M3  every control on the search screens is at least 44 pixels tall, and 44 wide when it is an icon
//   M4  the search box shows a Search key, never autocorrects or capitalises model names, and never zooms the page
//   K3  typing a word quickly reads the catalogue once; typing a word typed a moment ago reads it not at all
//
// No browser runs here: a real phone is the owner's own check. The shop's own hooks (useVisualViewportBox,
// useSearchOverlay, useSearchController) run against a pretend browser (hooks.mjs: a history, an address, a screen, a
// clock). What a screen draws is read from its file: the lines that decide it are named in each judge, and sizes are
// judged by the classes that state them (a control that is 44 pixels only by adding padding to an inherited line
// height has no stated size). Every judge is first shown a spoiled copy and must say NO for exactly that copy.
//
// Nothing here reads the network, the real clock or dice: the same files give the same answer twice.
// Exit 0 every question passed. 1 one or more are NO. 2 no verdict: the proof broke.
//
// node --import ./tools/alias-loader.mjs --import ./tests/product-search/load.mjs tests/product-search/phone.test.ts [M1 M2 M3 M4 K3]

import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { broken, chosen, report, run } from './proof.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const fake = pathToFileURL(path.join(here, 'hooks.mjs')).href
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'react' || specifier === 'next/navigation' || specifier === 'nuqs') return { url: fake, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})
const { renderHook, browser, clock, settle } = await import('./hooks.mjs')

const QUESTIONS = {
  M1: "With the on-screen keyboard up, does the search sheet end at the keyboard's top edge, so the list and the 'See all results' row can be reached?",
  M2: 'After opening the search sheet and going to a product or results page, does Back return to the page the shopper started on without reopening the sheet, and does Back with the sheet open just close it?',
  M3: 'Is every control in the search sheet, the search popup and the results page at least 44 pixels in each direction a finger needs?',
  M4: 'Does the search box on a phone show a Search key, never autocorrect or capitalise model names, and never zoom the page?',
  K3: 'While a shopper types a word quickly, or types a word they typed a moment ago, does the shop read the catalogue once at most?',
}
const ASKED = chosen(Object.keys(QUESTIONS))
const UI = 'features/product-search/ui'
const read = (file) => readFileSync(path.join(root, file), 'utf8')
const strip = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/\{\s*\}/g, '')
const flat = (source) => strip(source).replace(/\s+/g, ' ')

// A copy of a shop file with one change, importable: '@/' still resolves; './x' points back at the real folder.
function spoiledCopy(file, from, to) {
  const source = read(file)
  if (!source.includes(from)) broken(`${file} no longer holds "${from}"`)
  const dir = mkdtempSync(path.join(tmpdir(), 'search-proof-'))
  const target = path.join(dir, path.basename(file))
  const folder = path.dirname(path.join(root, file))
  writeFileSync(target, source.replace(from, to).replace(/from (["'])\.\/([^"']+)\1/g, (_, q, rel) => `from ${q}${pathToFileURL(path.join(folder, rel)).href}.ts${q}`))
  return pathToFileURL(target).href
}

// ---- M1: the screen ----
const SHEET = `${UI}/field/SearchSheet.tsx`
const PANEL = `${UI}/field/AutocompletePanel.tsx`
const DESKTOP = `${UI}/field/SearchFieldDesktop.tsx`
function keyboardFindings(box, sheet, panel, desktop) {
  const out = []
  if (!box || box.top !== 100 || box.height !== 380 || box.keyboardOpen !== true) out.push(`with the keyboard up the screen measures ${JSON.stringify(box)}, not the visible 380 pixels below 100`)
  const s = flat(sheet)
  if (!/style=\{box \? \{ top: box\.top, height: box\.height \} : undefined\}/.test(s)) out.push(`${SHEET} is not sized to the visible screen`)
  if (!/"min-h-0 flex-1 overflow-y-auto\b/.test(s)) out.push(`${SHEET}'s list does not scroll inside the sheet`)
  if (!/"sticky bottom-0 /.test(flat(panel))) out.push(`${PANEL}'s "See all results" row is not pinned to the bottom of the list`)
  if (!/viewportBox\.keyboardOpen/.test(flat(desktop)) || !/maxHeight: `min\(36rem, \$\{popupMaxHeight\}px\)`/.test(flat(desktop))) out.push(`${DESKTOP}'s popup is not sized to the visible screen when the keyboard is up`)
  return out
}

// ---- M2: Back ----
const ZERO = `${UI}/field/SearchZeroQueryPanel.tsx`
function linkFindings(file, source) {
  const out = []
  const s = flat(source)
  const handlers = [...s.matchAll(/const (\w+) = \([^()]*(?:\([^()]*\)[^()]*)*\) => \(e: MouseEvent<HTMLAnchorElement>\) => \{ if \(!isPlainLeftClick\(e\)\) return; e\.preventDefault\(\);/g)].map((m) => m[1])
  if (handlers.length === 0) out.push(`${file} has no link handler that keeps the sheet's own navigation`)
  for (const tag of s.matchAll(/<(a|Link)\b(?:[^>{]|\{(?:[^{}]|\{[^{}]*\})*\})*>/g)) {
    const onClick = tag[0].match(/onClick=\{(\w+)\(/)?.[1]
    if (!onClick || !handlers.includes(onClick)) out.push(`${file}: a link (${tag[0].slice(0, 60)}…) leaves the sheet without the sheet's own navigation`)
  }
  return out
}
function wiringFindings(sheet) {
  const s = flat(sheet)
  const wires = ['onProductClick={search.openProduct}', 'onEntryClick={search.openEntry}', 'onViewAll={() => search.submit()}', 'onNavigate={search.go}', 'onSearchTerm={(term) => { search.submit(term); }}']
  return wires.filter((w) => !s.includes(w)).map((w) => `${SHEET} no longer wires ${w.split('=')[0]} to the controller`)
}

// ---- M3: sizes ----
const SIZED = ['field/SearchSheet.tsx', 'field/AutocompletePanel.tsx', 'field/SearchZeroQueryPanel.tsx', 'field/SearchBarTrigger.tsx', 'field/SearchFieldDesktop.tsx', 'field/SearchInput.tsx', 'results/SearchEmpty.tsx', 'results/SearchCategoryChips.tsx', 'results/SearchPagination.tsx', 'results/SearchSort.tsx', 'results/SearchError.tsx'].map((f) => `${UI}/${f}`)
function tagsOf(source) {
  const out = []
  const re = /<(button|a|Link|input|select)\b/g
  let m
  while ((m = re.exec(source))) {
    let depth = 0
    let i = m.index + m[0].length
    let quote = null
    for (; i < source.length; i += 1) {
      const c = source[i]
      if (quote) { if (c === quote && source[i - 1] !== '\\') quote = null; continue }
      if (c === '"' || c === "'" || c === '`') quote = c
      else if (c === '{') depth += 1
      else if (c === '}') depth -= 1
      else if (c === '>' && depth === 0) break
    }
    out.push({ tag: m[1], text: source.slice(m.index, i + 1) })
  }
  return out
}
function classTokens(text, source, seen = new Set()) {
  const tokens = []
  const value = text.match(/className=("[^"]*"|\{)/)
  if (!value) return tokens
  let expr = value[1]
  if (expr === '{') {
    let depth = 0
    let i = text.indexOf('className={') + 'className='.length
    const start = i
    for (; i < text.length; i += 1) {
      if (text[i] === '{') depth += 1
      if (text[i] === '}' && --depth === 0) break
    }
    expr = text.slice(start, i + 1)
  }
  for (const s of expr.matchAll(/["'`]([^"'`]*)["'`]/g)) tokens.push(...s[1].split(/\s+/))
  const named = [...(expr.replace(/["'`][^"'`]*["'`]/g, '').match(/\b[A-Za-z_]\w*\b/g) ?? []), ...[...expr.matchAll(/\$\{(\w+)\}/g)].map((m) => m[1])]
  for (const id of named) {
    if (seen.has(id)) continue
    seen.add(id)
    const def = source.match(new RegExp(`const ${id} =([^;]*);`))
    if (def) tokens.push(...classTokens(`className={${def[1]}}`, source, seen))
  }
  return tokens.filter(Boolean)
}
const TALL = /^(min-)?h-(11|12|14|16)$|^size-(11|12)$/
const WIDE = /^(min-)?w-(11|12|14|16)$|^size-(11|12)$/
function sizeFindings(file, source) {
  const s = strip(source)
  return tagsOf(s).flatMap(({ tag, text }) => {
    const tokens = classTokens(text, s)
    const tall = tokens.some((t) => TALL.test(t)) || (tag === 'input' && tokens.includes('h-full'))
    const icon = /aria-label=/.test(text) && tag !== 'input' && tag !== 'select'
    const wide = !icon || tokens.some((t) => WIDE.test(t)) || tokens.includes('flex-1') || tokens.includes('w-full')
    const name = `${file}: <${tag}${text.match(/aria-label=("[^"]*"|\{`[^`]*`\})/)?.[0] ? ` ${text.match(/aria-label=("[^"]*"|\{`[^`]*`\})/)[0]}` : ''}>`
    if (!tall) return [`${name} has no stated 44-pixel height`]
    if (!wide) return [`${name} is an icon with no stated 44-pixel width`]
    return []
  })
}

// ---- M4: the search box ----
const INPUT = `${UI}/field/SearchInput.tsx`
function inputFindings(input, tailwind, sheet, desktop) {
  const s = flat(input)
  const wanted = ['type="search"', 'inputMode="search"', 'enterKeyHint="search"', 'autoCorrect="off"', 'autoCapitalize="off"', 'spellCheck={false}', 'autoComplete="off"']
  const out = wanted.filter((w) => !s.includes(w)).map((w) => `${INPUT} does not set ${w}`)
  if (!/"text-body /.test(s)) out.push(`${INPUT} does not use the body text size`)
  if (!/\bbody: \["16px"/.test(flat(tailwind))) out.push('the body text size is not 16 pixels (a phone zooms into a box with smaller text)')
  for (const [file, src] of [[SHEET, sheet], [DESKTOP, desktop]]) {
    if (!/<SearchInput\b/.test(src) || /<input\b/.test(strip(src))) out.push(`${file} does not use the one search box`)
  }
  return out
}

// ---- K3: typing ----
async function typingReads(useSearchController) {
  clock.install()
  browser.start(['/'])
  let reads = 0
  const fetchSuggestions = async () => {
    reads += 1
    return []
  }
  const host = renderHook(() => useSearchController({ isSheetOpen: false, fetchSuggestions }))
  const typeWord = async (word, gap) => {
    for (let i = 1; i <= word.length; i += 1) {
      host.current.setQuery(word.slice(0, i))
      await clock.advance(gap)
    }
    await clock.advance(1000)
  }
  await typeWord('sennheiser', 50)
  const fast = reads
  host.current.setQuery('')
  await clock.advance(1000)
  await typeWord('sennheiser', 50)
  const again = reads - fast
  host.unmount()
  return { fast, again }
}
const typingFindings = ({ fast, again }) => [
  ...(fast === 1 ? [] : [`typing "sennheiser" one letter every 50 ms read the catalogue ${fast} times`]),
  ...(again === 0 ? [] : [`typing "sennheiser" again a moment later read the catalogue ${again} more times`]),
]

run(async () => {
  const sheet = read(SHEET)
  const panel = read(PANEL)
  const desktop = read(DESKTOP)
  const results = []

  if (ASKED.includes('M1')) {
    const { useVisualViewportBox } = await import('@/features/product-search/state/useVisualViewportBox')
    const listeners = new Map()
    const vv = { height: 380, offsetTop: 100, scale: 1, addEventListener: (t, f) => listeners.set(t, f), removeEventListener: (t) => listeners.delete(t) }
    globalThis.window = { ...(globalThis.window ?? {}), innerHeight: 800, visualViewport: vv }
    const host = renderHook(() => useVisualViewportBox())
    const box = host.current
    vv.height = 800
    vv.offsetTop = 0
    listeners.get('resize')?.()
    const closed = host.current
    host.unmount()
    const findings = keyboardFindings(box, sheet, panel, desktop)
    if (!closed || closed.keyboardOpen !== false || closed.height !== 800) findings.push(`with the keyboard down the screen measures ${JSON.stringify(closed)}, not the whole 800 pixels`)
    if (keyboardFindings(box, sheet.replace('style={box ? { top: box.top, height: box.height } : undefined}', ''), panel, desktop).length !== findings.length + 1) broken('M1 missed a sheet that is not sized to the screen')
    results.push({ id: 'M1', text: QUESTIONS.M1, checked: 6, unit: 'checks', perCase: false, findings })
  }

  if (ASKED.includes('M2')) {
    globalThis.window = { ...(globalThis.window ?? {}), history: { back: () => browser.back() } }
    const { useSearchOverlay } = await import('@/features/product-search/state/useSearchOverlay')
    const { useSearchController } = await import('@/features/product-search/state/useSearchController')
    const START = '/products/headphones'
    // The header passes one fixed suggestion function (the server action); a new one per render would re-run the controller's fetch effect.
    const noSuggestions = async () => []
    const scenarios = [
      ['open the sheet, search, press Back', (o, c) => c.current.submit('sennheiser')],
      ['open the sheet, tap a product, press Back', (o, c) => c.current.openProduct({ slug: { current: 'zyxwv-phone' } })],
      ['open the sheet, tap a category, press Back', (o, c) => c.current.openEntry({ kind: 'category', label: 'Headphones', href: '/products/headphones' })],
      ['open the sheet, tap "See all results", press Back', (o, c) => { c.current.setQuery('hd'); c.current.submit() }],
    ]
    const findings = []
    for (const [label, act] of scenarios) {
      browser.start(['/', START])
      const o = renderHook(() => useSearchOverlay())
      const c = renderHook(() => useSearchController({ isSheetOpen: o.current.isSearchOpen, fetchSuggestions: noSuggestions }))
      o.current.openSearch()
      act(o, c)
      await settle()
      browser.back()
      if (browser.url() !== START || o.current.isSearchOpen) findings.push(`${label}: Back shows ${browser.url()}${o.current.isSearchOpen ? ' with the sheet open' : ''}, not ${START}`)
      o.unmount()
      c.unmount()
    }
    for (const [label, close] of [['open the sheet, press Back', () => browser.back()], ['open the sheet, tap close', (o) => o.current.closeSearch()]]) {
      browser.start(['/', START])
      const o = renderHook(() => useSearchOverlay())
      o.current.openSearch()
      close(o)
      const at = browser.url()
      const open = o.current.isSearchOpen
      browser.back()
      if (at !== START || open || browser.url() !== '/') findings.push(`${label}: the sheet does not just close (it shows ${at}${open ? ' with the sheet open' : ''}, and Back after it shows ${browser.url()})`)
      o.unmount()
    }
    browser.start(['/', `${START}?search=true`])
    const reloaded = renderHook(() => useSearchOverlay())
    reloaded.current.closeSearch()
    if (browser.url() !== START || reloaded.current.isSearchOpen || browser.index !== 1) findings.push(`a page opened with the sheet in its address: closing shows ${browser.url()} at history place ${browser.index}`)
    reloaded.unmount()
    findings.push(...linkFindings(PANEL, panel), ...linkFindings(ZERO, read(ZERO)), ...wiringFindings(sheet))
    const spoiled = linkFindings(PANEL, panel.replace('onClick={handleClick(onViewAll)}', ''))
    if (spoiled.length !== linkFindings(PANEL, panel).length + 1) broken('M2 missed a link that skips the sheet navigation')
    results.push({ id: 'M2', text: QUESTIONS.M2, checked: scenarios.length + 3, unit: 'journeys and link files', perCase: false, findings })
  }

  if (ASKED.includes('M3')) {
    const header = flat(read(`${UI}/results/SearchHeader.tsx`))
    const findings = SIZED.flatMap((f) => sizeFindings(f, read(f)))
    if (!/<nav aria-label="Breadcrumb" className="[^"]*\bhidden sm:block\b/.test(header)) findings.push(`${UI}/results/SearchHeader.tsx: the breadcrumb, its only control, is no longer hidden on phones`)
    const before = sizeFindings(SHEET, sheet).length
    if (sizeFindings(SHEET, sheet.replace('flex h-11 w-11 shrink-0 items-center justify-center text-secondary-400', 'flex h-9 w-9 shrink-0 items-center justify-center text-secondary-400')).length !== before + 1) broken('M3 missed a shrunken button')
    const controls = SIZED.reduce((n, f) => n + tagsOf(strip(read(f))).length, 0)
    results.push({ id: 'M3', text: QUESTIONS.M3, checked: controls, unit: 'controls', findings })
  }

  if (ASKED.includes('M4')) {
    const input = read(INPUT)
    const tailwind = read('tailwind.config.ts')
    const findings = inputFindings(input, tailwind, sheet, desktop)
    if (inputFindings(input.replace('autoCorrect="off"', 'autoCorrect="on"'), tailwind, sheet, desktop).length !== findings.length + 1) broken('M4 missed autocorrect turned on')
    results.push({ id: 'M4', text: QUESTIONS.M4, checked: 10, unit: 'checks', perCase: false, findings })
  }

  if (ASKED.includes('K3')) {
    const real = await import('@/features/product-search/state/useSearchController')
    const findings = typingFindings(await typingReads(real.useSearchController))
    const noWait = await import(spoiledCopy('features/product-search/state/useSearchController.ts', 'const DEBOUNCE_MS = 150;', 'const DEBOUNCE_MS = 0;'))
    if (typingFindings(await typingReads(noWait.useSearchController)).length === 0) broken('K3 judged a controller with no wait between keystrokes yes')
    results.push({ id: 'K3', text: QUESTIONS.K3, checked: 2, unit: 'typing runs', perCase: false, findings })
  }
  return report(results)
})
