// import { ShoppingCartIcon } from "@heroicons/react/24/outline";
// import logo from "@/public/logo.svg";
// import SearchForm from "../../features/search/SearchForm";
// import AuthenticationWrapper from "@/app/components/features/auth/AuthenticationWrapper";
import BrandLogo from './BrandLogo'
import Searchbar from "./Searchbar";
import NavbarActions from "./NavbarActions";

export default function Header() {
  return (
    <header className="bg-brand-900 fixed left-0 right-0 top-0 z-50 flex h-[var(--mobile-header-h)] md:h-[var(--header-h)] shrink-0 items-center justify-around gap-4 text-cap">
      <BrandLogo />
      <Searchbar />
      <NavbarActions isAuthenticated={false} cartCount={0} />
    </header>
  );
}
