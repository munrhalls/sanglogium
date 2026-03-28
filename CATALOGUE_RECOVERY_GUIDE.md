# Catalogue Coherence Recovery - Manual Execution Guide

**Status**: 441 products ready for assignment | Token: Read-only  
**Date**: 2026-03-28  
**ETA**: 2-3 hours manual work

---

## Part 1: Product Assignments (441 products)

### Method A: Bulk GROQ Mutations (Recommended - 30 mins)

In Sanity Studio, open the **Vision** tool (⌘+K → "Vision") and execute these mutations:

#### Step 1: Assign Headphone Cables (Estimated: 80+ products)
```groq
*[_type == "product" && (
  name match "cable" || 
  name match "Cable" ||
  overviewFields[].value match "cable"
) && !("vnrj2n32p172vcje1tt3s4ls" in catalogueLocationKeys)]
| order(name asc)
```

Then patch each (or use bulk editor):
```groq
patch(
  *[_type == "product" && name match "cable"][0..50]._id,
  { catalogueLocationKeys: ["vnrj2n32p172vcje1tt3s4ls"] }
)
```

#### Step 2: Assign Interconnects (Estimated: 60+ products)
```groq
*[_type == "product" && (
  name match "interconnect" ||
  name match "RCA" ||
  name match "XLR" ||
  name match "balanced"
)]
```
Assign to: `ck7d2wm9xe6lujtdfq7biyh7`

#### Step 3: Assign Headphones by Type

**Open-Back** (`o7c6baiuobsr7ni2y2vf22sh`):
```groq
*[_type == "product" && (
  name match "open-back" ||
  name match "open back" ||
  (name match "headphone" && overviewFields[].value match "open")
)]
```

**Closed-Back** (`yq3p9s798zszjkzm5btnebjh`):
```groq
*[_type == "product" && (
  name match "closed-back" ||
  name match "closed back" ||
  name match "monitoring headphone"
)]
```

**Planar Magnetic** (`yd9641q8fiuh9rgoupauw2zl`):
```groq
*[_type == "product" && (
  name match "planar" ||
  name match "Audeze" ||
  name match "HiFiMAN"
)]
```

#### Step 4: Assign Amplification

**Desktop Amps** (`o6mz3kbs5xla8ixastppktsd`):
```groq
*[_type == "product" && (
  name match "amplifier" ||
  name match "amp"
) && !(
  name match "portable" ||
  name match "battery"
)]
```

**Portable Amps** (`ipz8oe0elii0vm2voxsbgsw6`):
```groq
*[_type == "product" && (
  name match "portable amp" ||
  name match "battery powered"
)]
```

#### Step 5: Assign DACs

**Standalone DACs** (`mpni93r13d9yo2vn5moexlkp`):
```groq
*[_type == "product" && (
  name match "DAC" ||
  name match "converter"
) && !(
  name match "amp" ||
  name match "combo"
)]
```

**DAC/Amp Combos** (`o37u0yjphzt3qu91ewnww2yj`):
```groq
*[_type == "product" && (
  name match "DAC" ||
  name match "amp"
) && (
  name match "combo" ||
  name match "integrated" ||
  name match "all-in-one"
)]
```

### Method B: Manual Studio Assignment (2-3 hours)

For each product in the list below, manually add catalogueLocationKeys:

**Quick Reference - Category IDs:**
- `o7c6baiuobsr7ni2y2vf22sh` - Open-Back
- `yq3p9s798zszjkzm5btnebjh` - Closed-Back
- `yd9641q8fiuh9rgoupauw2zl` - Planar Magnetic
- `j751evwbn8n9aac4elrekqi4` - Dynamic
- `icmc3j8qzjiffr9h6tw6kg74` - Electrostatic
- `t2anvkkjfz9knqi85kozuaze` - Monitors (IEMs)
- `sbbu2eig5fx84uht05ic863j` - TWS (REMOVE)
- `o6mz3kbs5xla8ixastppktsd` - Desktop Amps
- `ipz8oe0elii0vm2voxsbgsw6` - Portable Amps
- `mpni93r13d9yo2vn5moexlkp` - Standalone DACs
- `o37u0yjphzt3qu91ewnww2yj` - DAC/Amp Combos
- `o9igtdq1g5oqaahpa0zvq238` - Digital Players (DAPs)
- `npwbgqg3v4t5qe95rg35wte0` - Network Streamers
- `vnrj2n32p172vcje1tt3s4ls` - Headphone Cables
- `ck7d2wm9xe6lujtdfq7biyh7` - Interconnects
- `jdxde1qpftseepekaivzpl8c` - Adapters
- `j2yu4yvtje69j6gie4spxutu` - Earpads
- `ab2xhkm6hgabf69y0f3s4oo0` - Care & Cleaning
- `u9o83mfmx23cudko8phu5otx` - Headphone Stands
- `j8ls622l90d6m4xetlajua4y` - Carrying Cases

---

