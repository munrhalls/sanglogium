import Image from "next/image";
import magnifying_glass from "@/public/icons/magnifying_glass.svg";
import { cn } from "@/lib/utils/tailwind";

export default function SearchBar() {
  return (
    <form
      role="search"
      className={cn(
        "group hidden h-[24px] w-full items-center gap-4 rounded-none px-4 lg:h-[36px]",
        "bg-secondary-300 shadow-sm transition-all duration-300 ease-out",
        "hover:bg-secondary-100",
        "focus-within:bg-brand-400 focus-within:shadow-md",
        "sm:flex sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-xl"
      )}
    >
      <Image
        src={magnifying_glass}
        alt=""
        width={12}
        height={12}
        aria-hidden="true"
        className={cn(
          "transition-all duration-300",
          "group-focus-within:font-bold group-focus-within:text-brand-800 group-focus-within:brightness-0"
        )}
      />
      <input
        type="text"
        placeholder="Search..."
        maxLength={500}
        aria-label="Search"
        className={cn(
          "w-full border-none bg-transparent outline-none rounded-none",
          "text-body text-brand-700 transition-colors duration-300",
          "selection:bg-brand-700 selection:text-brand-400",
          "placeholder:text-secondary-600 focus:placeholder:text-brand-800",
          "group-focus-within:text-brand-700"
        )}
      />
    </form>
  );
}
