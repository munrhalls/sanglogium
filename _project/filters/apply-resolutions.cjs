const fs = require('fs');
const path = require('path');

const { loadJson, saveJson } = require('./migrate-lib.cjs');

const ACQUIRED_JSON = path.join(__dirname, 'acquired-values.json');
const QUEUE_JSON = path.join(__dirname, 'unresolved-queue.json');
const RESOLUTIONS_JSON = path.join(__dirname, 'human-resolutions.json');
const RESOLVED_JSON = path.join(__dirname, 'resolved-values.json');
const EXPORT_PATH = path.join(__dirname, 'products-export.json');

function noPublicSourceMarker() {
  return {
    sourceUrl: 'human-set, no public source',
    sourcePhrase: 'human-set, no public source',
    humanSet: true,
  };
}

function main() {
  if (!fs.existsSync(RESOLUTIONS_JSON)) {
    saveJson(RESOLUTIONS_JSON, {
      _schema:
        "Add resolutions to the 'resolutions' array, then run node _project/filters/apply-resolutions.cjs",
      resolutions: [],
    });
    console.log(`Created resolution template: ${RESOLUTIONS_JSON}`);
    return;
  }

  if (!fs.existsSync(ACQUIRED_JSON)) {
    throw new Error(`Missing ${ACQUIRED_JSON}. Run D2 acquisition first.`);
  }
  if (!fs.existsSync(QUEUE_JSON)) {
    throw new Error(`Missing ${QUEUE_JSON}. Run D3 queue build first.`);
  }

  const resolutions = loadJson(RESOLUTIONS_JSON);
  const acquired = loadJson(ACQUIRED_JSON);
  const queueData = loadJson(QUEUE_JSON);

  const exportData = loadJson(EXPORT_PATH);
  const products = Array.isArray(exportData.products) ? exportData.products : exportData;
  const productById = new Map();
  for (const p of products) productById.set(p._id, p);

  const queueKeys = new Set(queueData.queue.map((item) => `${item._id}::${item.facet}`));

  const resolvedList = [];
  const appliedKeys = new Set();

  for (const resolution of resolutions.resolutions || []) {
    const { _id, facet, value } = resolution;
    if (!_id || !facet || value === undefined || value === null) {
      console.warn('Skipping incomplete resolution:', JSON.stringify(resolution));
      continue;
    }

    const key = `${_id}::${facet}`;
    if (!queueKeys.has(key)) {
      console.warn(`Skipping resolution for ${key}: not in unresolved queue`);
      continue;
    }
    if (appliedKeys.has(key)) {
      console.warn(`Duplicate resolution for ${key}; using first.`);
      continue;
    }
    appliedKeys.add(key);

    const product = productById.get(_id);
    const productEntry = acquired.products[_id] || {
      _id,
      name: resolution.name || product?.name || '',
      slug: resolution.slug || product?.slug || '',
      brand: resolution.brand || product?.brandName || product?.brandSlug || '',
      facets: {},
    };

    const sourceUrl = resolution.sourceUrl || noPublicSourceMarker().sourceUrl;
    const sourcePhrase = resolution.sourcePhrase || noPublicSourceMarker().sourcePhrase;
    const humanSet = resolution.humanSet !== false;

    productEntry.facets[facet] = {
      status: 'filled',
      value: Array.isArray(value) ? value.join(', ') : String(value),
      sourceUrl,
      sourcePhrase,
      ...(humanSet ? { humanSet: true } : {}),
    };

    acquired.products[_id] = productEntry;

    resolvedList.push({
      _id,
      facet,
      value,
      sourceUrl,
      sourcePhrase,
      humanSet,
    });
  }

  // Remove resolved entries from the unresolved queue.
  const before = queueData.queue.length;
  queueData.queue = queueData.queue.filter((item) => {
    return !appliedKeys.has(`${item._id}::${item.facet}`);
  });
  queueData.total = queueData.queue.length;

  saveJson(ACQUIRED_JSON, acquired);
  saveJson(QUEUE_JSON, queueData);
  saveJson(RESOLVED_JSON, {
    generatedAt: new Date().toISOString(),
    applied: resolvedList.length,
    resolutions: resolvedList,
  });

  console.log(`=== Resolution apply ===`);
  console.log(`Resolutions applied: ${resolvedList.length}`);
  console.log(`Queue reduced from ${before} to ${queueData.total}`);
  console.log(`Updated ${ACQUIRED_JSON}`);
  console.log(`Updated ${QUEUE_JSON}`);
  console.log(`Wrote ${RESOLVED_JSON}`);
}

main();
