# Blueprint — filters & sorting — control semantics

Scope: data layer only — the filter and sort definitions (controls, option labels, sort labels). Judged: whether they make sense and cannot confuse an end user, per slice. Out: queries, product data, membership, how the sidebar draws or behaves.

One printout, read by a human. Per slice, per sidebar group, the controls with
their option labels, as the shopper sees them. Wide gap between slices, narrow
gap between groups.

## 1. Filter/sorting controls — semantically accurate

- [ ] 1.1 Every universal control makes sense on every slice it appears on.
  Means: read Price, Brand and In stock in every slice. Pass: each makes sense there.

- [ ] 1.2 Per slice, zero controls that don't belong to that slice's theme.
  Means: read each slice's controls. Pass: none out of place.

- [ ] 1.3 Per control, zero options that aren't a real, understandable choice for that theme.
  Means: read each control's options. Pass: every option is a real choice you understand.

- [ ] 1.4 Zero controls or options whose label could confuse the end user.
  Means: read every label. Pass: none confusing.
