// import {
//   FaFacebook,
//   FaInstagram,
//   FaPinterest,
//   FaTwitter,
//   FaYoutube,
// } from "react-icons/fa";
import Link from "next/link";
import { cn } from "@/lib/utils/tailwind";

const ColTitle = function ({ title }: { title: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        "type-overline text-brand-400"
      )}
    >
      <h1>{title}</h1>
    </div>
  );
};
export default function Footer() {
  return (
    <footer
      className={cn(
        "w-full bg-brand-800 text-brand-100",
        "border-t border-border-secondary"
      )}
    >
      {}
      <div
        className={cn(
          "mx-auto w-full max-w-content px-4 md:px-8",
          "py-12 md:py-16 lg:py-20",
          "grid grid-cols-1 gap-8 lg:gap-12",
          "md:grid-cols-4"
        )}
      >
        {/* TODO: Create pages for these links - commenting out to prevent 404s on production */}
        {/* <div className={cn("grid content-start gap-4")}>
          <ColTitle title="PURCHASES" />
          <ul className={cn("grid justify-center gap-2")}>
            <li>
              <Link className={cn("text-xl")} href="/purchases/order-status">
                Order Status
              </Link>
            </li>
            <li>
              <Link className={cn("text-xl")} href="/purchases/shipping-policy">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link className={cn("text-xl")} href="/purchases/returns">
                Returns Policy
              </Link>
            </li>
          </ul>
        </div> */}
        {/* TODO: Create pages for these links - commenting out to prevent 404s on production */}
        {/* <div className={cn("grid content-start gap-4")}>
          <ColTitle title="SUPPORT" />
          <ul className={cn("grid justify-center gap-2")}>
            <li>
              <Link className={cn("text-xl")} href="/support/contact">
                Contact Us
              </Link>
            </li>
            <li>
              <Link className={cn("text-xl")} href="/support/faq">
                FAQ
              </Link>
            </li>
          </ul>
        </div> */}
        <div className={cn("flex flex-col gap-4", "md:col-span-1 md:row-start-1")}>
          <ColTitle title="ABOUT US" />
          <ul className={cn("flex flex-col gap-2")}>
            {/* TODO: Create pages for these links */}
            {/* <li>
              <Link className={cn("text-xl")} href="/support/about-us">
                About Us
              </Link>
            </li>
            <li>
              <Link className={cn("text-xl")} href="/support/terms-of-service">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link className={cn("text-xl")} href="/support/privacy-policy">
                Privacy Policy
              </Link>
            </li> */}
          </ul>
        </div>
        <div
          className={cn(
            "flex flex-col gap-4",
            "md:col-span-3 md:col-start-1 md:row-start-2"
          )}
        >
          <ColTitle title="FIND US" />
          <ul
            className={cn(
              "flex flex-wrap gap-6"
            )}
          >
            {/* <li>
              <FaTwitter size={32} />
            </li>
            <li>
              <FaFacebook size={32} />
            </li>
            <li>
              <FaInstagram size={32} />
            </li>
            <li>
              <FaPinterest size={32} />
            </li>
            <li>
              <FaYoutube size={32} />
            </li> */}
          </ul>
        </div>
        <div
          className={cn(
            "flex flex-col gap-4",
            "md:col-span-1 md:col-start-4",
            "md:row-span-2 md:row-start-1"
          )}
        >
          <ColTitle title="BEST BRANDS" />
          {/* <ul className={cn("grid justify-center gap-2")}>
            {[
              { name: "Sennheiser" },
              { name: "Sony" },
              { name: "Bose" },
              { name: "AKG" },
              { name: "Audio-Technica" },
              { name: "Beyerdynamic" },
              { name: "DPA" },
              { name: "Dynaudio" },
              { name: "Focal" },
              { name: "Genelec" },
              { name: "JBL" },
              { name: "Klipsch" },
              { name: "Mackie" },
              { name: "Pioneer" },
              { name: "Presonus" },
              { name: "Roland" },
              { name: "Shure" },
              { name: "Universal Audio" },
            ].map((brand) => (
              <li key={brand.name} className={cn("text-center")}>
                <Link
                  className={cn("grid place-content-center text-xl")}
                  href={`/brand/${brand.name.toLowerCase().replace(" ", "-")}`}
                >
                  <span>{brand.name}</span>
                </Link>
              </li>
            ))}
          </ul> */}
        </div>
      </div>
    </footer>
  );
}
