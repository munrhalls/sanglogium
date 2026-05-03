import { sanityFetch } from "@/sanity-config/lib/client";
import type { CatalogueItem } from "@/sanity.types";

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

function transformSanityToLegacyJson(items: CatalogueItem[]): { catalogue: any[] } {
  const itemMap = new Map(items.map(item => [item._id, item]));

  const rootItems = items.filter(item => !item.parent);

  const catalogue = rootItems.map(rootItem => {
    return buildLegacyCatalogueItem(rootItem, items, itemMap);
  });

  return { catalogue };
}

function buildLegacyCatalogueItem(
  item: CatalogueItem,
  allItems: CatalogueItem[],
  itemMap: Map<string, CatalogueItem>
): any {
  const children = allItems.filter(child =>
    child.parent && child.parent._id === item._id
  );

  const childrenArray = children.map(child => {
    return buildLegacyCatalogueItem(child, allItems, itemMap);
  });

  const legacyItem: any = {
    id: item.slug?.current || item.title?.toLowerCase().replace(/\s+/g, '-') || item._id,
    title: item.title,
    type: item.type,
  };

  if (item.slug) {
    legacyItem.slug = {
      current: item.slug.current,
      _type: "slug"
    };
  }

  if (item.icon) {
    legacyItem.icon = item.icon;
  }

  if (childrenArray.length > 0) {
    legacyItem.children = childrenArray;
  }

  return legacyItem;
}

export async function getSanityCatalogueData(): Promise<{ catalogue: any[] }> {
  try {
    const sanityItems = await sanityFetch<CatalogueItem[]>({
      query: CATALOGUE_QUERY,
    });

    const result = transformSanityToLegacyJson(sanityItems);
    console.log('CATALOGUE JSON WITH IDs:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error fetching catalogue data from Sanity:', error);

    return { catalogue: [] };
  }
}



// {
//   "catalogue": [
//     {
//       "title": "Headphones",
//       "type": "header",
//       "slug": {
//         "current": "headphones",
//         "_type": "slug"
//       },
//       "icon": "headphones",
//       "children": [
//         {
//           "title": "By Design",
//           "type": "header",
//           "children": [
//             {
//               "title": "Open-Back",
//               "type": "link",
//               "slug": {
//                 "current": "open-back",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Closed-Back",
//               "type": "link",
//               "slug": {
//                 "current": "closed-back",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "By Driver",
//           "type": "header",
//           "children": [
//             {
//               "title": "Planar Magnetic",
//               "type": "link",
//               "slug": {
//                 "current": "planar-magnetic",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Dynamic",
//               "type": "link",
//               "slug": {
//                 "current": "dynamic",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Electrostatic",
//               "type": "link",
//               "slug": {
//                 "current": "electrostatic",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "In-Ear & Wireless",
//           "type": "header",
//           "children": [
//             {
//               "title": "Monitors (IEMs)",
//               "type": "link",
//               "slug": {
//                 "current": "monitors-iems",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "True Wireless (TWS)",
//               "type": "link",
//               "slug": {
//                 "current": "true-wireless-tws",
//                 "_type": "slug"
//               }
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "title": "Audio Electronics",
//       "type": "header",
//       "slug": {
//         "current": "audio-electronics",
//         "_type": "slug"
//       },
//       "icon": "audio-electronics",
//       "children": [
//         {
//           "title": "Amplification",
//           "type": "header",
//           "children": [
//             {
//               "title": "Desktop Amps",
//               "type": "link",
//               "slug": {
//                 "current": "desktop-amps",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Portable Amps",
//               "type": "link",
//               "slug": {
//                 "current": "portable-amps",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "Digital Sources",
//           "type": "header",
//           "children": [
//             {
//               "title": "Standalone DACs",
//               "type": "link",
//               "slug": {
//                 "current": "standalone-dacs",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "DAC/Amp Combos",
//               "type": "link",
//               "slug": {
//                 "current": "dac-amp-combos",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Digital Players (DAPs)",
//               "type": "link",
//               "slug": {
//                 "current": "digital-players-daps",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Network Streamers",
//               "type": "link",
//               "slug": {
//                 "current": "network-streamers",
//                 "_type": "slug"
//               }
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "title": "Accessories",
//       "type": "header",
//       "slug": {
//         "current": "accessories",
//         "_type": "slug"
//       },
//       "icon": "accessories",
//       "children": [
//         {
//           "title": "Connectivity",
//           "type": "header",
//           "children": [
//             {
//               "title": "Headphone Cables",
//               "type": "link",
//               "slug": {
//                 "current": "headphone-cables",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Interconnects",
//               "type": "link",
//               "slug": {
//                 "current": "interconnects",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Adapters",
//               "type": "link",
//               "slug": {
//                 "current": "adapters",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "Maintenance",
//           "type": "header",
//           "children": [
//             {
//               "title": "Earpads",
//               "type": "link",
//               "slug": {
//                 "current": "earpads",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Care & Cleaning",
//               "type": "link",
//               "slug": {
//                 "current": "care-cleaning",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "Storage",
//           "type": "header",
//           "children": [
//             {
//               "title": "Headphone Stands",
//               "type": "link",
//               "slug": {
//                 "current": "headphone-stands",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Carrying Cases",
//               "type": "link",
//               "slug": {
//                 "current": "carrying-cases",
//                 "_type": "slug"
//               }
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
