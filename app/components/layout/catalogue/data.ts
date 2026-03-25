export type CatalogueSection = {
  title: string;
  children: CatalogueItem[];
};

export type CatalogueItem = {
  _key?: string;
  _type?: "catalogueItem";
  title: string;
  type: "link" | "header";
  slug?: {
    _type: "slug";
    current: string;
  };
  icon?: string;
  children?: CatalogueItem[];
  // Only present on leaf nodes where type === 'link' && !children
  productIds?: string[];
  // Legacy structure for UI compatibility - maps children to sections
  sections?: Array<{
    title: string;
    links: string[];
  }>;
  // Legacy properties for UI compatibility
  label: string; // Maps to title
  imageUrl: string; // Placeholder for hero images
};

// The exact shape that will be inserted into Sanity
export type CataloguePayload = CatalogueItem[];

export const CATALOGUE_DATA: CatalogueItem[] = [
  {
    _key: "headphones",
    _type: "catalogueItem",
    title: "Headphones & Personal Audio",
    type: "link",
    slug: {
      _type: "slug",
      current: "headphones"
    },
    icon: "headphones",
    children: [
      {
        _key: "headphones-by-category",
        _type: "catalogueItem",
        title: "By category",
        type: "header",
        children: [
          {
            _key: "wired",
            _type: "catalogueItem",
            title: "Wired",
            type: "link",
            slug: {
              _type: "slug",
              current: "wired"
            }
          },
          {
            _key: "wireless",
            _type: "catalogueItem",
            title: "Wireless",
            type: "link",
            slug: {
              _type: "slug",
              current: "wireless"
            }
          },
          {
            _key: "noise-cancelling",
            _type: "catalogueItem",
            title: "Noise cancelling",
            type: "link",
            slug: {
              _type: "slug",
              current: "noise-cancelling"
            }
          },
          {
            _key: "earbuds",
            _type: "catalogueItem",
            title: "Earbuds",
            type: "link",
            slug: {
              _type: "slug",
              current: "earbuds"
            }
          }
        ]
      }
    ],
    // Legacy sections for UI compatibility
    sections: [
      {
        title: "By category",
        links: ["Wired", "Wireless", "Noise cancelling", "Earbuds"]
      }
    ],
    // Legacy properties for UI compatibility
    label: "Headphones & Personal Audio",
    imageUrl: "/images/headphones-skeletal.png"
  },
  {
    _key: "speakers",
    _type: "catalogueItem",
    title: "Speakers",
    type: "link",
    slug: {
      _type: "slug",
      current: "speakers"
    },
    icon: "speaker",
    children: [
      {
        _key: "speakers-home-theater",
        _type: "catalogueItem",
        title: "Home theater",
        type: "header",
        children: [
          {
            _key: "floor-standing-speakers",
            _type: "catalogueItem",
            title: "Floor standing speakers",
            type: "link",
            slug: {
              _type: "slug",
              current: "floor-standing-speakers"
            }
          }
        ]
      }
    ],
    // Legacy sections for UI compatibility
    sections: [
      {
        title: "Home theater",
        links: ["Floor standing speakers"]
      }
    ],
    // Legacy properties for UI compatibility
    label: "Speakers",
    imageUrl: "/images/speakers-skeletal.png"
  },
  {
    _key: "accessories",
    _type: "catalogueItem",
    title: "Accessories",
    type: "link",
    slug: {
      _type: "slug",
      current: "accessories"
    },
    icon: "cable",
    children: [
      {
        _key: "cables-wiring",
        _type: "catalogueItem",
        title: "Cables & Wiring",
        type: "header",
        children: [
          {
            _key: "audio-cables",
            _type: "catalogueItem",
            title: "Audio cables",
            type: "link",
            slug: {
              _type: "slug",
              current: "audio-cables"
            }
          }
        ]
      }
    ],
    // Legacy sections for UI compatibility
    sections: [
      {
        title: "Cables & Wiring",
        links: ["Audio cables"]
      }
    ],
    // Legacy properties for UI compatibility
    label: "Accessories",
    imageUrl: "/images/accessories-skeletal.png"
  }
];
