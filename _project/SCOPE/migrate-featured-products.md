```
Objective: Safely implement a parallel data structure (featuredProducts) in the Sanity homepageData schema, migrate data into it using a strictly scoped script, and switch the frontend to consume it, resulting in zero disruption to existing data.

In Scope:

Adding exactly one new field (featuredProducts) to the homepageData schema.

Structuring featuredProducts as an array of objects containing a product reference and a string (productPromo).

Writing a migration script using @sanity/client to patch the new field via a provided payload.json.

Executing the migration script via PowerShell.

Refactoring the provided frontend component to map over featuredProducts.

Out of Scope (Forbidden):

Modifying, deleting, or renaming the existing featured array.

Modifying or deleting existing documents, product IDs, or product data.

Refactoring schema elements outside of featuredProducts.

Updating frontend components other than the specific one consuming this data.

Adding future-proofing features, complex validations, or structural changes beyond the exact requirement.
```