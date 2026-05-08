// deleteUtils.ts
import { client } from "./client";

// Define ID type
type SanityDocumentId = string;

export const cleanupRefs = async (
  categoryId: SanityDocumentId,
): Promise<void> => {
  try {
    const transaction = client.transaction();

    // Find & update referencing products
    const refs: SanityDocumentId[] = await client.fetch(
      `*[_type == "product" && references($id)]._id`,
      { id: categoryId },
    );

    refs.forEach((id: SanityDocumentId) => {
      transaction.patch(id, { unset: ["category"] });
    });

    await transaction.commit();
    await client.delete(categoryId);
  } catch (error) {
    console.error("Error during cleanupRefs:", error);
    throw error;
  }
};
