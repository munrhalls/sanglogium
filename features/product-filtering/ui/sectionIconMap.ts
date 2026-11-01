import type { IconType } from "react-icons";
import { FaBatteryFull, FaBluetoothB, FaGear, FaHeadphones, FaLayerGroup, FaMicrophone, FaPlug, FaRulerHorizontal, FaTag } from "react-icons/fa6";

// The icon each key of the closed list (schema/sectionIcons.ts) draws in the rail. A heading with no icon, or a key that is not here, gets the neutral icon.

const ICONS = new Map<string, IconType>([
  ["tag", FaTag],
  ["sound", FaHeadphones],
  ["plug", FaPlug],
  ["bluetooth", FaBluetoothB],
  ["battery", FaBatteryFull],
  ["microphone", FaMicrophone],
  ["ruler", FaRulerHorizontal],
  ["gear", FaGear],
]);

export const iconFor = (key: string): IconType => ICONS.get(key) ?? FaLayerGroup;
