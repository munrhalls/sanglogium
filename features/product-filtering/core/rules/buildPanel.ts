import type { Control, ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { Counts } from '@/features/product-filtering/core/types/counts';
import type { Panel, PanelControl, PanelSection } from '@/features/product-filtering/core/types/panel';
import type { Section } from '@/features/product-filtering/core/types/sections';
import type { RangeSelection, UrlState, UrlValue } from '@/features/product-filtering/core/types/urlState';

// What the panel shows for one route: the sections in the order given, in each the controls of its `paths` in the order given.
// A checkbox control keeps only the options that have a product (count above 0, also when the option is ticked: the active selections are listed elsewhere) and is left out when none is left.
// A toggle and a range are never left out: nothing says they are dead. A section with no control left is left out.

const isRange = (value: UrlValue | undefined): value is RangeSelection =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && typeof (value as RangeSelection).min === 'number' && typeof (value as RangeSelection).max === 'number';

export function buildPanel(model: ControlModel, sections: Section[], counts: Counts, state: UrlState): Panel {
  const controls = new Map<string, Control>(model.controls.map((control): [string, Control] => [control.path, control]));
  const tallies = new Map<string, Map<string, number>>(
    counts.map((entry): [string, Map<string, number>] => [entry.path, new Map(entry.options.map((option): [string, number] => [option.value, option.count]))]),
  );
  const panel: PanelSection[] = [];
  for (const section of sections) {
    const drawn: PanelControl[] = [];
    for (const path of section.paths) {
      const control = controls.get(path);
      if (!control) continue;
      const selected = state[path];
      if (control.kind === 'checkbox') {
        const tally = tallies.get(path);
        const options = control.options
          .map((option) => ({
            value: option.value,
            text: option.text,
            count: tally?.get(option.value) ?? 0,
            ticked: Array.isArray(selected) && selected.includes(option.value),
          }))
          .filter((option) => option.count > 0);
        if (options.length > 0) drawn.push({ path, kind: 'checkbox', label: control.label, options });
      } else if (control.kind === 'toggle') {
        drawn.push({ path, kind: 'toggle', label: control.label, on: selected === true });
      } else {
        drawn.push({
          path,
          kind: 'range',
          label: control.label,
          span: { min: control.span.min, max: control.span.max },
          selected: isRange(selected) ? { min: selected.min, max: selected.max } : null,
        });
      }
    }
    if (drawn.length > 0) panel.push({ key: section.key, label: section.label, icon: section.icon, controls: drawn });
  }
  return { sections: panel };
}
