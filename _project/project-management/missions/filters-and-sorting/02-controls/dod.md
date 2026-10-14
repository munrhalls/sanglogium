# DoD — Filters & Sorting — controls (the option set)

Presumes `01-membership` holds. Each group presumes every group above it already holds.
Scope: the offered option set itself — definitions, vocabularies, order. Whether
product data backs the options is `03-alignment`; runtime behaviour is `04-parity`.

## 1. Options are semantically correct per slice
- [ ] 1.1 Zero nonsensical or misplaced options in any slice — every option offered makes sense for that slice's products.
- [ ] 1.2 Every facet's option set equals the schema's real vocabulary for that field — no phantom values, none missing.
- [ ] 1.3 One real-world value = one option: no spelling variants splitting results, one casing style, one unit expression per unit type, labels accurate and jargon-free.
- [ ] 1.4 Universal options mean, name, and behave identically in every slice; no slice-specific option duplicates or clashes with a universal one.

## 2. Option order is meaningful
- [ ] 2.1 Brands ordered alphabetically.
- [ ] 2.2 Numeric specs ordered numerically.
- [ ] 2.3 Naturally ranked values in their natural order.

## 3. The sort set
- [ ] 3.1 Exactly six sorts: Newest (default), Price ↑, Price ↓, A–Z, Z–A, Oldest.
- [ ] 3.2 Every offered sort reads a field that exists on the product schema.
- [ ] 3.3 The same six sorts appear on every surface — single source, zero local redefinitions.
