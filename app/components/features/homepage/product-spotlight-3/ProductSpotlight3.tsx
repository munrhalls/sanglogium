import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import data from "./prod.json";

export default function ProductSpotlight3() {
  return (
    <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <SpotlightHero image={data.imageUrl} tier="premium" />
      <SpotlightDetails 
        data={data} 
        accentColor="text-accent-500" 
        buttonClass="bg-accent-500 text-brand-900 hover:bg-accent-400"
      />
    </div>
  );
}
