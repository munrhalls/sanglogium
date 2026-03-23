"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";

export default function ExitButton() {
  const router = useRouter();

  const handleExit = () => {
    router.back();
  };

  return (
    <button
      onClick={handleExit}
      className="mx-auto flex w-8 flex-col items-center rounded-lg bg-black py-2 font-medium text-white transition-colors hover:bg-gray-800 sm:w-10 sm:py-3"
    >
      <SignOut size={16} />
    </button>
  );
}
