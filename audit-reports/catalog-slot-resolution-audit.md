# CATALOG SLOT ID TO PRODUCT RESOLUTION AUDIT REPORT
**Generated:** 2026-03-28
**Source:** `data/catalogue-index.json`

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| Total Catalog Slots | 31 |
| Header Nodes | 11 |
| Link Nodes (Leaf) | 20 |
| Navigable Categories | 20 |
| Data Integrity Issues | 0 |

**Status:** ✅ All catalog slots resolve correctly. No orphaned children, no slug inconsistencies.

---

## RESOLUTION MECHANICS

### How Catalog Slot IDs Resolve to Products

1. **Leaf Node Resolution** (e.g., `/shop/open-back`):
   - Slot ID: `o7c6baiuobsr7ni2y2vf22sh`
   - Unrolled Keys: `["o7c6baiuobsr7ni2y2vf22sh"]`
   - GROQ Query: `*[_type == "product" && count(catalogueLocationKeys[@ in ["o7c6baiuobsr7ni2y2vf22sh"]]) > 0]`
   - **Result:** Products with `catalogueLocationKeys` containing `"o7c6baiuobsr7ni2y2vf22sh"`

2. **Header Node Resolution** (e.g., "By Design" header):
   - Slot ID: `ekv4twh175wcse4fl4jjdxfq`
   - Unrolled Keys: `["ekv4twh175wcse4fl4jjdxfq", "o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh"]`
   - GROQ Query: `*[_type == "product" && count(catalogueLocationKeys[@ in ["ekv4twh175wcse4fl4jjdxfq", "o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh"]]) > 0]`
   - **Result:** Products in ANY child category (Open-Back OR Closed-Back)

---

## SYSTEMATIC TABLE: ALL CATALOG SLOTS

### 1. HEADPHONES (Root: `ugyeto8653n495dpf89nzoar`)
| Slot ID | Title | Type | Slug | Unrolled Keys Count | GROQ Query Pattern |
|---------|-------|------|------|---------------------|-------------------|
| `ugyeto8653n495dpf89nzoar` | Headphones | header | headphones | 11 | `count(catalogueLocationKeys[@ in [root + 10 children]]) > 0` |
| `ekv4twh175wcse4fl4jjdxfq` | By Design | header | (none) | 3 | `count(catalogueLocationKeys[@ in ["ekv4twh175wcse4fl4jjdxfq", "o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh"]]) > 0` |
| `px3eujo0ql1hot9dkoxleao6` | By Driver | header | (none) | 4 | `count(catalogueLocationKeys[@ in ["px3eujo0ql1hot9dkoxleao6", "yd9641q8fiuh9rgoupauw2zl", "j751evwbn8n9aac4elrekqi4", "icmc3j8qzjiffr9h6tw6kg74"]]) > 0` |
| `fxvwrl18sixw5b9ro2jrlepa` | In-Ear & Wireless | header | (none) | 3 | `count(catalogueLocationKeys[@ in ["fxvwrl18sixw5b9ro2jrlepa", "t2anvkkjfz9knqi85kozuaze", "sbbu2eig5fx84uht05ic863j"]]) > 0` |
| **LEAF NODES** |
| `o7c6baiuobsr7ni2y2vf22sh` | Open-Back | link | open-back | 1 | `count(catalogueLocationKeys[@ in ["o7c6baiuobsr7ni2y2vf22sh"]]) > 0` |
| `yq3p9s798zszjkzm5btnebjh` | Closed-Back | link | closed-back | 1 | `count(catalogueLocationKeys[@ in ["yq3p9s798zszjkzm5btnebjh"]]) > 0` |
| `yd9641q8fiuh9rgoupauw2zl` | Planar Magnetic | link | planar-magnetic | 1 | `count(catalogueLocationKeys[@ in ["yd9641q8fiuh9rgoupauw2zl"]]) > 0` |
| `j751evwbn8n9aac4elrekqi4` | Dynamic | link | dynamic | 1 | `count(catalogueLocationKeys[@ in ["j751evwbn8n9aac4elrekqi4"]]) > 0` |
| `icmc3j8qzjiffr9h6tw6kg74` | Electrostatic | link | electrostatic | 1 | `count(catalogueLocationKeys[@ in ["icmc3j8qzjiffr9h6tw6kg74"]]) > 0` |
| `t2anvkkjfz9knqi85kozuaze` | Monitors (IEMs) | link | monitors-iems | 1 | `count(catalogueLocationKeys[@ in ["t2anvkkjfz9knqi85kozuaze"]]) > 0` |
| `sbbu2eig5fx84uht05ic863j` | True Wireless (TWS) | link | true-wireless-tws | 1 | `count(catalogueLocationKeys[@ in ["sbbu2eig5fx84uht05ic863j"]]) > 0` |

