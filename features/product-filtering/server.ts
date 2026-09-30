import 'server-only';
// Server-only entry: query builder and counts. Never import from client components or Node .mjs scripts.
export { buildProductQuery } from './domain/buildProductQuery';
