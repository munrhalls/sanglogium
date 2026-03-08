import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import data from "./prod.json";

export default function ProductSpotlight1() {
  return (
    <div className="group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <SpotlightHero image={data.mainImage} tier="standard" />
      <SpotlightDetails
        data={data}
        accentColor="text-brand-400"
        buttonClass="bg-brand-400 text-brand-900 hover:bg-brand-300"
      />
    </div>
  );
}

