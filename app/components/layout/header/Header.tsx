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
    <header className="bg-brand-900 fixed left-0 right-0 top-0 z-50 flex h-[64px] shrink-0 items-center justify-around gap-4">
      <Image src={logo_desktop} alt="Logo" height={32} width={184} priority />
      <Searchbar />
      <NavbarActions isAuthenticated={false} cartCount={0} />
    </header>
  );
}
