import { createClient } from 'next-sanity';

// Use the actual environment variables
const projectId = '2tdmkpky';
const dataset = 'production';
const apiVersion = '2024-11-26';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

async function sanityFetch({ query, params = {} }) {
  return client.fetch(query, params);
}

const CATALOGUE_QUERY = `
*[_type == "catalogueItem"] | order(sortOrder asc) {
  _id,
  title,
  type,
  slug,
  icon,
  parent->{
    _id,
    title
  }
}`;

async function fetchCatalogue() {
  try {
    const result = await sanityFetch({ query: CATALOGUE_QUERY });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchCatalogue();
