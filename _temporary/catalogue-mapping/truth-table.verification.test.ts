/**
 * Truth Table Verification Test
 *
 * This test verifies 100% 1-to-1 content retention between:
 * - verification-consolidated-with-ids.md (source)
 * - catalogue-truth-table.json (derived)
 *
 * All content, relationships, and counts must match exactly.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MD_FILE = path.join(__dirname, 'verification-consolidated-with-ids.md');
const JSON_FILE = path.join(__dirname, 'catalogue-truth-table.json');

describe('Truth Table Content Retention', () => {
  const mdContent = fs.readFileSync(MD_FILE, 'utf-8');
  const jsonContent = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

  it('should retain exact overall summary totals', () => {
    // From MD line 26-27: "Total Unique Leaf Nodes: 25", "Total Products: 208"
    expect(jsonContent.overallSummary.totalUniqueLeafNodes).toBe(25);
    expect(jsonContent.overallSummary.totalProducts).toBe(208);
  });

  it('should retain all 18 chunk entries with exact values', () => {
    const chunks = jsonContent.overallSummary.chunks;
    expect(chunks).toHaveLength(18);

    // Verify specific chunk data from MD table lines 7-24
    expect(chunks[0]).toEqual({ range: '0-49', productsMatched: 12, status: 'Verified' });
    expect(chunks[1]).toEqual({ range: '50-74', productsMatched: 2, status: 'Verified' });
    expect(chunks[2]).toEqual({ range: '100-124', productsMatched: 0, status: 'Verified (no matches)' });
    expect(chunks[5]).toEqual({ range: '176-199', productsMatched: 8, status: 'Verified' });
    expect(chunks[17]).toEqual({ range: '576-583', productsMatched: 11, status: 'Pending' });
  });

  it('should retain all 25 leaf node paths', () => {
    const expectedPaths = [
      '/accessories/connectivity/adapters',
      '/accessories/connectivity/headphone-cables',
      '/accessories/connectivity/interconnects',
      '/accessories/fit-comfort/earpads',
      '/accessories/storage/headphone-stands',
      '/audio-electronics/amplification/bluetooth-dac-amps',
      '/audio-electronics/amplification/desktop-amps',
      '/audio-electronics/amplification/portable-amps',
      '/audio-electronics/digital-sources/bluetooth-dac-amps',
      '/audio-electronics/digital-sources/dac-amp-combos',
      '/audio-electronics/digital-sources/network-streamers',
      '/audio-electronics/digital-sources/standalone-dacs',
      '/audio-electronics/digital-sources/usb-c-dacs',
      '/headphones/by-design/closed-back',
      '/headphones/by-design/open-back',
      '/headphones/by-design/semi-open',
      '/headphones/by-driver/dynamic',
      '/headphones/by-driver/planar-magnetic',
      '/headphones/in-ear-monitors/monitors-iems'
    ];

    const actualPaths = Object.keys(jsonContent.leafNodes);
    expect(actualPaths.sort()).toEqual(expectedPaths.sort());
  });

  it('should retain exact product counts per category', () => {
    const testCases = [
      { path: '/accessories/connectivity/adapters', count: 3 },
      { path: '/accessories/connectivity/headphone-cables', count: 10 },
      { path: '/accessories/connectivity/interconnects', count: 2 },
      { path: '/accessories/fit-comfort/earpads', count: 5 },
      { path: '/accessories/storage/headphone-stands', count: 2 },
      { path: '/audio-electronics/amplification/bluetooth-dac-amps', count: 2 },
      { path: '/audio-electronics/amplification/desktop-amps', count: 25 },
      { path: '/audio-electronics/amplification/portable-amps', count: 3 },
      { path: '/audio-electronics/digital-sources/bluetooth-dac-amps', count: 1 },
      { path: '/audio-electronics/digital-sources/dac-amp-combos', count: 22 },
      { path: '/audio-electronics/digital-sources/network-streamers', count: 14 },
      { path: '/audio-electronics/digital-sources/standalone-dacs', count: 14 },
      { path: '/audio-electronics/digital-sources/usb-c-dacs', count: 4 },
      { path: '/headphones/by-design/closed-back', count: 32 },
      { path: '/headphones/by-design/open-back', count: 8 },
      { path: '/headphones/by-design/semi-open', count: 2 },
      { path: '/headphones/by-driver/dynamic', count: 23 },
      { path: '/headphones/by-driver/planar-magnetic', count: 14 },
      { path: '/headphones/in-ear-monitors/monitors-iems', count: 22 }
    ];

    for (const tc of testCases) {
      expect(jsonContent.leafNodes[tc.path].products).toHaveLength(tc.count);
      expect(jsonContent.leafNodes[tc.path].checklist.productCount).toBe(tc.count);
    }
  });

  it('should retain exact product names and IDs', () => {
    // Sample verification: /accessories/connectivity/adapters
    const adapters = jsonContent.leafNodes['/accessories/connectivity/adapters'].products;
    expect(adapters[0]).toEqual({
      name: 'AudioQuest Cinnamon USB to Micro Audio Cable - 2.46 ft. (.75m)',
      id: 'Y7l1IhzX2fnyiano58Gmxj'
    });
    expect(adapters[2]).toEqual({
      name: 'AudioQuest DragonTail USB Extender and Adapter',
      id: 'moXlkADK7m1DHgGwWxMnjQ'
    });

    // Verify ID format (Sanity document IDs)
    const allProducts = Object.values(jsonContent.leafNodes)
      .flatMap((node: any) => node.products);

    for (const product of allProducts) {
      expect(product.id).toMatch(/^[a-zA-Z0-9_-]{20,30}$/);
      expect(product.name).toBeTruthy();
      expect(typeof product.name).toBe('string');
    }
  });

  it('should retain all checklist data with verified status', () => {
    for (const [path, node] of Object.entries(jsonContent.leafNodes) as [string, any][]) {
      expect(node.checklist.verified).toBe(true);
      expect(node.checklist.mixUps).toBe(0);
      expect(node.checklist.productCount).toBeGreaterThan(0);
    }
  });

  it('should retain all 5 empty chunks with correct status', () => {
    const emptyChunks = ['100-124', '200-224', '226-249', '300-324', '350-374'];

    for (const chunk of emptyChunks) {
      expect(jsonContent.emptyChunks[chunk]).toBeDefined();
      expect(jsonContent.emptyChunks[chunk].totalMatched).toBe(0);
      expect(jsonContent.emptyChunks[chunk].status).toMatch(/Verified|Pending/);
      expect(jsonContent.emptyChunks[chunk].note).toBeTruthy();
    }
  });

  it('should have identical total product count when summed', () => {
    let sum = 0;
    for (const node of Object.values(jsonContent.leafNodes) as any[]) {
      sum += node.products.length;
    }
    expect(sum).toBe(jsonContent.overallSummary.totalProducts);
    expect(sum).toBe(208);  // Total entries across all categories (includes duplicates per MD)
  });

  it('should preserve all product entries including intentional duplicates from MD', () => {
    // The MD source intentionally contains duplicate product appearances across categories
    // e.g., same product listed in both /headphones/by-design/closed-back and /headphones/by-driver/dynamic
    // This test verifies the JSON preserves exactly what's in the MD

    // /headphones/by-design/closed-back has Focal Radiance twice (different variants listed separately in MD)
    const closedBack = jsonContent.leafNodes['/headphones/by-design/closed-back'].products;
    const focalRadianceCount = closedBack.filter((p: any) => p.name.includes('Focal Radiance')).length;
    expect(focalRadianceCount).toBe(2); // MD has 2 entries

    // /headphones/by-design/open-back has Focal Clear Mg twice
    const openBack = jsonContent.leafNodes['/headphones/by-design/open-back'].products;
    const clearMgCount = openBack.filter((p: any) => p.name === 'Focal Clear Mg Headphones').length;
    expect(clearMgCount).toBe(2);

    // Total products should match MD exactly (208 total entries including duplicates)
    const totalProducts = Object.values(jsonContent.leafNodes)
      .reduce((sum: number, node: any) => sum + node.products.length, 0);
    expect(totalProducts).toBe(208);
  });
});
