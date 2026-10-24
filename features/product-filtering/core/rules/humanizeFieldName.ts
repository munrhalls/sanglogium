import { humanizeFacetValue } from './humanizeFacetValue';

/** A field name for reading: wearingStyle -> Wearing Style. */
export function humanizeFieldName(field: string): string {
  return humanizeFacetValue(field.replace(/([a-z\d])([A-Z])/g, '$1 $2'));
}
