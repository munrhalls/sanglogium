import { sanityQuery } from './sanityRaw.mjs';

const r = await sanityQuery(
  `*[_id in ["PHPYj28HJdPDHAaIBCCaW4", "xMEqvkRBbdrlJXyFG8f1l7", "xMEqvkRBbdrlJXyFG8igwj"]]{
    _id, name, "imageRef": image.asset._ref
  }`
);
console.log(JSON.stringify(r, null, 2));
