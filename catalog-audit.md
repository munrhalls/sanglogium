# Catalog Migration Audit

## Schema Delta Table
Map of existing Sanity fields against proposed mock data fields.

| Existing Sanity Field | Proposed Mock Data Field | Status / Match |
|:---|:---|:---|
| `title` (`string`) | `label` (`string`) | **Mismatch:** Conceptual match, but requires renaming or mapping front-end `label` to back-end `title`. |
| `slug` (`slug` object) | `id` (`string`) | **Type Difference:** Mock uses string IDs; Sanity requires a computed object. |
| `icon` (`string`) | `imageUrl` (`string` URL) | **Conflict:** Sanity expects a string icon name (e.g., `'headphones'`), while the mock expects a full file path / image URL. |
| `type` (`"link" \| "header"`) | *(Implicit via object shape)* | **Conceptual Alignment:** Mock `sections` correspond to Sanity `type: "header"`, and mock `links` inside those sections correspond to Sanity `type: "link"`. |
| `children` (recursive `catalogueItem[]`) | `sections` & `links` | **Structure Difference:** Sanity supports infinite arbitrary nesting. The mock enforces an explicit fixed 3-level tree (Root -> Section -> string Links). |
| *(Missing)* | `feature.caption` (`string`) | **Missing:** No equivalent `feature` object exists in the current schema. |

## VFS Impact
The structural delta primarily impacts the current Virtual File System (VFS) functionality in how recursive navigation and path routing operate:

- **Strict Depth vs. Infinite Traversal:** The existing VFS logic recursively parses `children` elements. The proposed structure limits the taxonomy strictly to 3 levels (Root -> Section -> Links). Any recursive path-generation algorithm might need adjustments for arrays of strings at the leaf level.
- **Node Metadata / Slug Resolution:** Existing VFS routing expects every structural node to be an object with an independent `slug` (including sub-links). The mock data provides primitive strings for its `links` (e.g., `"Open-Back"`), meaning VFS logic must dynamically slugify these strings on the fly to synthesize functional URLs, creating implicit rather than distinct document references.
- **Payload Composition:** VFS routing fetch logic will need to pull additional assets down the tree, specifically explicitly surfacing `imageUrl` and `feature` elements to the frontend layout scope instead of stopping at simple labels and icons.

## Migration Feasibility
**Yes**

Required technical steps to achieve alignment:
*   Add a non-breaking `feature` field (as an object with a `caption` string) onto the existing `catalogueItemType.ts` layout.
*   Add a non-breaking `imageUrl` root string field or `image` object field to `catalogueItemType.ts` to support category header photos without losing the legacy `icon` definition.
*   Adapt GROQ queries driving the VFS mechanism to explicitly map the backend recursive `children` to the mock `sections[]` shape by targeting intermediate `type == "header"` nested items.
*   Similarly project GROQ leaf items of `type == "link"` out as primitive string arrays so they match the `links: string[]` scope declared within `data.ts`.
*   Maintain `title` conceptually but return it aliased as `label` inside the VFS tree query to prevent refactoring all proposed frontend scope mock models.
