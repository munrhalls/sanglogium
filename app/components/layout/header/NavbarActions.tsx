"use client";

import Link from "next/link";
import {
  UserIcon,
  SignInIcon,
  UserPlus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { NavActionItem } from "@/app/components/ui/NavActionItem";
import { BasketButton } from "@/app/components/features/basket/BasketButton";
import { signOut } from "@/features/auth";

interface NavbarActionsProps {
  isAuthenticated: boolean;
  cartCount?: number; // Kept for compatibility but prioritized store
}

const NavbarActions = ({ isAuthenticated }: NavbarActionsProps) => {
  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className={cn("ml-6 hidden items-center gap-6", "lg:flex")}>
      {/* Cart Action */}
      <BasketButton />

      {/* Account / Auth Group */}
      {isAuthenticated ? (
        <div className={cn("group relative")}>
          <NavActionItem
            icon={<UserIcon size={24} />}
            label="Account"
          />

          {/* Dropdown Menu */}
          <div
            className={cn(
              "invisible absolute right-0 top-full w-48 pt-2",
              "opacity-0 transition-all duration-200",
              "group-hover:visible group-hover:opacity-100"
            )}
          >
            <div
              className={cn(
                "flex flex-col rounded-none border py-1 shadow-lg",
                "border-secondary-300 bg-secondary-100"
              )}
            >
              <Link href="/account" className="block w-full">
                <DropdownItem label="My Account" />
              </Link>
              <Link href="/account/orders" className="block w-full">
                <DropdownItem label="Orders" />
              </Link>
              <div className={cn("my-1 h-px w-full bg-secondary-300")} />
              <DropdownItem label="Sign Out" isDestructive onClick={handleSignOut} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <NavActionItem
            icon={<SignInIcon size={24} />}
            label="Sign In"
            href="/sign-in"
          />
          <NavActionItem
            icon={<UserPlus size={24} />}
            label="Sign Up"
            href="/sign-up"
          />
        </>
      )}
    </div>
  );
};

// --- Sub-components ---

interface DropdownItemProps {
  label: string;
  onClick?: () => void;
  isDestructive?: boolean;
}

const DropdownItem = ({ label, onClick, isDestructive }: DropdownItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2 text-left text-sm rounded-none",
        "transition-colors text-cap hover:bg-brand-200",
        isDestructive ? "text-brand-400 opacity-75" : "text-brand-400"
      )}
    >
      {label}
    </button>
  );
};

export default NavbarActions;
