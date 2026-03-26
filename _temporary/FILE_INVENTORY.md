# Catalogue File Inventory

## Core Files (17 files + directories)

### Data Layer (2 files)
- `data_catalogue.ts` (1,288 bytes) - VFS utility functions
- `data_catalogue-index.json` (9,565 bytes) - VFS manifest data

### Scripts (2 files)  
- `scripts_build-catalogue-index.mjs` (2,540 bytes) - VFS manifest builder
- `scripts_seed-catalogue.mjs` (10,005 bytes) - Sanity CMS seeder

### Sanity Library (4 files)
- `sanity_lib_products_getSelectedProducts.ts` (6,838 bytes) - Main product selection
- `sanity_lib_products_getProductsByVfsKeys.ts` (448 bytes) - VFS GROQ query
- `sanity_lib_products_filter_getFiltersForCategoryPath.ts` (2,068 bytes) - Filter logic
- `sanity_lib_products_sort_getSortablesForCategoryPath.ts` (2,089 bytes) - Sort logic

### Schema Types (2 files)
- `sanity_schemaTypes_catalogueType.ts` (394 bytes) - Catalogue document schema
- `sanity_schemaTypes_catalogueItemType.ts` (1,567 bytes) - Catalogue item schema

### Actions (1 file)
- `app_actions_categories.ts` (734 bytes) - Server actions for categories

### Directories (5 directories)
- `components_catalogue/` (15 items) - UI components
- `catalogue_test/` (5 items) - Test suite and docs
- `catalogue_migration_backup/` (1 item) - Legacy backup

### Documentation (3 files)
- `README.md` (2,674 bytes) - This aggregation overview
- `VFS_ARCHITECTURE_AUDIT.md` (15,855 bytes) - Architecture documentation
- `VFS_REFACTOR_SPRINT_COMPLETE.todo` (14,647 bytes) - Completed sprint log

## Total Statistics
- **Files**: 22+ files
- **Directories**: 5 directories  
- **Total Size**: ~70KB+ of catalogue-related code and data
- **Coverage**: Complete catalogue system from data layer to UI components

## Key Integration Patterns Documented

1. **VFS Resolution**: URL → ID → Keys → Products
2. **GROQ Integration**: `count(catalogueLocationKeys[@ in $keys]) > 0`
3. **Component Flow**: Data → Transform → UI Components
4. **Build Pipeline**: Sanity → Index → VFS Functions

Generated: $(date)