## Part 2: Category Structure Changes

### Step 1: Remove TWS Category (5 mins)

1. Navigate to **Catalogue Items**
2. Find **"True Wireless (TWS)"** (ID: `sbbu2eig5fx84uht05ic863j`)
3. Select → **Delete** → Confirm
4. Navigate to **"In-Ear & Wireless"** (ID: `fxvwrl18sixw5b9ro2jrlepa`)
5. Edit → Remove TWS from `children` array → **Publish**

### Step 2: Create 4 New Categories (15 mins)

For each new category:

1. Click **"Create new"** in Catalogue Items
2. Fill details:

| Field | Semi-Open | Bluetooth DAC/Amps | USB-C DACs | Eartips |
|-------|-----------|-------------------|------------|---------|
| **Title** | Semi-Open | Bluetooth DAC/Amps | USB-C/Dongle DACs | Eartips |
| **Type** | link | link | link | link |
| **Slug** | semi-open | bluetooth-dac-amps | usb-c-dacs | eartips |
| **Parent** | By Design | Amplification | Digital Sources | Maintenance |
| **Sort Order** | 2 | 2 | 2 | 1 |

3. After creating each, edit the parent header and add new category to `children` array

**Parent IDs for reference:**
- By Design: `ekv4twh175wcse4fl4jjdxfq`
- Amplification: `hqb22ca5czb252r0r7l1xmet`
- Digital Sources: `lkuqr2n1gpeivrvxisnfs3ot`
- Maintenance: `e4rct8015rxgy011710isd5e`

### Step 3: Apply Renames (10 mins)

Navigate to each document, edit title, publish:

| ID | Current Title | New Title |
|----|---------------|-----------|
| `fxvwrl18sixw5b9ro2jrlepa` | In-Ear & Wireless | **In-Ear Monitors** |
| `t2anvkkjfz9knqi85kozuaze` | Monitors (IEMs) | **Universal IEMs** |
| `e4rct8015rxgy011710isd5e` | Maintenance | **Fit & Comfort** |

---

## Part 3: Validation & Testing

### After All Changes:

1. **Rebuild VFS Index**:
   ```bash
   node scripts/build-catalogue-index.mjs
   ```

2. **Run Regression Tests**:
   ```bash
   npx tsx tests/regression/catalogue-coherence-sprint.regression.test.ts
   ```

3. **Verify Product Counts**:
   ```bash
   node scripts/vfs-semantic-audit.mjs
   ```

### Expected Results:

- ✅ 23 leaf categories (was 20)
- ✅ TWS removed
- ✅ 4 new categories present
- ✅ 441+ products with assignments
- ✅ All tests pass

---

## High-Priority Products to Assign First

Based on semantic analysis, these products have strong category matches:

### Headphone Cables (80+ products)
- Meze Audio 99 Series 2.5mm Cable → `vnrj2n32p172vcje1tt3s4ls`
- AudioQuest Pearl USB Cable → `vnrj2n32p172vcje1tt3s4ls`
- 64 Audio Premium Pearl Cable → `vnrj2n32p172vcje1tt3s4ls`
- All products with "cable" in name

### Interconnects (60+ products)
- AudioQuest Golden Gate → `ck7d2wm9xe6lujtdfq7biyh7`
- All RCA/XLR cable products

### Headphones (200+ products)
- Audeze LCD series → Planar Magnetic
- HiFiMAN series → Planar Magnetic  
- Sennheiser HD series → Open/Closed Back
- Focal Clear/Utopia → Open Back

### Amplification (100+ products)
- Topping A50/A70 → Desktop Amps
- iFi Pro iCAN → Desktop Amps
- Questyle CMA → DAC/Amp Combos

---

## Verification Checklist

- [ ] TWS category deleted from Sanity
- [ ] 4 new categories created with correct parents
- [ ] 3 category renames applied
- [ ] 441 products assigned to categories
- [ ] VFS index rebuilt successfully
- [ ] Regression tests pass
- [ ] Semantic audit shows >0 products per category
- [ ] Manual spot-check of 10 products confirms correct assignments

---

## Post-Recovery State

After completion, the audit should show:

```
Total Products: 582
Assigned Products: 441 (76%)
Unmapped Products: 141 (24%)

Category Fill Rates:
- Headphone Cables: 80+ products
- Interconnects: 60+ products  
- Headphones: 150+ products
- Amplification: 100+ products
- DACs: 50+ products
- Accessories: 50+ products

Overall Coherence Score: 75/100 (Functional)
```

---

## Support Resources

- **Sanity Studio**: https://2tdmkpky.sanity.studio/
- **VFS Documentation**: `docs/VFS_ARCHITECTURE.md`
- **Semantic Rules**: `lib/catalogue/semanticConfig.ts`
- **Audit Report**: `audit-reports/CATALOGUE_COHERENCE_AUDIT_2026-03-28.datmd`

---

*Generated: 2026-03-28*  
*Next Update: Post-recovery validation*
