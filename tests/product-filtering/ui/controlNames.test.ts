// Control names proof: does every filter, sort, chip and page control carry a name and a state a screen reader reads? PASS or NO. It tells the truth and nothing else.
//
// One question (K2 in docs/features/filters-sorting-shopper-proofs.md). Yes means done:
//   each box sits in a label holding its option text and number, and is checked exactly when ticked; each slider is named after its own control, its two thumbs apart;
//   the sort menu has a label; each chip says "Remove <control>: <choice>" and Clear all is a button; the current page says it is the current page and each page link names its page.
// What is judged is the markup the real components draw (react-dom/server, no DOM, no browser) for hand-written inputs with alien content. Pagination reads the address through Next's own
// two contexts, which are given the real values; nothing is replaced.
// It can say NO: before judging, the same judge is given a copy of the markup with one name taken out and must say NO.
// No flakiness: every input is literal and every expected name is written by hand.
//
// Human-run: npx vitest run --config tools/vitest.config.ts --reporter=verbose 2>&1 | grep -E "^(1 |  1 |RESULT|NO VERDICT)"
// (vitest is only the loader that lets plain node read .tsx; the verbose reporter keeps a passing run's lines; the filter keeps the proof's own lines, so two runs print the same text, without vitest's timings.
// No RESULT line means no verdict: the file could not even load.)

