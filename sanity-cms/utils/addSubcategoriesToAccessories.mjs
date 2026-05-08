import client from "./getClient.mjs";
import { nanoid } from "nanoid";

/**
 * Retrieves a category document by name
 * @param {string} categoryName - The name of the category to retrieve
 */
async function retrieveCategory(categoryName) {
  try {
    // Fetch the category document
    const category = await client.fetch(
      `*[_type == "category" && name == $categoryName][0]`,
      {
        categoryName,
      },
    );

    if (!category) {
      console.log(`Category "${categoryName}" not found.`);
      return null;
    }

    console.log(`Found category "${categoryName}"`);
    return category;
  } catch (error) {
    console.error("Error retrieving category:", error);
    return null;
  }
}

/**
 * Adds new subcategories to the Accessories category
 * Organizes them within appropriate groups when possible
 */
async function addSubcategoriesToAccessories() {
  // New subcategories to add
  const newSubcategories = [
    "HDMI Cables",
    "Phono Cartridges",
    "RCA Cables",
    "USB Cables",
    "Headphone Cables",
    "Ethernet Cables",
    "Speaker and Subwoofer accessories",
    "Microphone Accessories",
    "Power Management",
  ];

  // Get the Accessories category document
  const accessoriesCategory = await retrieveCategory("Accessories");
  if (!accessoriesCategory) return;

  // Get existing subcategories
  const existingSubcategories = accessoriesCategory.subcategories || [];

  // Create a set of existing subcategory names to check for duplicates
  const existingNames = new Set();
  existingSubcategories.forEach((sub) => {
    if (sub._type === "subcategory" && sub.name) {
      existingNames.add(sub.name);
    }
  });

  // Find group headers
  const groups = {};
  existingSubcategories.forEach((item, index) => {
    if (item._type === "groupedSubcategory" && item.header) {
      groups[item.header] = index;
    }
  });

  console.log("Existing groups:", Object.keys(groups));

  // Map subcategories to appropriate groups or create new ones
  const cableGroup = groups["Cables & Wiring"];

  // Items to add to the "Cables & Wiring" group
  const cableItems = [
    "HDMI Cables",
    "RCA Cables",
    "USB Cables",
    "Headphone Cables",
    "Ethernet Cables",
  ];

  // Items that will go into a new "Audio Equipment Accessories" group
  const audioEquipmentItems = [
    "Phono Cartridges",
    "Speaker and Subwoofer accessories",
    "Microphone Accessories",
  ];

  // Power Management will get its own group

  // Create updated subcategories array
  let updatedSubcategories = [...existingSubcategories];
  let subcategoriesToAdd = [];

  // Flag to track if we need to add a new group
  let needAudioEquipmentGroup = false;
  let needPowerManagementGroup = false;

  // Add cable items after the "Cables & Wiring" group
  if (cableGroup !== undefined) {
    let insertIndex = cableGroup + 1;

    // Find the next group after "Cables & Wiring"
    for (let i = insertIndex; i < existingSubcategories.length; i++) {
      if (existingSubcategories[i]._type === "groupedSubcategory") {
        break;
      }
      insertIndex++;
    }

    // Add cable subcategories
    for (const cable of cableItems) {
      if (!existingNames.has(cable)) {
        const newSubcategory = {
          _type: "subcategory",
          name: cable,
          _key: nanoid(12), // Generate a unique key
        };
        updatedSubcategories.splice(insertIndex, 0, newSubcategory);
        insertIndex++;
        console.log(`Added "${cable}" to Cables & Wiring group`);
      }
    }
  } else {
    // If no "Cables & Wiring" group exists, flag to add it later
    needAudioEquipmentGroup = true;
    cableItems.forEach((cable) => {
      if (!existingNames.has(cable)) {
        subcategoriesToAdd.push({
          _type: "subcategory",
          name: cable,
          _key: nanoid(12),
        });
      }
    });
  }

  // Check if we need to add the audio equipment group
  audioEquipmentItems.forEach((item) => {
    if (!existingNames.has(item)) {
      needAudioEquipmentGroup = true;
      subcategoriesToAdd.push({
        _type: "subcategory",
        name: item,
        _key: nanoid(12),
      });
    }
  });

  // Check if we need to add Power Management
  if (!existingNames.has("Power Management")) {
    needPowerManagementGroup = true;
    subcategoriesToAdd.push({
      _type: "subcategory",
      name: "Power Management",
      _key: nanoid(12),
    });
  }

  // If we have any new groups to add, add them at the end
  if (needAudioEquipmentGroup) {
    updatedSubcategories.push({
      _type: "groupedSubcategory",
      header: "Audio Equipment Accessories",
      _key: nanoid(12),
    });

    // Add audio equipment subcategories
    const audioItems = subcategoriesToAdd.filter((item) =>
      audioEquipmentItems.includes(item.name),
    );
    updatedSubcategories = [...updatedSubcategories, ...audioItems];
  }

  if (needPowerManagementGroup) {
    updatedSubcategories.push({
      _type: "groupedSubcategory",
      header: "Power Management",
      _key: nanoid(12),
    });

    // Add power management subcategory
    const powerItem = subcategoriesToAdd.find(
      (item) => item.name === "Power Management",
    );
    if (powerItem) {
      updatedSubcategories.push(powerItem);
    }
  }

  // Check if anything changed
  if (
    JSON.stringify(existingSubcategories) ===
    JSON.stringify(updatedSubcategories)
  ) {
    console.log("No changes needed - all subcategories already exist.");
    return;
  }

  // Update the category document
  try {
    const result = await client
      .patch(accessoriesCategory._id)
      .set({ subcategories: updatedSubcategories })
      .commit();

    console.log("Successfully updated subcategories!");
    console.log(
      `Added ${updatedSubcategories.length - existingSubcategories.length} new subcategories`,
    );
  } catch (error) {
    console.error("Error updating category:", error);
  }
}

// Execute the function
addSubcategoriesToAccessories();
