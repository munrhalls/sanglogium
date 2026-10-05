import { HOME_12 } from "@/features/homepage";
import { getHomepage, getIemProductsBySlugs, HomePage } from "@/features/homepage/server";

export const revalidate = 3600;

export default async function Page() {
  const data = await getHomepage();
  const iemsData = await getIemProductsBySlugs(HOME_12);

  return <HomePage data={data} iemsData={iemsData} />;
}
