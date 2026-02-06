import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://sang-logium.com",
  },
  title: "Sang Logium Audio Shop",

  description: "E-commerce store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});
