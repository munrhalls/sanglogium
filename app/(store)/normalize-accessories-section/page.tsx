import Accessories from "@/app/components/features/homepage/accessories/Accessories";
import Shelf from "@/app/components/layout/general/Shelf";
import { fetchHomepageData } from "../lib/fetchHomepageData";
import fs from "fs/promises";
import path from "path";

// Dev-only preview page: reads a LOCAL, git-ignored image-normalization map at
// request time. Never prerender it (the map file is not part of the deployment),
// and degrade gracefully when the map is absent.
export const dynamic = "force-dynamic";

function slugifyFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

interface FlaggedMapEntry {
  _id: string;
  flaggedFilename: string;
}

function getOriginalLocalSrc(name: string, assetId: string, url: string): string {
  const ext = path.extname(new URL(url).pathname) || ".png";
  return `/normalize-accessories-images/${slugifyFilename(name)}-${assetId}${ext}`;
}

function remapImage<T extends { _id: string; name: string; image?: { asset?: { _id?: string; url?: string } | null } }>(
  item: T,
  flaggedById: Map<string, string>
): T {
  const assetId = item.image?.asset?._id;
  const url = item.image?.asset?.url;
  if (!assetId || !url) return item;

  const flaggedFilename = flaggedById.get(item._id);
  const localSrc = flaggedFilename
    ? `/normalize-accessories-images/${flaggedFilename}`
    : getOriginalLocalSrc(item.name, assetId, url);

  return {
    ...item,
    image: {
      ...item.image,
      asset: {
        ...item.image!.asset,
        _id: localSrc,
      },
    },
  } as T;
}

export default async function NormalizeAccessoriesSectionPage() {
  const data = await fetchHomepageData();

  // The local map is optional: when missing (e.g. on CI/Vercel, where the
  // directory is not committed), render with the original Sanity images instead
  // of failing the build or 500ing at runtime.
  let flaggedById = new Map<string, string>();
  try {
    const mapPath = path.join(process.cwd(), "normalize-accessories-images", "flagged-map.json");
    const mapData: FlaggedMapEntry[] = JSON.parse(await fs.readFile(mapPath, "utf-8"));
    flaggedById = new Map(mapData.map((entry) => [entry._id, entry.flaggedFilename]));
  } catch {
    flaggedById = new Map<string, string>();
  }

  const remap = (item: any) => remapImage(item, flaggedById);

  const accessoriesData = {
    cables: data.accessories.cables.map(remap),
    interconnects: data.accessories.interconnects.map(remap),
    adapters: data.accessories.adapters.map(remap),
    earpads: data.accessories.earpads.map(remap),
    eartips: data.accessories.eartips.map(remap),
    careCleaning: data.accessories.careCleaning.map(remap),
    storage: data.accessories.storage.map(remap),
  };

  return (
    <Shelf fullBleed spacing="loose">
      <Accessories accessoriesData={accessoriesData} />
    </Shelf>
  );
}
