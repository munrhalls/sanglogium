(async () => {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const m = html.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g) || [];
  console.log('CSS_LINKS ' + JSON.stringify(m));
  const g = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
  let css = '';
  if (g) for (const s of g) css += s;
  console.log('INLINE_CSS_LEN ' + css.length);
  console.log('HAS_maxlg_in_inline ' + css.includes('max-lg'));
  console.log('HAS_md\\maxlg_in_inline ' + css.includes('md\\:max-lg'));
  console.log('HAS_tracking002em ' + css.includes('0.02em'));
})();
