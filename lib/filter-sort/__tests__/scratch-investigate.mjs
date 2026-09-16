import { sanityQuery } from './sanityRaw.mjs';

const focal = await sanityQuery(
  `*[_type == "product" && name match "Focal*"]{
    _id, name, "acousticDesign": filterAttributes.acousticDesign,
    "category": filterAttributes.category, "connectivity": filterAttributes.connectivity
  }`
);
console.log('=== FOCAL PRODUCTS ===');
console.log(JSON.stringify(focal, null, 2));

const aperio = await sanityQuery(
  `*[_type == "product" && name match "*Aperio*"]{
    _id, name, catalogueLocationKeys, "category": filterAttributes.category,
    "connectivity": filterAttributes.connectivity, "deviceType": filterAttributes.deviceType
  }`
);
console.log('=== APERIO PRODUCTS ===');
console.log(JSON.stringify(aperio, null, 2));
