# Later

- Search: its own slice with its own matcher (GROQ + scoring), outside the filters/sorting design. Decide later whether it joins the flat index and evaluator.
- Delete `gallery[].alt` from all products (11 values, one product, Utopia). Real alt texts, no reader. Owner decided to delete on 2026-10-30; lower priority. Back up first, one transaction, then the form-consistency scan no longer lists the path. PR 159, box L1.
- The 43 null `specifications[].information` values. Facts so far: 8 products; 4 of them are null on every spec item (iFi xDSD Gryphon, Mark Levinson 5909, Focal Bathys, Audeze LCD-X), 4 mix nulls with strings; 44 other products hold 740 strings there; 3181 spec items have no `information` key. The only reader treats null like absent. Open: why null (blank on purpose, or a pass that wrote null for "not found"), then decide: unset, fill or leave. Needs intel against physics, then the owner's decision. PR 159, box L2.
