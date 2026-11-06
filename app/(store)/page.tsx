// Which homepage section owns what data/state: docs/features/homepage-structure.md — read it before changing composition.
import { HOME_12 } from "@/features/homepage";
import { getHomepage, getIemProductsBySlugs, HomepageView } from "@/features/homepage/server";

export const revalidate = 3600;

export default async function Page() {
  const data = await getHomepage();
  const iemsData = await getIemProductsBySlugs(HOME_12);

  return <HomepageView data={data} iemsData={iemsData} />;
}
