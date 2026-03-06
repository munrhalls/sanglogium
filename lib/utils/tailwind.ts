import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-1",
            "display-2",
            "h1",
            "h2",
            "h3",
            "h4",
            "body",
            "small",
            "cta-hero",
            "spotlight",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            { brand: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] },
            { secondary: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] },
            { accent: ["100", "200", "300", "400", "500", "600", "700", "800"] },
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
