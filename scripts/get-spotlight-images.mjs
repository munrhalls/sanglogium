import { createClient } from 'next-sanity';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

const PRODUCT_ID = "moXlkADK7m1DHgGwWtblBG";

async function verifyDuplicate() {
  const query = `*[_type == "product" && _id == $productId][0]{
    _id,
    name,
    image{asset->{_id}},
    gallery[]{asset->{_id}}
  }`;

  const result = await client.fetch(query, { productId: PRODUCT_ID });
  console.log('BEFORE DELETION:');
  console.log(JSON.stringify(result, null, 2));

  if (!result) {
    console.error('Product not found');
    process.exit(1);
  }

  const mainImageId = result.image?.asset?._id;
  const firstGalleryImageId = result.gallery?.[0]?.asset?._id;
  const isDuplicate = mainImageId === firstGalleryImageId;

  console.log(`Main image ID: ${mainImageId}`);
  console.log(`First gallery image ID: ${firstGalleryImageId}`);
  console.log(`Is duplicate: ${isDuplicate}`);

  if (!isDuplicate) {
    console.error('No duplicate detected - gallery[0] does not match main image');
    process.exit(1);
  }

  return result;
}

async function deleteFirstGalleryImage() {
  const patch = client
    .patch(PRODUCT_ID)
    .unset(['gallery[0]']);

  const result = await patch.commit();
  console.log('\nDELETION COMPLETED:');
  console.log(`Updated product: ${result.name}`);
  console.log(`New gallery count: ${result.gallery?.length || 0}`);
}

async function verifyDeletion() {
  const query = `*[_type == "product" && _id == $productId][0]{
    _id,
    name,
    image{asset->{_id}},
    gallery[]{asset->{_id}}
  }`;

  const result = await client.fetch(query, { productId: PRODUCT_ID });
  console.log('\nAFTER DELETION:');
  console.log(JSON.stringify(result, null, 2));

  const mainImageId = result.image?.asset?._id;
  const firstGalleryImageId = result.gallery?.[0]?.asset?._id;
  const isDuplicate = mainImageId === firstGalleryImageId;

  console.log(`Main image ID: ${mainImageId}`);
  console.log(`First gallery image ID: ${firstGalleryImageId}`);
  console.log(`Is duplicate: ${isDuplicate}`);

  if (isDuplicate) {
    console.error('ERROR: Duplicate still exists after deletion');
    process.exit(1);
  }

  console.log('\n✓ VERIFICATION SUCCESSFUL: Duplicate removed');
}

try {
  await verifyDuplicate();
  await deleteFirstGalleryImage();
  await verifyDeletion();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
