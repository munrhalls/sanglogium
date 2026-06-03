"use client";
// import type { Metadata } from "next";
// import "@/app/globals.css";

// export const metadata: Metadata = {
//   title: "Sang logium",
//   description: "Sang logium audio shop studio",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
