const fs = require('fs');
const path = require('path');

describe('Catalogue Split Data Integrity Test', () => {
  const originalFilePath = path.join(__dirname, '../app/components/layout/catalogue/catalogue-nav-data.json');
  const splitFilesDir = path.join(__dirname, '../app/components/layout/catalogue/');
  
  const splitFiles = [
    'headphones.json',
    'audio-electronics.json', 
    'accessories.json'
  ];

  let originalData;
  let splitData;

  beforeAll(() => {
    // Load original monolithic file
    const originalContent = fs.readFileSync(originalFilePath, 'utf8');
    originalData = JSON.parse(originalContent);

    // Load split files
    splitData = {};
    splitFiles.forEach(filename => {
      const filePath = path.join(splitFilesDir, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        splitData[filename.replace('.json', '')] = JSON.parse(content);
      } else {
        console.warn(`Split file not found: ${filename}`);
      }
    });
  });

  test('All split files exist', () => {
    splitFiles.forEach(filename => {
      const filePath = path.join(splitFilesDir, filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('Original catalogue has exactly 3 top-level categories', () => {
    expect(originalData.catalogue).toBeDefined();
    expect(originalData.catalogue).toHaveLength(3);
  });

  test('Split files contain correct categories', () => {
    const expectedCategories = ['headphones', 'audio-electronics', 'accessories'];
    
    expectedCategories.forEach(category => {
      expect(splitData[category]).toBeDefined();
      expect(splitData[category].catalogue).toBeDefined();
      expect(splitData[category].catalogue).toHaveLength(1);
    });
  });

  test('1:1 data match - Headphones category', () => {
    const originalHeadphones = originalData.catalogue.find(item => item.slug.current === 'headphones');
    const splitHeadphones = splitData.headphones.catalogue[0];
    
    expect(JSON.stringify(originalHeadphones)).toBe(JSON.stringify(splitHeadphones));
  });

  test('1:1 data match - Audio Electronics category', () => {
    const originalAudioElectronics = originalData.catalogue.find(item => item.slug.current === 'audio-electronics');
    const splitAudioElectronics = splitData['audio-electronics'].catalogue[0];
    
    expect(JSON.stringify(originalAudioElectronics)).toBe(JSON.stringify(splitAudioElectronics));
  });

  test('1:1 data match - Accessories category', () => {
    const originalAccessories = originalData.catalogue.find(item => item.slug.current === 'accessories');
    const splitAccessories = splitData.accessories.catalogue[0];
    
    expect(JSON.stringify(originalAccessories)).toBe(JSON.stringify(splitAccessories));
  });

  test('Complete data preservation verification', () => {
    // Reconstruct catalogue from split files
    const reconstructedCatalogue = [];
    
    // Add in the same order as original
    const originalOrder = ['headphones', 'audio-electronics', 'accessories'];
    originalOrder.forEach(categoryKey => {
      reconstructedCatalogue.push(splitData[categoryKey].catalogue[0]);
    });

    // Compare reconstructed with original
    expect(JSON.stringify(reconstructedCatalogue)).toBe(JSON.stringify(originalData.catalogue));
  });

  test('JSON structure validation', () => {
    splitFiles.forEach(filename => {
      const filePath = path.join(splitFilesDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verify valid JSON
      expect(() => JSON.parse(content)).not.toThrow();
      
      // Verify structure
      const data = JSON.parse(content);
      expect(data).toHaveProperty('catalogue');
      expect(Array.isArray(data.catalogue)).toBe(true);
      expect(data.catalogue).toHaveLength(1);
    });
  });
});
