/**
 * Vector Store — ChromaDB Integration for Research Loop
 *
 * Purpose: Store and query hypothesis embeddings for semantic deduplication
 * Cost: $0 (local ChromaDB instance)
 */

import { ChromaClient, Collection } from 'chromadb';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

// Configuration
const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const COLLECTION_NAME = 'research_hypotheses';
const EMBEDDING_DIMENSION = 384; // Default for all-MiniLM-L6-v2 via Ollama

// Client singleton
let client = null;
let collection = null;

/**
 * Initialize ChromaDB connection
 * Returns true if successful, false if ChromaDB unavailable
 */
export async function initVectorStore() {
  try {
    client = new ChromaClient({ path: CHROMA_URL });

    // Test connection
    await client.heartbeat();

    // Get or create collection
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { description: 'Research loop hypothesis embeddings' }
    });

    console.log('✅ ChromaDB connected');
    return true;
  } catch (error) {
    console.warn('⚠️  ChromaDB unavailable:', error instanceof Error ? error.message : 'Unknown error');
    console.warn('   Falling back to file-based deduplication');
    return false;
  }
}

/**
 * Generate embedding via Ollama (fallback: simple hash)
 * In production, use Ollama's embeddings API
 */
async function generateEmbedding(text) {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/embeddings';
  const MODEL = process.env.RESEARCH_MODEL || 'llama3.2:3b';

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: text
      })
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

    const data = await response.json();
    if (data.embedding) return data.embedding;

    // Fallback: simple character code hash if Ollama doesn't support embeddings
    return fallbackEmbedding(text);
  } catch {
    return fallbackEmbedding(text);
  }
}

/**
 * Fallback embedding using simple hashing
 * Not semantically meaningful but enables similarity comparison
 */
function fallbackEmbedding(text) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const embedding = new Array(EMBEDDING_DIMENSION).fill(0);

  for (let i = 0; i < normalized.length; i++) {
    embedding[i % EMBEDDING_DIMENSION] += normalized.charCodeAt(i) / 255;
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }

  return embedding;
}

/**
 * Store hypothesis with embedding
 */
export async function storeHypothesis(
  id,
  hypothesis,
  dimension,
  metadata
) {
  if (!collection) {
    // Fallback: store to file
    return storeToFile(id, hypothesis, dimension, metadata);
  }

  try {
    const embedding = await generateEmbedding(hypothesis);

    await collection.add({
      ids: [id],
      embeddings: [embedding],
      documents: [hypothesis],
      metadatas: [{
        dimension,
        ...metadata,
        timestamp: new Date().toISOString()
      }]
    });

    return true;
  } catch (error) {
    console.error('Failed to store hypothesis:', error);
    return false;
  }
}

/**
 * Find similar hypotheses using cosine similarity
 * Returns array of similar hypotheses above threshold
 */
export async function findSimilarHypotheses(
  hypothesis,
  threshold = 0.85
) {
  if (!collection) {
    // Fallback: check file storage
    return findSimilarInFile(hypothesis, threshold);
  }

  try {
    const embedding = await generateEmbedding(hypothesis);

    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: 5,
      include: ['documents', 'metadatas', 'distances']
    });

    // ChromaDB returns cosine distance (0 = identical, 2 = opposite)
    // Convert to similarity (1 = identical)
    const similar = [];

    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        const distance = results.distances?.[0]?.[i] ?? 2;
        const similarity = 1 - (distance / 2); // Convert to 0-1 scale

        if (similarity >= threshold) {
          similar.push({
            id: results.ids[0][i],
            document: results.documents?.[0]?.[i] ?? '',
            distance: similarity,
            metadata: results.metadatas?.[0]?.[i] ?? {}
          });
        }
      }
    }

    return similar;
  } catch (error) {
    console.error('Similarity search failed:', error);
    return [];
  }
}

/**
 * Check if similar hypothesis exists
 */
export async function hasSimilarHypothesis(
  hypothesis,
  threshold = 0.85
) {
  const similar = await findSimilarHypotheses(hypothesis, threshold);
  return similar.length > 0;
}

/**
 * Get all hypotheses for a dimension
 */
export async function getHypothesesByDimension(
  dimension
) {
  if (!collection) {
    return getFromFileByDimension(dimension);
  }

  try {
    const results = await collection.get({
      where: { dimension }
    });

    return results.ids.map((id, i) => ({
      id,
      document: results.documents?.[i] ?? '',
      metadata: results.metadatas?.[i] ?? {}
    }));
  } catch {
    return [];
  }
}

/**
 * Get collection statistics
 */
export async function getStats() {
  if (!collection) {
    return { count: 0, available: false };
  }

  try {
    const count = await collection.count();
    return { count, available: true };
  } catch {
    return { count: 0, available: false };
  }
}

// ─────────────────────────────────────────────────────────────────
// FILE FALLBACK (when ChromaDB unavailable)
// ─────────────────────────────────────────────────────────────────

const FALLBACK_DIR = path.join(ROOT, '../_archived_sanglogium', 'research', 'vector-fallback');

async function storeToFile(
  id,
  hypothesis,
  dimension,
  metadata
) {
  try {
    await fs.mkdir(FALLBACK_DIR, { recursive: true });

    const filepath = path.join(FALLBACK_DIR, `${id}.json`);
    const data = {
      id,
      hypothesis,
      dimension,
      metadata,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

async function findSimilarInFile(
  hypothesis,
  threshold
) {
  try {
    const files = await fs.readdir(FALLBACK_DIR);
    const results = [];

    const queryEmbedding = fallbackEmbedding(hypothesis);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const content = await fs.readFile(path.join(FALLBACK_DIR, file), 'utf-8');
      const data = JSON.parse(content);

      const storedEmbedding = fallbackEmbedding(data.hypothesis);
      const similarity = cosineSimilarity(queryEmbedding, storedEmbedding);

      if (similarity >= threshold) {
        results.push({
          id: data.id,
          document: data.hypothesis,
          distance: similarity,
          metadata: data.metadata
        });
      }
    }

    return results.sort((a, b) => b.distance - a.distance);
  } catch {
    return [];
  }
}

async function getFromFileByDimension(
  dimension
) {
  try {
    const files = await fs.readdir(FALLBACK_DIR);
    const results = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const content = await fs.readFile(path.join(FALLBACK_DIR, file), 'utf-8');
      const data = JSON.parse(content);

      if (data.dimension === dimension) {
        results.push({
          id: data.id,
          document: data.hypothesis,
          metadata: data.metadata
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
