import { useQueryState, parseAsString } from "nuqs";

export function useDrawer() {
  const [drawer, setDrawer] = useQueryState(
    "drawer",
    parseAsString.withOptions({ history: "push" })
  );

  return {
    drawer,
    isOpen: !!drawer,
    openDrawer: (value: string) => setDrawer(value),
    closeDrawer: () => setDrawer(null),
  };
}