### 2. AUDIO ELECTRONICS (Root: `ti2wufd15h51jxtq855ogbfa`)
| Slot ID | Title | Type | Slug | Unrolled Keys Count | GROQ Query Pattern |
|---------|-------|------|------|---------------------|-------------------|
| `ti2wufd15h51jxtq855ogbfa` | Audio Electronics | header | audio-electronics | 9 | All 9 subtree keys |
| `hqb22ca5czb252r0r7l1xmet` | Amplification | header | (none) | 3 | Header + 2 leaf children |
| `lkuqr2n1gpeivrvxisnfs3ot` | Digital Sources | header | (none) | 5 | Header + 4 leaf children |
| **LEAF NODES** |
| `o6mz3kbs5xla8ixastppktsd` | Desktop Amps | link | desktop-amps | 1 | Single key |
| `ipz8oe0elii0vm2voxsbgsw6` | Portable Amps | link | portable-amps | 1 | Single key |
| `mpni93r13d9yo2vn5moexlkp` | Standalone DACs | link | standalone-dacs | 1 | Single key |
| `o37u0yjphzt3qu91ewnww2yj` | DAC/Amp Combos | link | dac-amp-combos | 1 | Single key |
| `o9igtdq1g5oqaahpa0zvq238` | Digital Players (DAPs) | link | digital-players-daps | 1 | Single key |
| `npwbgqg3v4t5qe95rg35wte0` | Network Streamers | link | network-streamers | 1 | Single key |

### 3. ACCESSORIES (Root: `j9ozs17mc0b1nv2gqn2rvmg1`)
| Slot ID | Title | Type | Slug | Unrolled Keys Count | GROQ Query Pattern |
|---------|-------|------|------|---------------------|-------------------|
| `j9ozs17mc0b1nv2gqn2rvmg1` | Accessories | header | accessories | 11 | All 11 subtree keys |
| `lhpqqb5qkfvh4kid6q6455eu` | Connectivity | header | (none) | 4 | Header + 3 leaf children |
| `e4rct8015rxgy011710isd5e` | Maintenance | header | (none) | 3 | Header + 2 leaf children |
| `rw0symuvdvebq75r4og53tlf` | Storage | header | (none) | 3 | Header + 2 leaf children |
| **LEAF NODES** |
| `vnrj2n32p172vcje1tt3s4ls` | Headphone Cables | link | headphone-cables | 1 | Single key |
| `ck7d2wm9xe6lujtdfq7biyh7` | Interconnects | link | interconnects | 1 | Single key |
| `jdxde1qpftseepekaivzpl8c` | Adapters | link | adapters | 1 | Single key |
| `j2yu4yvtje69j6gie4spxutu` | Earpads | link | earpads | 1 | Single key |
| `ab2xhkm6hgabf69y0f3s4oo0` | Care & Cleaning | link | care-cleaning | 1 | Single key |
| `u9o83mfmx23cudko8phu5otx` | Headphone Stands | link | headphone-stands | 1 | Single key |
| `j8ls622l90d6m4xetlajua4y` | Carrying Cases | link | carrying-cases | 1 | Single key |

---

## DATA FIDELITY ASSESSMENT

| Check | Status | Details |
|-------|--------|---------|
| Orphaned Children | ✅ PASS | All child IDs referenced in `slotMetadataMap` exist |
| Slug Consistency | ✅ PASS | All 22 slug mappings in `slugToIdMap` are valid and consistent |
| Leaf Node Navigability | ✅ PASS | All 20 leaf nodes have valid slugs and URLs |
| Header Non-Navigability | ✅ PASS | All 11 header nodes correctly have no direct URL |

