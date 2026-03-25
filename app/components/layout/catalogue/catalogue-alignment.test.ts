import { readFileSync } from 'fs';
import { CATALOGUE_DATA } from './app/components/layout/catalogue/data';

// Test data structure alignment
const originalData = CATALOGUE_DATA;
const newCatalogue = JSON.parse(readFileSync('./catalogue.json', 'utf8'));

console.log('🔍 Testing catalogue alignment...\n');

// Test 1: Root structure matches
console.log('✅ Test 1: Root structure');
if (!newCatalogue.catalogue || !Array.isArray(newCatalogue.catalogue)) {
  throw new Error('Root catalogue structure invalid');
}

// Test 2: Same number of main categories
console.log('✅ Test 2: Main categories count');
if (newCatalogue.catalogue.length !== originalData.length) {
  throw new Error(`Expected ${originalData.length} main categories, got ${newCatalogue.catalogue.length}`);
}

// Test 3: All main categories preserved
console.log('✅ Test 3: Main categories preservation');
originalData.forEach((originalItem, index) => {
  const newItem = newCatalogue.catalogue[index];
  if (!newItem || newItem.title !== originalItem.label) {
    throw new Error(`Main category mismatch at index ${index}: expected "${originalItem.label}", got "${newItem?.title}"`);
  }
});

// Test 4: All sections preserved as children
console.log('✅ Test 4: Sections preserved as children');
originalData.forEach((originalItem, mainIndex) => {
  const newItem = newCatalogue.catalogue[mainIndex];
  
  if (!newItem.children || newItem.children.length !== originalItem.sections.length) {
    throw new Error(`Section count mismatch for "${originalItem.label}"`);
  }
  
  originalItem.sections.forEach((section, sectionIndex) => {
    const newSection = newItem.children[sectionIndex];
    if (!newSection || newSection.title !== section.title) {
      throw new Error(`Section title mismatch for "${originalItem.label}": expected "${section.title}", got "${newSection?.title}"`);
    }
  });
});

// Test 5: All links preserved as nested children
console.log('✅ Test 5: Links preserved as nested children');
originalData.forEach((originalItem, mainIndex) => {
  const newItem = newCatalogue.catalogue[mainIndex];
  
  originalItem.sections.forEach((section, sectionIndex) => {
    const newSection = newItem.children[sectionIndex];
    
    if (!newSection.children || newSection.children.length !== section.links.length) {
      throw new Error(`Link count mismatch in section "${section.title}" of "${originalItem.label}"`);
    }
    
    section.links.forEach((link, linkIndex) => {
      const newLink = newSection.children[linkIndex];
      if (!newLink || newLink.title !== link) {
        throw new Error(`Link mismatch in section "${section.title}": expected "${link}", got "${newLink?.title}"`);
      }
    });
  });
});

// Test 6: Icon mapping preserved
console.log('✅ Test 6: Icon mapping');
originalData.forEach((originalItem, index) => {
  const newItem = newCatalogue.catalogue[index];
  const expectedIcon = originalItem.id;
  if (newItem.icon !== expectedIcon) {
    throw new Error(`Icon mismatch for "${originalItem.label}": expected "${expectedIcon}", got "${newItem.icon}"`);
  }
});

// Test 7: Slug structure
console.log('✅ Test 7: Slug structure');
originalData.forEach((originalItem, index) => {
  const newItem = newCatalogue.catalogue[index];
  if (!newItem.slug || newItem.slug.current !== originalItem.id) {
    throw new Error(`Slug mismatch for "${originalItem.label}": expected "${originalItem.id}", got "${newItem.slug?.current}"`);
  }
});

// Test 8: Type field assignment
console.log('✅ Test 8: Type field assignment');
const validateTypes = (items: any[], expectedType: string = 'header') => {
  items.forEach(item => {
    if (item.type !== expectedType) {
      throw new Error(`Type mismatch for "${item.title}": expected "${expectedType}", got "${item.type}"`);
    }
    if (item.children) {
      validateTypes(item.children, item.children.some((child: any) => child.children) ? 'header' : 'link');
    }
  });
};

validateTypes(newCatalogue.catalogue);

console.log('\n🎉 All tests passed! Catalogue is perfectly aligned with schema and preserves all content relationships.');
