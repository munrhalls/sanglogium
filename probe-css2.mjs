(async () => {
  const res = await fetch('http://localhost:3000/_next/static/css/app/(store)/layout.css?v=1786888727657');
  const css = await res.text();
  console.log('CSS_LEN ' + css.length);
  for (const pat of ['max-lg', 'md\\:max-lg', '0.02em', 'line-clamp', 'tracking-\\[-0.01em\\]']) {
    console.log('HAS [' + pat + '] ' + css.includes(pat));
  }
  const idx = css.indexOf('md\\:max-lg');
  if (idx >= 0) console.log('SNIP ' + css.slice(Math.max(0, idx - 200), idx + 400).replace(/\n/g, ' '));
})();
