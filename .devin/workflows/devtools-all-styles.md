Array.from($0.computedStyleMap())
  .filter(([k]) => /display|width|height|margin|padding|gap|flex|grid|position|top|left|border|box-sizing|aspect-ratio|object-fit/.test(k))
  .map(([k,v]) => `${k}: ${v}`)
  .join('\n')