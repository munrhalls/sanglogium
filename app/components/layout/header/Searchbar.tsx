import Image from "next/image";
import magnifying_glass from "@/public/icons/magnifying_glass.svg";

export default function SearchBar() {
  return (
    <div className="bg-secondary-300 flex h-10 w-full min-w-[248px] max-w-[600px] items-center gap-2 rounded-[80px] px-4">
      <Image
        src={magnifying_glass}
        alt=""
        width={24}
        height={24}
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
