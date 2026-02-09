import Image from "next/image";
import magnifying_glass from "@/public/icons/magnifying_glass.svg";

export default function SearchBar() {
  return (
    <form
      role="search"
      className="group hidden h-[36px] w-full items-center gap-4 rounded-full bg-secondary-300 px-4 shadow-sm transition-all duration-300 ease-out focus-within:bg-brand-400 focus-within:shadow-md hover:bg-secondary-100 sm:flex sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-xl"
    >
      <Image
        src={magnifying_glass}
        alt=""
        width={18}
        height={18}
        aria-hidden="true"
        className="transition-all duration-300 group-focus-within:font-bold group-focus-within:text-brand-800 group-focus-within:brightness-0"
      />
      <input
        type="text"
        placeholder="Search..."
        maxLength={500}
        aria-label="Search"
        className="w-full border-none bg-transparent text-brand-700 outline-none transition-colors duration-300 selection:bg-brand-700 selection:text-brand-400 placeholder:text-secondary-600 focus:placeholder:text-brand-800 group-focus-within:text-brand-700"
      />
    </form>
  );
}
