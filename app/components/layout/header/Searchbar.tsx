import Image from "next/image";
import magnifying_glass from "@/public/icons/magnifying_glass.svg";

export default function SearchBar() {
  return (
    <div className="bg-secondary-300 flex h-[36px] w-full max-w-md items-center gap-4 rounded-full px-4 xl:max-w-xl">
      {" "}
      <Image
        src={magnifying_glass}
        alt=""
        width={18}
        height={18}
        aria-hidden="true"
      />
      <input
        type="text"
        placeholder="Search..."
        className="text-brand-700 placeholder:text-secondary-600 w-full border-none bg-transparent outline-none"
      />
    </div>
  );
}
