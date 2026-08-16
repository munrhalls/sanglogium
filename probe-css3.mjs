(async () => {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const links = [...html.matchAll(/<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>/g)].map((m) => m[1]);
  console.log('CSS_LINKS');
  for (const l of links) console.log('  ' + l);
  // also check class attributes presence
  console.log('HTML_has_max-lg ' + html.includes('max-lg'));
  console.log('HTML_has_md\\:max-lg ' + html.includes('md\\:max-lg'));
})();
