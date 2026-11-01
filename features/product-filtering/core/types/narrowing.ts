// What the shopper's selections add to the host's products request. The host keeps its own request (published filter, route keys, count, chunks, paging) and embeds these three parts.

/** `where` is a GROQ expression for the host's filter, as `*[ ... && (where) ]` (the text `true` when nothing is selected); `order` is the argument list of the host's `| order(order)`; `params` are the named parameters both texts use, every name starting with `narrow_`. */
export type Narrowing = { where: string; order: string; params: Record<string, string[] | number> };
