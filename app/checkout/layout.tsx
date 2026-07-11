import "../globals.css";
import { Montserrat } from "next/font/google";
import BrandLogo from "@/app/components/layout/header/BrandLogo";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";
import { SpeedInsights } from "@vercel/speed-insights/next";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col bg-brand-800 text-brand-100 font-sans">
        <GoogleAnalytics />
        {/* Minimal checkout header */}
        <header className="flex h-[var(--mobile-header-h)] shrink-0 items-center justify-center border-b border-white/5 bg-brand-900 lg:h-[var(--desktop-header-h)]">
          <BrandLogo />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      <SpeedInsights />
      </body>
    </html>
  );
}
