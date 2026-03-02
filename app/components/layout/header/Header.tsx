import { cn } from "@/lib/utils/tailwind";
import BrandLogo from "./BrandLogo";
import Searchbar from "./Searchbar";
import NavbarActions from "./NavbarActions";

export default function Header() {
  return (
    <header
      className={cn(
        "sticky left-0 right-0 top-0 z-50",
        "flex h-[var(--mobile-header-h)] shrink-0 items-center justify-around gap-4",
        "bg-brand-900 text-cap"
      )}
    >
      <BrandLogo />
      <Searchbar />
      <NavbarActions isAuthenticated={false} cartCount={0} />
    </header>
  );
}
