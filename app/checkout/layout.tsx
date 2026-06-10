import "../globals.css";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import BrandLogo from "@/app/components/layout/header/BrandLogo";

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
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
        {/* Minimal checkout header */}
        <header className="flex h-[var(--mobile-header-h)] shrink-0 items-center justify-center border-b border-white/5 bg-brand-900 lg:h-[var(--desktop-header-h)]">
          <BrandLogo />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
