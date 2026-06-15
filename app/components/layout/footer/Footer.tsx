import { cn } from "@/lib/utils/tailwind";
import {
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
  FaCcApplePay,
} from "react-icons/fa6";
import Link from "next/link";
import NewsletterSignup from "@/app/components/features/newsletter/NewsletterSignup.client";

const SectionTitle = ({ title }: { title: string }) => (
  <div className={cn("type-overline", "text-brand-400")}>{title}</div>
);

const PlaceholderItem = ({ children }: { children: React.ReactNode }) => (
  <span className={cn("type-body", "cursor-default")}>{children}</span>
);

const SocialIcon = ({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => (
  <div
    aria-label={`Follow us on ${label}`}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-full",
      "bg-secondary-800 text-secondary-400",
      "type-caption",
      "transition-opacity duration-200 hover:opacity-70"
    )}
  >
    <Icon className="w-4 h-4" />
  </div>
);

export default function Footer() {
  const brands = [
    "Sennheiser",
    "Sony",
    "Bose",
    "AKG",
    "Audio-Technica",
    "Beyerdynamic",
    "DPA",
    "Dynaudio",
    "Focal",
    "Genelec",
    "JBL",
    "Klipsch",
    "Mackie",
    "Pioneer",
    "Presonus",
    "Roland",
    "Shure",
    "Universal Audio",
  ];

  return (
    <footer
      className={cn(
        "w-full bg-brand-800 text-brand-100",
        "border-t border-border-secondary"
      )}
    >
      <section
        className={cn(
          "mx-auto w-full max-w-content px-4 md:px-8",
          "pt-12 md:pt-16 lg:pt-20",
          "flex items-center justify-between gap-8",
          "pb-10 mb-10",
          "border-b border-border-secondary"
        )}
      >
        <div>
          <p className="type-overline">New Arrivals. Exclusive Deals.</p>
          <p className="type-caption text-text-caption mt-1">
            Subscribe and get 10% off your first order.
          </p>
        </div>
        <div className="max-w-[480px]">
          <NewsletterSignup />
        </div>
      </section>
      <div
        className={cn(
          "mx-auto w-full max-w-content px-4 md:px-8",
          "py-12 md:py-16 lg:py-20",
          "grid grid-cols-1 gap-8 lg:gap-12",
          "md:grid-cols-4"
        )}
      >
        {/* PURCHASES */}
        <div
          className={cn("flex flex-col gap-4", "md:col-span-1 md:row-start-1")}
        >
          <SectionTitle title="PURCHASES" />
          <ul className={cn("flex flex-col gap-2")}>
            <li>
              <PlaceholderItem>Order Status</PlaceholderItem>
            </li>
            <li>
              <PlaceholderItem>Shipping Policy</PlaceholderItem>
            </li>
            <li>
              <PlaceholderItem>Returns Policy</PlaceholderItem>
            </li>
            <li>
              <Link href="/account" className={cn("type-body", "cursor-default")}>
                My Account
              </Link>
            </li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div
          className={cn("flex flex-col gap-4", "md:col-span-1 md:row-start-1")}
        >
          <SectionTitle title="SUPPORT" />
          <ul className={cn("flex flex-col gap-2")}>
            <li>
              <PlaceholderItem>Contact Us</PlaceholderItem>
            </li>
            <li>
              <PlaceholderItem>FAQ</PlaceholderItem>
            </li>
          </ul>
        </div>

        {/* ABOUT US */}
        <div
          className={cn(
            "flex flex-col gap-4",
            "md:col-span-1 md:row-start-1"
          )}
        >
          <SectionTitle title="ABOUT US" />
          <ul className={cn("flex flex-col gap-2")}>
            <li>
              <PlaceholderItem>About Us</PlaceholderItem>
            </li>
            <li>
              <PlaceholderItem>Terms of Service</PlaceholderItem>
            </li>
            <li>
              <PlaceholderItem>Privacy Policy</PlaceholderItem>
            </li>
          </ul>
        </div>

        {/* FIND US */}
        <div
          className={cn(
            "flex flex-col gap-4",
            "md:col-span-3 md:col-start-1 md:row-start-2"
          )}
        >
          <SectionTitle title="FIND US" />
          <ul className={cn("flex flex-wrap gap-4")}>
            <li>
              <SocialIcon icon={FaXTwitter} label="X" />
            </li>
            <li>
              <SocialIcon icon={FaFacebookF} label="Facebook" />
            </li>
            <li>
              <SocialIcon icon={FaInstagram} label="Instagram" />
            </li>
            <li>
              <SocialIcon icon={FaPinterestP} label="Pinterest" />
            </li>
            <li>
              <SocialIcon icon={FaYoutube} label="YouTube" />
            </li>
          </ul>
        </div>

        {/* BEST BRANDS */}
        <div
          className={cn(
            "flex flex-col gap-4",
            "md:col-span-1 md:col-start-4",
            "md:row-span-2 md:row-start-1"
          )}
        >
          <SectionTitle title="BEST BRANDS" />
          <ul className={cn("columns-2 gap-x-6 gap-y-2")}>
            {brands.map((brand) => (
              <li key={brand} className="break-inside-avoid">
                <PlaceholderItem>{brand}</PlaceholderItem>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className={cn(
          "mx-auto w-full max-w-content px-4 md:px-8",
          "flex flex-col sm:flex-row items-center justify-between gap-4",
          "border-t border-border-secondary",
          "py-6"
        )}
      >
        <p className={cn("type-caption", "text-text-caption")}>
          &copy; {new Date().getFullYear()} Sang Logium. All Rights Reserved.
        </p>
        <div className={cn("flex items-center gap-3")}>
          <span className={cn("type-overline", "text-brand-400", "mr-1")}>
            We Accept
          </span>
          <FaCcVisa className="h-7 w-auto text-secondary-400" aria-label="Visa" />
          <FaCcMastercard className="h-7 w-auto text-secondary-400" aria-label="Mastercard" />
          <FaCcAmex className="h-7 w-auto text-secondary-400" aria-label="American Express" />
          <FaCcPaypal className="h-7 w-auto text-secondary-400" aria-label="PayPal" />
          <FaCcApplePay className="h-7 w-auto text-secondary-400" aria-label="Apple Pay" />
        </div>
      </div>
    </footer>
  );
}

