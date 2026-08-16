(async () => {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const idx = html.indexOf('The Kinetic Edge');
  if (idx < 0) { console.log('h2 text not found in HTML (client-rendered?)'); process.exit(0); }
  const snip = html.slice(Math.max(0, idx - 600), idx + 200);
  console.log(snip.replace(/></g, '>\n<'));
})();
