# Catalogue Coherence Sprint - Status Report
**Date**: 2026-03-28  
**Status**: 🔴 **REQUIRES MANUAL SANITY STUDIO OPERATIONS**

---

## Executive Summary

### Automated Work Completed ✅
- Semantic rules updated (23 categories configured)
- Test suites updated for new category counts
- TWS archival script created (0 products to archive)
- Product assignment analysis complete (441 products ready for assignment)
- Comprehensive coherence audit generated
- Build system validated

### Manual Work Required 🔧
**Reason**: SANITY_API_TOKEN has read-only permissions (sufficient for queries, insufficient for create/update/delete)

---

## Current System State

### Products
| Metric | Value |
|--------|-------|
| **Total Products** | 583 |
| **With Catalogue Assignment** | 0 (0%) |
| **Ready for Assignment** | 441 (76%) |
| **Requires Manual Review** | 142 (24%) |

### Catalog Structure
| Metric | Current | Target |
|--------|---------|--------|
| **Leaf Categories** | 20 | 23 |
| **Products per Category** | 0 | ~25 avg |
| **VFS Status** | Valid | Valid |
| **Coherence Score** | 0% | ~75% (post-fix) |

### Category Distribution (Expected Post-Assignment)
- **Headphone Cables**: 80+ products
- **Interconnects**: 60+ products
- **Open/Closed Back Headphones**: 150+ products
- **Planar Magnetic**: 40+ products
- **Desktop Amps**: 50+ products
- **DACs (all types)**: 60+ products
- **Accessories**: 50+ products

---

## Manual Operations Checklist

Complete these in Sanity Studio: https://2tdmkpky.sanity.studio/

### Phase 1: Category Structure (30 mins)

#### 1.1 Delete TWS Category
- [ ] Navigate to **Catalogue Items**
- [ ] Find "True Wireless (TWS)" (ID: `sbbu2eig5fx84uht05ic863j`)
- [ ] Delete document
- [ ] Edit "In-Ear & Wireless" header → Remove TWS from children → Publish

#### 1.2 Create 4 New Categories
For each, Create New → Catalogue Item:

**Semi-Open**
- Title: Semi-Open
- Slug: semi-open
- Type: link
- Parent: By Design (ekv4twh175wcse4fl4jjdxfq)
- Sort Order: 2

**Bluetooth DAC/Amps**
- Title: Bluetooth DAC/Amps
- Slug: bluetooth-dac-amps
- Type: link
- Parent: Amplification (hqb22ca5czb252r0r7l1xmet)
- Sort Order: 2

**USB-C/Dongle DACs**
- Title: USB-C/Dongle DACs
- Slug: usb-c-dacs
- Type: link
- Parent: Digital Sources (lkuqr2n1gpeivrvxisnfs3ot)
- Sort Order: 2

**Eartips**
- Title: Eartips
- Slug: eartips
- Type: link
- Parent: Maintenance (e4rct8015rxgy011710isd5e)
- Sort Order: 1

After creating each, edit parent and add to children array.

#### 1.3 Apply Renames
| ID | Change Title To |
|----|----------------|
| fxvwrl18sixw5b9ro2jrlepa | In-Ear Monitors |
| t2anvkkjfz9knqi85kozuaze | Universal IEMs |
| e4rct8015rxgy011710isd5e | Fit & Comfort |

### Phase 2: Product Assignments (2-3 hours)

#### 2.1 Bulk Assignment Strategy

**Option A: GROQ Vision (Faster)**
Use Vision tool (⌘+K → "Vision") for bulk queries:

**Headphone Cables** (80+ products)
```groq
*[_type == "product" && name match "cable"]{_id, name}
```
Then use bulk editor to add `vnrj2n32p172vcje1tt3s4ls` to catalogueLocationKeys

**Interconnects** (60+ products)
```groq
*[_type == "product" && (name match "interconnect" || name match "RCA" || name match "XLR")]{_id, name}
```
Assign to: `ck7d2wm9xe6lujtdfq7biyh7`

**Open-Back Headphones**
```groq
*[_type == "product" && (name match "open-back" || name match "open back")]{_id, name}
```
Assign to: `o7c6baiuobsr7ni2y2vf22sh`

**Closed-Back Headphones**
```groq
*[_type == "product" && (name match "closed-back" || name match "closed back")]{_id, name}
```
Assign to: `yq3p9s798zszjkzm5btnebjh`

**Planar Magnetic**
```groq
*[_type == "product" && (name match "planar" || name match "Audeze" || name match "HiFiMAN")]{_id, name}
```
Assign to: `yd9641q8fiuh9rgoupauw2zl`

**Desktop Amps**
```groq
*[_type == "product" && name match "amplifier" && !(name match "portable")]{_id, name}
```
Assign to: `o6mz3kbs5xla8ixastppktsd`

