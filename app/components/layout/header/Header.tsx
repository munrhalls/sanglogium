// import { ShoppingCartIcon } from "@heroicons/react/24/outline";
// import logo from "@/public/logo.svg";
// import SearchForm from "../../features/search/SearchForm";
// import AuthenticationWrapper from "@/app/components/features/auth/AuthenticationWrapper";
import Image from "next/image";
import logo_desktop from "@/public/logo_desktop.svg";
import Searchbar from "./Searchbar";
import NavbarActions from "./NavbarActions";

export default function Header() {
  return (
    <header className="flex h-[64px] shrink-0 items-center justify-around gap-4 bg-brand-800">
      <Image src={logo_desktop} alt="Logo" height={32} width={184} priority />
      <Searchbar />
      <NavbarActions isAuthenticated={false} cartCount={0} />
    </header>
  );
}
