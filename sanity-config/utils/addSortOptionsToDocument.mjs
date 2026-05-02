import client from "./getClient.mjs";

/**
 * Fetches a categorySortables document by title
 * @param {string} title - The title of the document to fetch
 * @returns {Promise<Object>} - The document or null if not found
 */
async function getCategorySortablesByTitle(title) {
  try {
    const query = `*[_type == "categorySortables" && title == "${title}"][0]{
      _id,
      title,
      sortOptions,
      categoryMappings
    }`;

    console.log(`Fetching document with title "${title}"...`);
    const document = await client.fetch(query);

    if (!document) {
      console.log(`No document found with title "${title}"`);
      return null;
    }

    return document;
  } catch (error) {
    console.error(`Error fetching document with title "${title}":`, error);
    return null;
  }
}

/**
 * Adds sort options from one document to another
 * @param {string} sourceTitle - Title of the source document to copy options from
 * @param {string} targetTitle - Title of the target document to add options to
 * @param {Array<string>} optionNames - Array of sort option names to copy
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function addSortOptionsToDocument(sourceTitle, targetTitle, optionNames) {
  try {
    // Fetch the source document
    const sourceDoc = await getCategorySortablesByTitle(sourceTitle);
    if (!sourceDoc) {
      console.error(`Source document "${sourceTitle}" not found.`);
      return false;
    }

    // Fetch the target document
    const targetDoc = await getCategorySortablesByTitle(targetTitle);
    if (!targetDoc) {
      console.error(`Target document "${targetTitle}" not found.`);
      return false;
    }

    // Find the sort options to copy
    const optionsToCopy = [];
    const notFound = [];

    for (const optionName of optionNames) {
      const option = sourceDoc.sortOptions.find(
        (opt) => opt.name === optionName,
      );
      if (option) {
        optionsToCopy.push(option);
      } else {
        notFound.push(optionName);
      }
    }

    if (notFound.length > 0) {
      console.warn(
        `Warning: The following options were not found in the source document: ${notFound.join(", ")}`,
      );
    }

    if (optionsToCopy.length === 0) {
      console.error("No valid options to copy.");
      return false;
    }

    // Check for duplicate options in the target document
    const targetOptionNames = targetDoc.sortOptions
      ? targetDoc.sortOptions.map((opt) => opt.name)
      : [];
    const duplicateOptions = optionsToCopy.filter((opt) =>
      targetOptionNames.includes(opt.name),
    );

    if (duplicateOptions.length > 0) {
      console.warn(
        `Warning: The following options already exist in the target document and will be skipped: ${duplicateOptions.map((opt) => opt.name).join(", ")}`,
      );
      // Remove duplicates from the options to copy
      const filteredOptions = optionsToCopy.filter(
        (opt) => !targetOptionNames.includes(opt.name),
      );
      if (filteredOptions.length === 0) {
        console.error(
          "All options already exist in the target document. Nothing to add.",
        );
        return false;
      }
      optionsToCopy.length = 0;
      optionsToCopy.push(...filteredOptions);
    }

    // Display the options that will be copied
    console.log("\nThe following sort options will be copied:");
    optionsToCopy.forEach((option, index) => {
      console.log(`${index + 1}. ${option.displayName} (${option.name})`);
      console.log(`   Type: ${option.type}`);
      console.log(`   Field: ${option.field}`);
      console.log(`   Default Direction: ${option.defaultDirection}`);
    });

    // Prepare the updated sort options for the target document
    const updatedSortOptions = [
      ...(targetDoc.sortOptions || []),
      ...optionsToCopy,
    ];

    // Update the target document in Sanity
    console.log(
      `\nUpdating document "${targetTitle}" with new sort options...`,
    );
    const result = await client
      .patch(targetDoc._id)
      .set({ sortOptions: updatedSortOptions })
      .commit();

    console.log(`Successfully updated document "${targetTitle}"`);
    console.log(`Added ${optionsToCopy.length} sort option(s)`);
    return true;
  } catch (error) {
    console.error("Error adding sort options to document:", error);
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Check if the required arguments are provided
    if (process.argv.length < 5) {
      console.log(
        "Usage: node addSortOptionsToDocument.mjs <sourceTitle> <targetTitle> <option1,option2,...>",
      );
      console.log(
        'Example: node addSortOptionsToDocument.mjs "headphones" "speakers" "bassPerformance,detailClarity,frequencyRange"',
      );
      return;
    }

    // Get the arguments
    const sourceTitle = process.argv[2];
    const targetTitle = process.argv[3];
    const optionNamesArg = process.argv[4];

    // Parse the option names
    const optionNames = optionNamesArg.split(",").map((name) => name.trim());

    console.log(`Source document: "${sourceTitle}"`);
    console.log(`Target document: "${targetTitle}"`);
    console.log(`Options to copy: ${optionNames.join(", ")}`);

    // Add the sort options
    await addSortOptionsToDocument(sourceTitle, targetTitle, optionNames);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the main function
main();
