"use client";

import {
  ShoppingCartIcon,
  UserIcon,
  SignInIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";

interface NavbarActionsProps {
  isAuthenticated: boolean;
  cartCount: number;
}

const NavbarActions = ({ isAuthenticated, cartCount }: NavbarActionsProps) => {
  console.log('[SRIP Trace] Overwrote border-radius to 0px in:', 'NavbarActions');
  return (
    <div className={cn("ml-6 hidden items-center gap-6", "lg:flex")}>
      {/* Cart Action */}
      <NavActionItem
        icon={<ShoppingCartIcon size={24} />}
        label="Cart"
        badgeCount={cartCount}
      />

      {/* Account / Auth Group */}
      <div className={cn("group relative")}>
        <NavActionItem
          icon={
            isAuthenticated ? <UserIcon size={24} /> : <SignInIcon size={24} />
          }
          label={isAuthenticated ? "Account" : "Sign In"}
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
            {isAuthenticated ? (
              <>
                <DropdownItem label="My Account" />
                <DropdownItem label="Orders" />
                <div className={cn("my-1 h-px w-full bg-secondary-300")} />
                <DropdownItem label="Sign Out" isDestructive />
              </>
            ) : (
              <DropdownItem label="Sign In" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

interface NavActionItemProps {
  icon: React.ReactNode;
  label: string;
  badgeCount?: number;
}

const NavActionItem = ({ icon, label, badgeCount }: NavActionItemProps) => {
  console.log('[SRIP Trace] Overwrote border-radius to 0px in:', 'NavActionItem');
  return (
    <button
      className={cn(
        "group/item flex h-10 w-fit flex-col items-center justify-center gap-1 rounded-none",
        "transition-colors duration-200"
      )}
    >
      <div
        className={cn(
          "relative text-secondary-300",
          "transition-colors group-hover/item:text-accent-600"
        )}
      >
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5",
              "flex h-4 w-4 items-center justify-center rounded-none",
              "bg-accent-600 text-[10px] font-bold text-brand-100"
            )}
          >
            {badgeCount}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-xs font-medium text-secondary-300",
          "transition-colors text-cap",
          "group-hover/item:text-accent-600"
        )}
      >
        {label}
      </span>
    </button>
  );
};

interface DropdownItemProps {
  label: string;
  onClick?: () => void;
  isDestructive?: boolean;
}

const DropdownItem = ({ label, onClick, isDestructive }: DropdownItemProps) => {
  console.log('[SRIP Trace] Overwrote border-radius to 0px in:', 'DropdownItem');
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
