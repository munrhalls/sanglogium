// deleteAllDocuments.mjs
import client from "../getClient.mjs";

async function findAndRemoveAllReferences() {
  try {
    const query = `*[references(*[_type == "category"]._id)] {
      _id,
      _type,
      "references": *[_type == "category" && references(^._id)]._id
    }`;

    const referencingDocs = await client.fetch(query);
    console.log(
      `Found ${referencingDocs.length} documents referencing categories`,
    );

    for (const doc of referencingDocs) {
      const fullDoc = await client.fetch(`*[_id == $id][0]`, { id: doc._id });

      const referenceFields = [];
      for (const [key, value] of Object.entries(fullDoc)) {
        if (
          value &&
          ((Array.isArray(value) && value.some((v) => v?._ref)) ||
            value._ref ||
            (Array.isArray(value) &&
              value.length > 0 &&
              typeof value[0] === "string") ||
            key.toLowerCase().includes("category") ||
            key.toLowerCase().includes("categories"))
        ) {
          referenceFields.push(key);
        }
      }

      console.log(
        `Found reference fields in ${doc._type}: ${referenceFields.join(", ")}`,
      );

      const patch = client.patch(doc._id);
      for (const field of referenceFields) {
        patch.unset([field]);
      }

      await patch.commit();
      console.log(`Removed references from document ${doc._id}`);
    }

    console.log("Successfully removed all category references");
  } catch (error) {
    console.error("Error removing references:", error);
    throw error;
  }
}

async function deleteAllDocumentsOfType(documentType) {
  try {
    console.log("Removing references to categories...");
    await findAndRemoveAllReferences();

    const query = `*[_type == $type]._id`;
    const documentIds = await client.fetch(query, { type: documentType });

    console.log(
      `Found ${documentIds.length} documents of type "${documentType}"`,
    );

    if (documentIds.length === 0) {
      console.log("No documents to delete");
      return;
    }

    const batchSize = 10;
    const batches = Math.ceil(documentIds.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, documentIds.length);
      const batch = documentIds.slice(start, end);

      try {
        const transaction = client.transaction();

        batch.forEach((id) => {
          transaction.delete(id);
        });

        await transaction.commit();

        console.log(
          `Deleted batch ${i + 1}/${batches} (${batch.length} documents)`,
        );
      } catch (error) {
        console.error(`Error deleting batch ${i + 1}:`, error);
      }

      if (i < batches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`Finished deleting documents of type "${documentType}"`);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

const documentType = "category";

try {
  await deleteAllDocumentsOfType(documentType);
} catch (error) {
  console.error("Error deleting documents:", error);
  process.exit(1);
}
