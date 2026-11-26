import { Inter, DM_Serif_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.className} antialiased ${dmSerifDisplay.variable} h-full w-full`}
    >
      <body>{children}</body>
    </html>
  );
}