---

## KEY FINDINGS

1. **Total Resolution Coverage:** 31 catalog slots map to GROQ queries that resolve products via `catalogueLocationKeys` array matching.

2. **Subtree Unrolling:** Header nodes correctly resolve to all descendant leaf nodes, enabling "show all products in this category and subcategories" behavior.

3. **Leaf Precision:** Link nodes (leaf categories) resolve to single keys, enabling precise product-to-category mapping.

4. **GROQ Query Uniformity:** All queries use the same pattern:
   ```groq
   *[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(name asc)
   ```
   Where `$keys` is the unrolled descendant array for the clicked catalog slot.

---

## PRODUCT RETRIEVAL LOGIC

**For each catalog slot clicked:**

1. Look up slot ID in `slotMetadataMap`
2. Unroll descendant keys (DFS traversal of children)
3. Pass unrolled keys to GROQ query as `$keys` parameter
4. Query returns products where ANY element in `catalogueLocationKeys` matches ANY key in `$keys`

**Example - Clicking "By Design":**
- Slot ID: `ekv4twh175wcse4fl4jjdxfq`
- Unrolled: `["ekv4twh175wcse4fl4jjdxfq", "o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh"]`
- Returns: Products with `catalogueLocationKeys` containing ANY of those 3 IDs
- Result: Products tagged as Open-Back OR Closed-Back OR directly tagged to "By Design"

---

## SLUG TO SLOT ID MAPPING

| Slug | Slot ID | Category |
|------|---------|----------|
| open-back | o7c6baiuobsr7ni2y2vf22sh | Headphones/By Design |
| closed-back | yq3p9s798zszjkzm5btnebjh | Headphones/By Design |
| planar-magnetic | yd9641q8fiuh9rgoupauw2zl | Headphones/By Driver |
| dynamic | j751evwbn8n9aac4elrekqi4 | Headphones/By Driver |
| electrostatic | icmc3j8qzjiffr9h6tw6kg74 | Headphones/By Driver |
| monitors-iems | t2anvkkjfz9knqi85kozuaze | Headphones/In-Ear |
| true-wireless-tws | sbbu2eig5fx84uht05ic863j | Headphones/In-Ear |
| desktop-amps | o6mz3kbs5xla8ixastppktsd | Audio Electronics/Amplification |
| portable-amps | ipz8oe0elii0vm2voxsbgsw6 | Audio Electronics/Amplification |
| standalone-dacs | mpni93r13d9yo2vn5moexlkp | Audio Electronics/Digital Sources |
| dac-amp-combos | o37u0yjphzt3qu91ewnww2yj | Audio Electronics/Digital Sources |
| digital-players-daps | o9igtdq1g5oqaahpa0zvq238 | Audio Electronics/Digital Sources |
| network-streamers | npwbgqg3v4t5qe95rg35wte0 | Audio Electronics/Digital Sources |
| headphone-cables | vnrj2n32p172vcje1tt3s4ls | Accessories/Connectivity |
| interconnects | ck7d2wm9xe6lujtdfq7biyh7 | Accessories/Connectivity |
| adapters | jdxde1qpftseepekaivzpl8c | Accessories/Connectivity |
| earpads | j2yu4yvtje69j6gie4spxutu | Accessories/Maintenance |
| care-cleaning | ab2xhkm6hgabf69y0f3s4oo0 | Accessories/Maintenance |
| headphone-stands | u9o83mfmx23cudko8phu5otx | Accessories/Storage |
| carrying-cases | j8ls622l90d6m4xetlajua4y | Accessories/Storage |

---

## VERDICT

✅ **DATA FIDELITY: EXCELLENT**

All 31 catalog slot IDs correctly resolve to GROQ queries. The subtree unrolling logic is sound, all references are valid, and the query generation pattern is consistent across all nodes.

**Next Step:** Verify that products in the Sanity database have correct `catalogueLocationKeys` arrays populated with these slot IDs.
