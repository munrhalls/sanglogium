// import Image from "next/image";
// import magnifying_glass from "@/public/icons/magnifying_glass.svg";

// for reference
//       colors: {
//         // 1. BRAND (Warmth & Void) - The core identity
//         brand: {
//           100: "#FEFCFB", // Paper White (Body Text)
//           200: "#FAEEE6", // Soft Highlight (Hover)
//           400: "#F6E3D5", // Peach Rose Base (Skin Tone)
//           700: "#151B1B", // The Void (Main Background)
//           800: "#0D0F0F", // Deep Void (Footer/Contrast)
//         },
//         // 2. SECONDARY (Structure) - The scaffolding
//         secondary: {
//           100: "#FCFCFC", // Card Background (Clean White)
//           300: "#E5E4E2", // Divider (Platinum Base)
//           600: "#5C5B5A", // Subtext (Readable Grey)
//         },
//         // 3. ACCENT (Action) - The Gold
//         accent: {
//           600: "#D4AF37", // Main Gold (Buttons/CTAs)
//           500: "#E5C158", // Optional Lighter Gold (Hover state)
//         },
//       },

// export default function SearchBar() {
//   return (
//     // TODO search bar should have slight shadow to create nice effect with the dark header - should also have a "focus" state where the shadow becomes more prominent and the background becomes lighter (e.g. brand-700) - should also have a "hover" state where the background becomes slightly lighter (e.g. brand-600) and the text becomes slightly brighter (e.g. brand-300) - should also have a "active" state where the background becomes even lighter (e.g. brand-500) and the text becomes even brighter (e.g. brand-100)  --- IGNORE ---
//     <div className="bg-secondary-300 flex h-[36px] w-full max-w-md items-center gap-4 rounded-full px-4 xl:max-w-xl">
//       {" "}
//       <Image
//         src={magnifying_glass}
//         alt=""
//         width={18}
//         height={18}
//         aria-hidden="true"
//       />
//       {/* TODO should have reasonable max length, about 300-400 chars, maybe 500 if e.g. someone pasted long product name / should also retain highlight on ctrl + a (selecting text - when text is selected, background and contrast font color - background should be brand-700 and contrast font color should be brand-400)  */}
//       <input
//         type="text"
//         placeholder="Search..."
//         className="text-brand-700 placeholder:text-secondary-600 w-full border-none bg-transparent outline-none"
//       />
//     </div>
//   );
// }

import Image from "next/image";
import magnifying_glass from "@/public/icons/magnifying_glass.svg";

export default function SearchBar() {
  // fatal flaw - when typing, the font is invisible until the input loses focus - this is because the text color is set to brand-100, which is the same as the background color of the input when it is focused - need to change the text color to something that has enough contrast with the background color when focused
  return (
    <form
      role="search"
      className="bg-secondary-300 focus-within:bg-brand-400 hover:bg-secondary-100 group flex h-[36px] w-full max-w-md items-center gap-4 rounded-full px-4 shadow-sm transition-all duration-300 ease-out focus-within:shadow-md xl:max-w-xl"
    >
      <Image
        src={magnifying_glass}
        alt=""
        width={18}
        height={18}
        aria-hidden="true"
        className="group-focus-within:text-brand-800 transition-all duration-300 group-focus-within:font-bold group-focus-within:brightness-0"
      />
      <input
        type="text"
        placeholder="Search..."
        maxLength={500}
        aria-label="Search"
        className="text-brand-700 placeholder:text-secondary-600 focus:placeholder:text-brand-800 group-focus-within:text-brand-700 selection:bg-brand-700 selection:text-brand-400 w-full border-none bg-transparent outline-none transition-colors duration-300"
      />
    </form>
  );
}
