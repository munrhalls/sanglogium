// The URL key of a facet is a fixed function of its field name, so nothing
// needs maintaining: 'impedanceOhms' -> 'impedanceOhms',
// 'freqResponseHz.min' -> 'freqResponseHzMin',
// 'batteryLifeHours.ancOff' -> 'batteryLifeHoursAncOff'. The key is also a
// GROQ parameter name, so it must stay an identifier.
export function facetKey(attribute: string): string {
  const [first, ...rest] = attribute.split('.');
  return first + rest.map((part) => part[0].toUpperCase() + part.slice(1)).join('');
}
