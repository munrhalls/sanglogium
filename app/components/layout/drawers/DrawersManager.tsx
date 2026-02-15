"use client";
import { cn } from "@/lib/utils/tailwind";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import MobileCatalogue from "@/app/components/layout/mobile/MobileCatalogue";
// TODO
// animation IN works properly but OUT needs to be fixed - currently just jumps out of view

export default function DrawerManager() {
  const { drawer, isOpen, closeDrawer } = useDrawer();

  return (
    <div
      className={cn(
        "w-[calc(100vw] fixed bottom-14 right-0 top-[var(--header-h)] z-50 h-[calc(100vh-3.5rem)] overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out lg:w-1/4",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* // TODO that button cannot be there as it makes styling difficult inside
      content components */}
      {/* TODO pass closeDrawer to content components...that requires they all accept new props..would want to avoid that, too - instead, just import closeDrawer in each content component*/}
      {/* <button onClick={closeDrawer} className="p-4">
        X
      </button> */}
      {drawer === "catalogue" && <MobileCatalogue />}
    </div>
  );
}
