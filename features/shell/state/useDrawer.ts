import { useQueryState } from "nuqs";
import { drawerParam } from "@/features/shell/url/drawerParam";

export function useDrawer() {
  const [drawer, setDrawer] = useQueryState(
    "drawer",
    drawerParam
  );

  return {
    drawer,
    isOpen: !!drawer,
    openDrawer: (value: string) => setDrawer(value),
    closeDrawer: () => setDrawer(null),
  };
}
