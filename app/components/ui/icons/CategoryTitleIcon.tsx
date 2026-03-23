"use client";
import { Microphone, WifiHigh, Plugs, Headset, SpeakerHigh, Headphones } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
const ROOT_CATEGORY_ICONS: Record<string, Icon> = {
  "studio-equipment": Microphone,
  "home-audio": WifiHigh,
  accessories: Plugs,
  "personal-audio": Headset,
  speakers: SpeakerHigh,
  headphones: Headphones,
};
export default function CategoryTitleIcon({ category }: { category: string }) {
  if (category === "on-sale") return null;
  const Icon = ROOT_CATEGORY_ICONS[category];
  return Icon ? (
    <div className="flex">
      <div className="hidden md:block mb-1">
        <Icon size={48} strokeWidth={3} />
      </div>
      <div className="md:hidden mb-1">
        <Icon size={14} strokeWidth={3} />
      </div>
    </div>
  ) : null;
}
