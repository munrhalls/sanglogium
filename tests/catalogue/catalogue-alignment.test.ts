import { describe, it, expect } from 'vitest';
import { CATALOGUE_DATA } from '../../app/components/layout/catalogue/data';

// Schema-aligned catalogue structure
interface CatalogueItem {
  title: string;
  type: "link" | "header";
  slug?: {
    _type: "slug";
    current: string;
  };
  icon?: string;
  children?: CatalogueItem[];
}

interface CatalogueDocument {
  catalogue: CatalogueItem[];
}

// Load the schema-aligned JSON
const schemaAlignedCatalogue: CatalogueDocument = require('../../catalogue.json');

describe('Catalogue Schema Alignment Test', () => {
  it('should preserve all top-level items', () => {
    expect(schemaAlignedCatalogue.catalogue).toHaveLength(CATALOGUE_DATA.length);

    const originalTitles = CATALOGUE_DATA.map(item => item.title).sort();
    const newTitles = schemaAlignedCatalogue.catalogue.map(item => item.title).sort();

    expect(newTitles).toEqual(originalTitles);
  });

  it('should preserve hierarchical structure for headphones', () => {
    const originalHeadphones = CATALOGUE_DATA.find(item => item.title === "Headphones & Personal Audio");
    const newHeadphones = schemaAlignedCatalogue.catalogue.find(item => item.title === "Headphones & Personal Audio");

    expect(originalHeadphones).toBeDefined();
    expect(newHeadphones).toBeDefined();

    // Check children structure
    expect(newHeadphones!.children).toHaveLength(originalHeadphones!.children!.length);

    const originalByCategory = originalHeadphones!.children![0];
    const newByCategory = newHeadphones!.children![0];

    expect(newByCategory.title).toBe(originalByCategory.title);
    expect(newByCategory.type).toBe(originalByCategory.type);
    expect(newByCategory.children).toHaveLength(originalByCategory.children!.length);

    // Check leaf items
    const originalCategories = originalByCategory.children!.map(child => child.title).sort();
    const newCategories = newByCategory.children!.map(child => child.title).sort();

    expect(newCategories).toEqual(originalCategories);
  });

  it('should preserve hierarchical structure for speakers', () => {
    const originalSpeakers = CATALOGUE_DATA.find(item => item.title === "Speakers");
    const newSpeakers = schemaAlignedCatalogue.catalogue.find(item => item.title === "Speakers");

    expect(originalSpeakers).toBeDefined();
    expect(newSpeakers).toBeDefined();

    // Check children structure
    expect(newSpeakers!.children).toHaveLength(originalSpeakers!.children!.length);

    const originalHomeTheater = originalSpeakers!.children![0];
    const newHomeTheater = newSpeakers!.children![0];

    expect(newHomeTheater.title).toBe(originalHomeTheater.title);
    expect(newHomeTheater.type).toBe(originalHomeTheater.type);
    expect(newHomeTheater.children).toHaveLength(originalHomeTheater.children!.length);

    // Check leaf items
    const originalFloorStanding = originalHomeTheater.children![0];
    const newFloorStanding = newHomeTheater.children![0];

    expect(newFloorStanding.title).toBe(originalFloorStanding.title);
    expect(newFloorStanding.type).toBe(originalFloorStanding.type);
  });

  it('should preserve hierarchical structure for accessories', () => {
    const originalAccessories = CATALOGUE_DATA.find(item => item.title === "Accessories");
    const newAccessories = schemaAlignedCatalogue.catalogue.find(item => item.title === "Accessories");

    expect(originalAccessories).toBeDefined();
    expect(newAccessories).toBeDefined();

    // Check children structure
    expect(newAccessories!.children).toHaveLength(originalAccessories!.children!.length);

    const originalCablesWiring = originalAccessories!.children![0];
    const newCablesWiring = newAccessories!.children![0];

    expect(newCablesWiring.title).toBe(originalCablesWiring.title);
    expect(newCablesWiring.type).toBe(originalCablesWiring.type);
    expect(newCablesWiring.children).toHaveLength(originalCablesWiring.children!.length);

    // Check leaf items
    const originalAudioCables = originalCablesWiring.children![0];
    const newAudioCables = newCablesWiring.children![0];

    expect(newAudioCables.title).toBe(originalAudioCables.title);
    expect(newAudioCables.type).toBe(originalAudioCables.type);
  });

  it('should preserve all slug values', () => {
    const getAllSlugs = (items: any[]): string[] => {
      const slugs: string[] = [];
      items.forEach(item => {
        if (item.slug?.current) {
          slugs.push(item.slug.current);
        }
        if (item.children) {
          slugs.push(...getAllSlugs(item.children));
        }
      });
      return slugs.sort();
    };

    const originalSlugs = getAllSlugs(CATALOGUE_DATA);
    const newSlugs = getAllSlugs(schemaAlignedCatalogue.catalogue);

    expect(newSlugs).toEqual(originalSlugs);
  });

  it('should preserve all type values', () => {
    const getAllTypes = (items: any[]): string[] => {
      const types: string[] = [];
      items.forEach(item => {
        types.push(item.type);
        if (item.children) {
          types.push(...getAllTypes(item.children));
        }
      });
      return types.sort();
    };

    const originalTypes = getAllTypes(CATALOGUE_DATA);
    const newTypes = getAllTypes(schemaAlignedCatalogue.catalogue);

    expect(newTypes).toEqual(originalTypes);
  });

  it('should preserve all icon values', () => {
    const getAllIcons = (items: any[]): string[] => {
      const icons: string[] = [];
      items.forEach(item => {
        if (item.icon) {
          icons.push(item.icon);
        }
        if (item.children) {
          icons.push(...getAllIcons(item.children));
        }
      });
      return icons.sort();
    };

    const originalIcons = getAllIcons(CATALOGUE_DATA);
    const newIcons = getAllIcons(schemaAlignedCatalogue.catalogue);

    expect(newIcons).toEqual(originalIcons);
  });

  it('should only contain schema-defined fields', () => {
    const checkSchemaFields = (items: any[]): void => {
      const allowedFields = ['title', 'type', 'slug', 'icon', 'children'];

      items.forEach(item => {
        const itemFields = Object.keys(item);
        itemFields.forEach(field => {
          expect(allowedFields).toContain(field);
        });

        if (item.children) {
          checkSchemaFields(item.children);
        }
      });
    };

    checkSchemaFields(schemaAlignedCatalogue.catalogue);
  });

  it('should have exact same total number of items', () => {
    const countItems = (items: any[]): number => {
      let count = items.length;
      items.forEach(item => {
        if (item.children) {
          count += countItems(item.children);
        }
      });
      return count;
    };

    const originalCount = countItems(CATALOGUE_DATA);
    const newCount = countItems(schemaAlignedCatalogue.catalogue);

    expect(newCount).toBe(originalCount);
  });
});
