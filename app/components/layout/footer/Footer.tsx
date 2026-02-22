import {
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";
const ColTitle = function ({ title }: { title: string }) {
  return (
    <div className="text-white-600 grid h-auto content-start justify-center p-2 text-xl font-black">
      <h1>{title}</h1>
    </div>
  );
};
export default function Footer() {
  return (
    <footer className="relative grid grid-rows-[auto_4rem_1fr] bg-brand-800 px-4 pt-8 text-brand-100">
      {}
      <div className="justify-content-center mx-auto grid w-full max-w-[600px] gap-6 py-8 md:max-w-[1400px] md:grid-cols-4">
        <div className="grid content-start gap-4">
          <ColTitle title="PURCHASES" />
          <ul className="grid justify-center gap-2">
            <li>
              <Link className="text-xl" href="/purchases/order-status">
                Order Status
              </Link>
            </li>
            <li>
              <Link className="text-xl" href="/purchases/shipping-policy">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link className="text-xl" href="/purchases/returns">
                Returns Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="grid content-start gap-4">
          <ColTitle title="SUPPORT" />
          <ul className="grid justify-center gap-2">
            <li>
              <Link className="text-xl" href="/support/contact">
                Contact Us
              </Link>
            </li>
            <li>
              <Link className="text-xl" href="/support/faq">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div className="grid content-start gap-4">
          <ColTitle title="ABOUT US" />
          <ul className="grid justify-center gap-2">
            <li>
              <Link className="text-xl" href="/support/privacy-policy">
                About Us
              </Link>
            </li>
            <li>
              <Link className="text-xl" href="/support/privacy-policy">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link className="text-xl" href="/support/privacy-policy">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="grid justify-center gap-1 md:col-span-3 md:col-start-1 md:grid-rows-[4rem_1fr]">
          <ColTitle title="FIND US" />
          <ul className="grid grid-cols-2 grid-rows-2 justify-center gap-12 md:grid-flow-col md:grid-rows-1">
            <li>
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
            </li>
          </ul>
        </div>
        <div className="md:justify-content-start grid content-start justify-center gap-4 md:col-span-1 md:col-start-4 md:row-span-2 md:row-start-1">
          <ColTitle title="BEST BRANDS" />
          <ul className="grid justify-center gap-2">
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
              <li key={brand.name} className="text-center">
                <Link
                  className="grid place-content-center text-xl"
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
