import { cn } from "@/lib/utils/tailwind";

const SectionTitle = ({ title }: { title: string }) => (
  <div className={cn("type-overline", "text-brand-400")}>{title}</div>
);

const PlaceholderItem = ({ children }: { children: React.ReactNode }) => (
  <span className={cn("type-body", "cursor-default")}>{children}</span>
);

const SocialIconPlaceholder = ({ label }: { label: string }) => (
  <div
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-full",
      "bg-secondary-800 text-secondary-400",
      "type-caption"
    )}
  >
    {label}
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
              <SocialIconPlaceholder label="X" />
            </li>
            <li>
              <SocialIconPlaceholder label="FB" />
            </li>
            <li>
              <SocialIconPlaceholder label="IG" />
            </li>
            <li>
              <SocialIconPlaceholder label="PI" />
            </li>
            <li>
              <SocialIconPlaceholder label="YT" />
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
          <ul className={cn("flex flex-col gap-2")}>
            {brands.map((brand) => (
              <li key={brand}>
                <PlaceholderItem>{brand}</PlaceholderItem>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