import { test, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PathnameContext, SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { PanelBody } from '@/features/product-filtering/ui/PanelBody';
import { SelectionChips } from '@/features/product-filtering/ui/SelectionChips';
import { SortSelect } from '@/features/product-filtering/ui/SortSelect';
import { Pagination } from '@/features/products/ui/listing/Pagination';
import type { Panel } from '@/features/product-filtering/core/types/panel';
import type { Chip } from '@/features/product-filtering/core/types/chips';

const PANEL: Panel = {
  sections: [
    {
      key: '',
      label: '',
      icon: '',
      controls: [
        { path: 'zorpSize', kind: 'checkbox', label: 'Zorp size', options: [{ value: 'wide', text: 'Wide', count: 3, ticked: true }, { value: 'narrow', text: 'Narrow', count: 1, ticked: false }] },
        { path: 'blipMode', kind: 'toggle', label: 'Blip mode', on: false },
        { path: 'gleamWeight', kind: 'range', label: 'Gleam weight', span: { min: 2, max: 9 }, selected: null },
        { path: 'price_data.unit_amount', kind: 'range', label: 'Price', span: { min: 100, max: 90000 }, selected: { min: 500, max: 9000 } },
      ],
    },
  ],
};
const CHIPS: Chip[] = [{ id: '["zorpSize","wide"]', kind: 'option', path: 'zorpSize', value: 'wide', label: 'Zorp size', text: 'Wide' }];
const SORTS = [{ id: '', label: 'Recently added', selection: null }, { id: '["gleamWeight","asc"]', label: 'Gleam weight: low to high', selection: { field: 'gleamWeight', direction: 'asc' as const } }];

const noop = () => {};
const h = React.createElement;
const markup = () => ({
  panel: renderToStaticMarkup(h(PanelBody, { panel: PANEL, onClick: noop })),
  chips: renderToStaticMarkup(h(SelectionChips, { chips: CHIPS, onRemove: noop, onClear: noop })),
  sort: renderToStaticMarkup(h(SortSelect, { options: SORTS, value: '', onChange: noop })),
  pages: renderToStaticMarkup(
    h(PathnameContext.Provider, { value: '/products/zorps' },
      h(SearchParamsContext.Provider, { value: new URLSearchParams('zorpSize=wide&page=2') },
        h(Pagination, { currentPage: 2, totalPages: 3, totalCount: 60, perPage: 24 }))),
  ),
});

const attrs = (tag: string): Record<string, string> => Object.fromEntries([...tag.matchAll(/([a-zA-Z-]+)(?:="([^"]*)")?/g)].slice(1).map((m) => [m[1], m[2] ?? '']));
const textOf = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function judge(m: ReturnType<typeof markup>): string[] {
  const f: string[] = [];
  // boxes: inside a label with their text and number; checked exactly when ticked
  const labels = [...m.panel.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/g)].map((x) => x[1]);
  for (const c of PANEL.sections[0].controls) {
    if (c.kind === 'checkbox') {
      for (const o of c.options) {
        const l = labels.find((x) => x.includes(`value="${o.value}"`));
        if (!l) { f.push(`box "${o.text}" has no label around it`); continue; }
        const input = attrs(l.match(/<input[^>]*>/)![0]);
        if (!textOf(l).includes(o.text)) f.push(`box "${o.text}": its label does not hold its text`);
        if (!/aria-label="\d+ products?"/.test(l) && !textOf(l).includes(String(o.count))) f.push(`box "${o.text}": its label does not hold its number`);
        if (('checked' in input) !== o.ticked) f.push(`box "${o.text}": checked is ${'checked' in input}, ticked is ${o.ticked}`);
      }
    }
    if (c.kind === 'toggle') {
      const l = labels.find((x) => x.includes(`name="${c.path}"`));
      if (!l || !textOf(l).includes(c.label)) f.push(`toggle "${c.label}" has no label holding its name`);
    }
  }
  // sliders: named after their own control, the two thumbs apart
  const ranges = [...m.panel.matchAll(/<input[^>]*type="range"[^>]*>/g)].map((x) => attrs(x[0]));
  const rangeControls = PANEL.sections[0].controls.filter((c) => c.kind === 'range');
  if (ranges.length !== rangeControls.length * 2) f.push(`${ranges.length} slider thumbs for ${rangeControls.length} ranges`);
  rangeControls.forEach((c, i) => {
    const [a, b] = [ranges[2 * i], ranges[2 * i + 1]];
    for (const r of [a, b]) if (!r || !(r['aria-label'] ?? '').toLowerCase().includes(c.label.toLowerCase())) f.push(`a thumb of "${c.label}" is named "${r?.['aria-label']}"`);
    if (a && b && a['aria-label'] === b['aria-label']) f.push(`the two thumbs of "${c.label}" have the same name`);
  });
  // sort: a label tied to the menu
  const sel = attrs(m.sort.match(/<select[^>]*>/)?.[0] ?? '<select>');
  const forLabel = m.sort.match(/<label[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/label>/);
  if (!(sel['aria-label'] || (forLabel && forLabel[1] === sel.id && textOf(forLabel[2])))) f.push('the sort menu has no label');
  // chips
  const chipButtons = [...m.chips.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].map((x) => ({ a: attrs(`<b${x[1]}>`), text: textOf(x[2]) }));
  for (const c of CHIPS) if (!chipButtons.some((b) => b.a['aria-label'] === `Remove ${c.label}: ${c.text}`)) f.push(`no chip named "Remove ${c.label}: ${c.text}"`);
  if (!chipButtons.some((b) => b.text === 'Clear all')) f.push('no "Clear all" button');
  // pages
  if (!/aria-current="page"[^>]*>2</.test(m.pages)) f.push('the current page 2 does not say it is the current page');
  for (const n of [1, 3]) if (!m.pages.includes(`aria-label="Go to page ${n}"`)) f.push(`the link to page ${n} has no name`);
  return f;
}

test('control names', () => {
  const m = markup();
  const planted = judge({ ...m, chips: m.chips.replace(/aria-label="Remove [^"]*"/, '') });
  if (planted.length === 0) { console.log('NO VERDICT: the proof itself is broken\n  the judge said yes to markup with a chip name taken out'); expect('no verdict').toBe('verdict'); return; }
  const findings = judge(m);
  console.log(`\n1 ${findings.length ? 'NO' : 'yes'} - every control carries a name and state a screen reader reads\n${findings.map((x) => `  1 ${x}`).join('\n')}\nRESULT: ${findings.length ? 'NO' : 'PASS'}`);
  expect(findings).toEqual([]);
});
