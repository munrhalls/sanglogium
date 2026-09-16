// Hand-written, minimal Sanity HTTP client for the filter/sort proof scripts
// in this folder ONLY. Deliberately does not import sanity-cms/lib/client.ts
// or any other repo transport helper -- written from scratch this session so
// nothing in this proof chain depends on repo code outside what's under test
// (lib/catalogue/buildProductQuery.ts, called directly by 07-diff-against-production.mjs).
//
// Reads connection info from env (populate via `node --env-file=.env.local`).

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
const token = process.env.SANITY_API_READ_TOKEN;

if (!projectId || !dataset || !apiVersion || !token) {
  throw new Error(
    'Missing Sanity env vars. Run with: node --env-file=.env.local <script>.mjs',
  );
}

export async function sanityQuery(query, params = {}) {
  const url = new URL(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
  );
  url.searchParams.set('query', query);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.result;
}
