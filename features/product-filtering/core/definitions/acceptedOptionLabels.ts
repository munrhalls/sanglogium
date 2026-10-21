// Human sign-off ledger for draft (humanized) option labels. When a data value
// lands without a curated override, the labeler humanizes it and the
// uncuratedLabels law lists it for review. Recording the approved label here
// marks it accepted — the law goes silent for exactly this value -> label
// pair. If the humanized output ever changes for an accepted value, the pair
// no longer matches and the law lists it again for re-approval: silence always
// traces to a recorded, still-current verdict, never to a blanket mute.
export const ACCEPTED_OPTION_LABELS: Record<string, Record<string, string>> = {
  'connectivity': { 'true-wireless': 'True Wireless' },
  'inputs': { 'bluetooth': 'Bluetooth' },
};
