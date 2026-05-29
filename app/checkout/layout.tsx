import "../globals.css";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import CheckoutProvider from "./CheckoutProvider.client";

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
        <CheckoutProvider>
          {/* Minimal checkout header */}
          <header className="flex h-[var(--mobile-header-h)] shrink-0 items-center justify-center border-b border-white/5 bg-brand-900 lg:h-[var(--desktop-header-h)]">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-orbit-white.svg"
                alt="Sang Logium"
                width={120}
                height={28}
                priority
              />
            </Link>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-8">
            <div className="mx-auto max-w-4xl">
              {children}
            </div>
          </main>
        </CheckoutProvider>
      </body>
    </html>
  );
}
