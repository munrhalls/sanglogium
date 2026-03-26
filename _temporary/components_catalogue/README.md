# Catalogue Navigation System

## Comparison: Traditional String Path vs VFS

| Action | Traditional "String Path" System | VFS |
|--------|----------------------------------|-----|
| Rename Category | Must find/replace strings in 1,000s of products. | Change 1 name in catalogue-index.json. |
| Move Category | Heavy database "Update All" operation. | Move 1 ID in the catalogue-index.json tree. |
| Product in 2 Places | Hard to manage (Duplicate data). | Add 2 keys to catalogueLocationKeys. |
| Broken Links | High risk if a path slug changes. | Zero risk; IDs (_key) never change. |

## Key Benefits

**Renaming is Instant**: If you rename "Earbuds" to "In-Ear Monitors," you change one word in the catalogue-index. The products still point to the same ID, so nothing breaks.

**Moving is Instant**: If you move the "Earbuds" category to "Accessories," you move one ID in the tree. When the user clicks "Headphones," the App's crawl will no longer find the Earbuds ID, so those products automatically stop showing up there.

**Search Engine Optimization**: The urlMap ensures your URLs stay pretty (like /shop/earbuds) while your database uses stable, ugly IDs that never change.
