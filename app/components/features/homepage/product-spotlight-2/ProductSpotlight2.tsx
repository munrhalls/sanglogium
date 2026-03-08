import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import data from "./prod.json";

export default function ProductSpotlight2() {
  return (
    <div className="group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <SpotlightDetails
        data={data}
        accentColor="text-secondary-400"
        buttonClass="bg-secondary-400 text-white hover:bg-secondary-300"
      />
      <SpotlightHero image={data.mainImage} tier="standard" />
    </div>
  );
}

