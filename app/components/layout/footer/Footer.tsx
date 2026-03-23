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
        "grid h-auto content-start justify-center",
        "p-2",
        "text-white-600 text-xl font-black"
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
        "relative grid grid-rows-[auto_4rem_1fr]",
        "bg-brand-800 text-brand-100",
        "px-4 pt-8"
      )}
    >
      {}
      <div
        className={cn(
          "mx-auto grid w-full gap-6 py-8",
          "justify-content-center",
          "max-w-[600px]",
          "md:max-w-[1400px] md:grid-cols-4"
        )}
      >
        <div className={cn("grid content-start gap-4")}>
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
        </div>
        <div className={cn("grid content-start gap-4")}>
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
        </div>
        <div className={cn("grid content-start gap-4")}>
          <ColTitle title="ABOUT US" />
          <ul className={cn("grid justify-center gap-2")}>
            <li>
              <Link className={cn("text-xl")} href="/support/privacy-policy">
                About Us
              </Link>
            </li>
            <li>
              <Link className={cn("text-xl")} href="/support/privacy-policy">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link className={cn("text-xl")} href="/support/privacy-policy">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div
          className={cn(
            "grid justify-center gap-1",
            "md:col-span-3 md:col-start-1 md:grid-rows-[4rem_1fr]"
          )}
        >
          <ColTitle title="FIND US" />
          <ul
            className={cn(
              "grid grid-cols-2 grid-rows-2 justify-center gap-12",
              "md:grid-flow-col md:grid-rows-1"
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
            "grid content-start justify-center gap-4",
            "md:justify-content-start",
            "md:col-span-1 md:col-start-4",
            "md:row-span-2 md:row-start-1"
          )}
        >
          <ColTitle title="BEST BRANDS" />
          <ul className={cn("grid justify-center gap-2")}>
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
                  href={`/brands/${brand.name.toLowerCase().replace(" ", "-")}`}
                >
                  <span>{brand.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
