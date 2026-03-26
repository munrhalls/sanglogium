# Sanity v3 Virtual File System Curriculum

## Scope Contract 1: catalogueRoot Research

### Document Concept
A catalogueRoot is a standalone document type in Sanity Studio, acting as the primary entry point for a specific catalog tree (e.g., "Headphones"). It exists as a top-level entity with its own _id, revision history, and publishing lifecycle. Unlike object types, document types can be independently created, read, updated, and deleted through the Sanity Studio interface.

### Document Syntax
```typescript
import { defineType, defineField } from "sanity";

export const catalogueRootType = defineType({
  name: "catalogueRoot",
  title: "Catalogue Root",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
  ],
});
```

### Document Syntax Link
https://www.sanity.io/docs/studio/document-type

### Document CRUD in CMS
1. **Create**: In Sanity Studio, click "Create new" → Select "Catalogue Root" → Fill required fields → Publish
2. **Read**: Documents appear in the Studio list view with preview, can be opened for full editing
3. **Update**: Open document → Modify fields → Save draft → Publish changes
4. **Delete**: Open document → Options menu → Delete → Confirm deletion

### Verification
- Document types have `type: "document"` while object types have `type: "object"`
- Documents automatically get `_id`, `_createdAt`, `_updatedAt`, `_rev` fields
- Objects are embedded within documents and cannot exist independently

## Scope Contract 2: nesting array Research

### Document Concept
An array field containing custom objects within a Sanity document serves as the primary mechanism for storing nested lists. Sanity stores arrays as ordered collections with each item having a unique `_key` for identification. Arrays can contain mixed types including objects, references, strings, and numbers.

### Document Syntax
```typescript
defineField({
  name: "categories",
  title: "Categories",
  type: "array",
  of: [{
    type: "object",
    fields: [
      defineField({
        name: "name",
        title: "Name",
        type: "string",
      }),
      defineField({
        name: "description",
        title: "Description",
        type: "text",
      }),
    ],
  }],
}),
```

### Document Syntax Link
https://www.sanity.io/docs/studio/array-type

### Document CRUD in CMS
1. **Add Items**: Click "Add item" button → Fill object fields → Item appears in array
2. **Reorder**: Drag items using handle on left side of each array item
3. **Edit**: Click on array item → Edit inline or in modal → Changes save automatically
4. **Remove**: Click trash icon on array item → Confirm deletion

### Verification
Array syntax explicitly includes the `of: [{ type: 'object' }]` configuration to define allowed member types.

## Scope Contract 3: Relationship between catalogueRoot and nesting array

### Document Concept
The parent-child relationship is established when a nesting array is embedded directly inside a catalogueRoot document. The array belongs exclusively to the single root document with no external references needed. This creates a self-contained hierarchical structure where the root document owns all nested data.

### Document Syntax
```typescript
export const catalogueRootType = defineType({
  name: "catalogueRoot",
  title: "Catalogue Root",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{
        type: "object",
        name: "category",
        fields: [
          defineField({
            name: "name",
            title: "Name",
            type: "string",
          }),
          defineField({
            name: "items",
            title: "Items",
            type: "array",
            of: [{ type: "string" }],
          }),
        ],
      }],
    }),
  ],
});
```

### Document Syntax Link
https://www.sanity.io/docs/studio/object-type

### Document CRUD in CMS
Modifying array items counts as an update to the parent catalogueRoot document. The entire document must be published for changes to go live. Individual array items cannot be published independently.

### Verification
Fetching the root document automatically fetches the nested array in GROQ: `*[_type == "catalogueRoot"]{title, categories[]}` returns both root and nested data in a single query.

## Scope Contract 4: nesting level inside nesting array

### Document Concept
Second-level nesting creates a recursive data structure where an object contains its own array field. In NoSQL document databases like Sanity, deep nesting is supported but has practical limitations for performance and usability. Each nesting level adds complexity to queries and UI interactions.

### Document Syntax
```typescript
defineField({
  name: "categories",
  title: "Categories",
  type: "array",
  of: [{
    type: "object",
    name: "category",
    fields: [
      defineField({
        name: "name",
        title: "Name",
        type: "string",
      }),
      defineField({
        name: "subcategories",
        title: "Subcategories",
        type: "array",
        of: [{
          type: "object",
          name: "subcategory",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
            }),
            defineField({
              name: "products",
              title: "Products",
              type: "array",
              of: [{ type: "reference", to: [{ type: "product" }] }],
            }),
          ],
        }],
      }),
    ],
  }],
}),
```

### Document Syntax Link
https://www.sanity.io/docs/studio/object-type

### Document CRUD in CMS
The editor experience involves opening an array item, then opening a nested array item inside that modal. Sanity Studio handles nested modals but with diminishing UX quality at deeper levels.

### Verification
The CRUD documentation notes UI UX limitations of nested modals in Sanity Studio beyond 2-3 levels of nesting.

## Scope Contract 5: n+1 nesting array inside nested array

### Document Concept
Recursive schemas in Sanity v3 allow a type to reference itself, enabling infinite or deep recursive nesting structures like categories within categories indefinitely. Sanity imposes practical depth limits around 5-7 levels due to UI constraints and performance considerations.

### Document Syntax
```typescript
export const recursiveCategoryType = defineType({
  name: "recursiveCategory",
  title: "Recursive Category",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "children",
      title: "Children",
      type: "array",
      of: [{ type: "recursiveCategory" }],
    }),
  ],
});

export const catalogueRootType = defineType({
  name: "catalogueRoot",
  title: "Catalogue Root",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "rootCategories",
      title: "Root Categories",
      type: "array",
      of: [{ type: "recursiveCategory" }],
    }),
  ],
});
```

### Document Syntax Link
https://github.com/sanity-io/hierarchical-document-list

### Document CRUD in CMS
Performance and usability degrade significantly with deep recursive editing. Practical depth limit for human editors is approximately 4-5 levels before the Studio UI becomes unmanageable.

### Verification
Sanity Studio UI breaks or becomes unmanageable for web developers and editors at approximately 6-7 levels of recursive nesting due to modal stacking and performance issues.

## Scope Contract 6: Curriculum Assembly and Synthesis

The curriculum follows the sequential learning path: root document → array nesting → relationships → deep nesting → recursive structures. Each concept builds upon the previous, establishing a complete understanding of Sanity v3's hierarchical data modeling capabilities for virtual file system implementation.

The progression moves from simple standalone documents to complex recursive structures, providing developers with the knowledge to choose the appropriate nesting strategy for their specific use case while understanding the trade-offs in performance, usability, and maintenance complexity.
