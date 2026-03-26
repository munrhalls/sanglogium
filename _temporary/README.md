# Catalogue Research Aggregation

This folder contains all catalogue-related code snippets and data files aggregated for research purposes.

## File Structure and Annotations

### Core Data Layer
- `data_catalogue.ts` - VFS utility functions (resolveSlugToId, unrollDescendantKeys, buildGroqKeysParam)
- `data_catalogue-index.json` - Generated VFS manifest with slugToIdMap and slotMetadataMap

### Build Scripts
- `scripts_build-catalogue-index.mjs` - Builds VFS manifest from Sanity CMS
- `scripts_seed-catalogue.mjs` - Seeds Sanity CMS with catalogue structure

### Sanity Integration
- `sanity_lib_products_getSelectedProducts.ts` - Main product selection using VFS keys
- `sanity_lib_products_getProductsByVfsKeys.ts` - VFS-aware GROQ query function
- `sanity_lib_products_filter_getFiltersForCategoryPath.ts` - Filter logic using VFS keys
- `sanity_lib_products_sort_getSortablesForCategoryPath.ts` - Sort logic using VFS keys

### Schema Definitions
- `sanity_schemaTypes_catalogueType.ts` - Sanity schema for catalogue document
- `sanity_schemaTypes_catalogueItemType.ts` - Sanity schema for catalogue items

### Actions and API
- `app_actions_categories.ts` - Server actions for filter/sort with VFS keys

### Pages and Routing
- `app_store_products_category_page.tsx` - Category page with VFS resolution flow

### UI Components
- `components_catalogue/` - All catalogue UI components
  - `CatalogueNavbar.tsx` - Navigation bar component
  - `CatalogueCarousel.tsx` - Carousel component
  - `CatalogueView.tsx` - View component
  - `catalogue-nav.types.ts` - Type definitions
  - `catalogue-nav.utils.ts` - Utility functions
  - `catalogue-nav-data.json` - UI navigation data
  - `catalog-migration/legacy_catalog.json` - Legacy catalogue backup

### Testing
- `catalogue_test/` - VFS test suite and documentation
  - `vfs.test.ts` - 19-point test suite for VFS functions
  - `VFS_ARCHITECTURE_AUDIT.md` - Architecture documentation

## Key Integration Points

1. **VFS Resolution Flow**: Category page → resolveSlugToId → unrollDescendantKeys → getSelectedProducts
2. **GROQ Queries**: All product queries now use `count(catalogueLocationKeys[@ in $keys]) > 0`
3. **Build Pipeline**: Sanity CMS → build-catalogue-index.mjs → catalogue-index.json → VFS functions
4. **UI Data Flow**: catalogue-nav-data.json → transformCatalogueJson → CatalogueNavItem components

## Migration Status

✅ VFS Refactor Sprint completed (63 difficulty points)
✅ Legacy catalogue extracted and backed up
✅ New catalogue structure seeded to Sanity CMS
✅ All components migrated to VFS key resolution
✅ Test suite validates all VFS functions

Generated: $(date)
