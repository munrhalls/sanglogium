"use client";

import {
  ShoppingCartIcon,
  UserIcon,
  SignInIcon,
  SignOut,
} from "@phosphor-icons/react";

interface NavbarActionsProps {
  isAuthenticated: boolean;
  cartCount: number;
}

const NavbarActions = ({ isAuthenticated, cartCount }: NavbarActionsProps) => {
  return (
    <div className="ml-6 hidden items-center gap-6 lg:flex">
      {/* Cart Action */}
      <NavActionItem
        icon={<ShoppingCartIcon size={24} />}
        label="Cart"
        badgeCount={cartCount}
      />

      {/* Account / Auth Group */}
      <div className="group relative">
        <NavActionItem
          icon={
            isAuthenticated ? <UserIcon size={24} /> : <SignInIcon size={24} />
          }
          label={isAuthenticated ? "Account" : "Sign In"}
        />

        {/* Dropdown Menu */}
        <div className="invisible absolute right-0 top-full w-48 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
          <div className="border-secondary-300 bg-secondary-100 flex flex-col rounded-md border py-1 shadow-lg">
            {isAuthenticated ? (
              <>
                <DropdownItem label="My Account" />
                <DropdownItem label="Orders" />
                <div className="bg-secondary-300 my-1 h-px w-full" />
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
  return (
    <button className="group/item flex h-10 w-fit flex-col items-center justify-center gap-1 transition-colors duration-200">
      <div className="text-secondary-300 group-hover/item:text-accent-600 relative transition-colors">
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="bg-accent-600 text-brand-100 absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
            {badgeCount}
          </span>
        )}
      </div>
      <span className="text-cap text-secondary-300 group-hover/item:text-accent-600 text-xs font-medium transition-colors">
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
  return (
    <button
      onClick={onClick}
      className={`text-cap hover:bg-brand-200 w-full px-4 py-2 text-left text-sm transition-colors ${
        isDestructive ? "text-brand-400 opacity-75" : "text-brand-400"
      }`}
    >
      {label}
    </button>
  );
};

export default NavbarActions;
