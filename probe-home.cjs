const t = Date.now();
const ctrl = new AbortController();
const to = setTimeout(() => ctrl.abort(), 90000);
const res = await fetch('http://localhost:3000', { signal: ctrl.signal });
clearTimeout(to);
const txt = await res.text();
console.log('FETCH_OK status=' + res.status + ' len=' + txt.length + ' ms=' + (Date.now() - t));