**DACs**
```groq
*[_type == "product" && name match "DAC"]{_id, name}
```
Filter into standalone vs combos, assign accordingly

**Option B: Manual Edit (Slower but precise)**
Open each product, add catalogueLocationKeys array with appropriate category IDs.

### Phase 3: Validation (15 mins)

After all changes:

```bash
# 1. Rebuild VFS
node scripts/build-catalogue-index.mjs

# 2. Run tests
npx tsx tests/regression/catalogue-coherence-sprint.regression.test.ts

# 3. Verify assignments
node scripts/vfs-semantic-audit.mjs
```

**Expected Results:**
- 23 categories total
- 441+ products with assignments
- All tests passing
- Coherence score >70%

---

## High-Priority Product List

These products have strong semantic matches and should be assigned first:

### Immediate Assignments (Strong Matches)

**Cables (All → vnrj2n32p172vcje1tt3s4ls)**
- Meze Audio 99 Series 2.5mm Cable
- AudioQuest Pearl USB A to USB B
- 64 Audio Premium Pearl Cable
- All products with "cable" in name

**Interconnects (All → ck7d2wm9xe6lujtdfq7biyh7)**
- AudioQuest Golden Gate 3.5mm-RCA
- All RCA/XLR products

**Headphones by Brand/Type**
- Audeze LCD series → Planar Magnetic (yd9641q8fiuh9rgoupauw2zl)
- HiFiMAN series → Planar Magnetic
- Sennheiser HD800, HD600 → Open-Back
- Focal Clear/Utopia → Open-Back
- Sony WH-1000 → Closed-Back

**Amplification**
- Topping A50/A70/A90 → Desktop Amps
- iFi Pro iCAN → Desktop Amps
- Questyle CMA → DAC/Amp Combos

---

## Category ID Reference

| Category | ID |
|----------|-----|
| Open-Back | o7c6baiuobsr7ni2y2vf22sh |
| Closed-Back | yq3p9s798zszjkzm5btnebjh |
| Planar Magnetic | yd9641q8fiuh9rgoupauw2zl |
| Dynamic | j751evwbn8n9aac4elrekqi4 |
| Electrostatic | icmc3j8qzjiffr9h6tw6kg74 |
| Universal IEMs | t2anvkkjfz9knqi85kozuaze |
| Desktop Amps | o6mz3kbs5xla8ixastppktsd |
| Portable Amps | ipz8oe0elii0vm2voxsbgsw6 |
| Standalone DACs | mpni93r13d9yo2vn5moexlkp |
| DAC/Amp Combos | o37u0yjphzt3qu91ewnww2yj |
| Digital Players | o9igtdq1g5oqaahpa0zvq238 |
| Network Streamers | npwbgqg3v4t5qe95rg35wte0 |
| Headphone Cables | vnrj2n32p172vcje1tt3s4ls |
| Interconnects | ck7d2wm9xe6lujtdfq7biyh7 |
| Adapters | jdxde1qpftseepekaivzpl8c |
| Earpads | j2yu4yvtje69j6gie4spxutu |
| Care & Cleaning | ab2xhkm6hgabf69y0f3s4oo0 |
| Headphone Stands | u9o83mfmx23cudko8phu5otx |
| Carrying Cases | j8ls622l90d6m4xetlajua4y |
| **NEW: Semi-Open** | *(create new)* |
| **NEW: Bluetooth DAC/Amps** | *(create new)* |
| **NEW: USB-C DACs** | *(create new)* |
| **NEW: Eartips** | *(create new)* |

---

## Files Generated

1. `CATALOGUE_COHERENCE_AUDIT_2026-03-28.datmd` - Full audit report
2. `CATALOGUE_RECOVERY_GUIDE.md` - Detailed recovery instructions
3. `scripts/bulk-assign-products.mjs` - Assignment script (for reference)
4. `scripts/sprint-sanity-operations.mjs` - Sanity ops script (for reference)

---

## Next Steps Summary

1. **Manual Sanity Operations** (30-45 mins)
   - Delete TWS
   - Create 4 new categories
   - Apply 3 renames

2. **Product Assignments** (2-3 hours)
   - Use GROQ queries for bulk assignment
   - Focus on 441 high-confidence matches first
   - Leave 142 ambiguous products for later review

3. **Validation** (15 mins)
   - Rebuild VFS index
   - Run regression tests
   - Verify coherence score improvement

**Estimated Total Time**: 3-4 hours of focused work  
**Expected Outcome**: 75%+ coherence score, functional catalogue

---

*Status: Awaiting manual Sanity Studio operations*  
*Token Permissions: Read-only (queries work, mutations blocked)*
