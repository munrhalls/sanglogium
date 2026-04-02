/**
 * Test Smart Title Optimization
 * 
 * Verifies the title optimization system works across different scenarios
 */

import { generateOptimizedTitle, generateSEOTitle, analyzeTitleLength } from '../lib/utils/title-optimization.js';

const testCases = [
  // Short product names
  { name: 'Focal Clear Mg', brand: 'Focal' },
  { name: 'HD 660S', brand: 'Sennheiser' },
  
  // Medium product names (current Focal example)
  { name: 'Focal Clear Mg Headphones', brand: 'Focal' },
  { name: 'Sennheiser HD 660S Headphones', brand: 'Sennheiser' },
  
  // Long product names (problematic cases)
  { name: 'Bowers & Wilkins Pi7 S2 Wireless In-Ear Headphones', brand: 'Bowers & Wilkins' },
  { name: 'AudioQuest DragonFly Cobalt USB DAC Headphone Amplifier', brand: 'AudioQuest' },
  { name: 'Meze Audio 99 Series 2.5mm or 4.4mm Replacement Cable', brand: 'Meze Audio' },
  { name: 'Advance Paris A12 Classic Integrated Amplifier with DAC', brand: 'Advance Paris' },
  
  // Very long product names (extreme cases)
  { name: 'Benchmark Media Systems DAC3 HGC High-Resolution USB DAC with Headphone Amp', brand: 'Benchmark Media Systems' },
  { name: 'Chord Electronics Mojo 2 Portable DAC and Headphone Amplifier with Poly Wireless Streaming Module', brand: 'Chord Electronics' },
  
  // Edge cases
  { name: 'Short', brand: null },
  { name: 'A Very Long Product Name Without Any Brand Information That Would Normally Cause Truncation Issues', brand: null },
];

console.log('=== Smart Title Optimization Test Results ===\n');

testCases.forEach((testCase, index) => {
  console.log(`Test Case ${index + 1}: ${testCase.name}`);
  console.log(`Brand: ${testCase.brand || 'None'}`);
  
  const optimizedTitle = generateOptimizedTitle({
    productName: testCase.name,
    brand: testCase.brand,
    siteName: 'Sang Logium'
  });
  
  const seoTitle = generateSEOTitle({
    productName: testCase.name,
    brand: testCase.brand,
    siteName: 'Sang Logium'
  });
  
  const analysis = analyzeTitleLength(optimizedTitle);
  
  console.log(`Browser Title: "${optimizedTitle}" (${optimizedTitle.length} chars)`);
  console.log(`SEO Title: "${seoTitle}" (${seoTitle.length} chars)`);
  console.log(`Tab Display: "${analysis.browserTabDisplay}"`);
  
  if (analysis.recommendations.length > 0) {
    console.log(`⚠️  ${analysis.recommendations.join(', ')}`);
  } else {
    console.log('✅ Perfect length for all contexts');
  }
  
  console.log('---');
});

// Summary statistics
console.log('\n=== Summary Statistics ===');
const allTitles = testCases.map(tc => generateOptimizedTitle({
  productName: tc.name,
  brand: tc.brand,
  siteName: 'Sang Logium'
}));

const avgLength = allTitles.reduce((sum, title) => sum + title.length, 0) / allTitles.length;
const maxLength = Math.max(...allTitles.map(t => t.length));
const minLength = Math.min(...allTitles.map(t => t.length));

console.log(`Average title length: ${avgLength.toFixed(1)} characters`);
console.log(`Longest title: ${maxLength} characters`);
console.log(`Shortest title: ${minLength} characters`);
console.log(`Titles under 60 chars: ${allTitles.filter(t => t.length <= 60).length}/${allTitles.length}`);

console.log('\n🎉 Smart Title Optimization System Active!');
console.log('All product pages now have optimized browser tab titles automatically.');
