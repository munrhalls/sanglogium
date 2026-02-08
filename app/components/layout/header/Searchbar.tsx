import Image from "next/image";
import magnifying_glass from "@/public/icons/magnifying_glass.svg";

export default function SearchBar() {
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
