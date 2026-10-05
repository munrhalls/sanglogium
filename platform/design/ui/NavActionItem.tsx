import Link from "next/link";
import { cn } from "@/platform/utils/tailwind";

interface NavActionItemProps {
  icon: React.ReactNode;
  label: string;
  badgeCount?: number;
  href?: string;
}

const NavActionItem = ({ icon, label, badgeCount, href }: NavActionItemProps) => {
  const className = cn(
    "group/item flex h-10 w-fit flex-col items-center justify-center gap-1 rounded-none",
    "transition-colors duration-200"
  );

  const content = (
    <>
      <div
        className={cn(
          "relative text-secondary-300",
          "transition-colors group-hover/item:text-accent-600"
        )}
      >
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span
            data-testid="basket-badge"
            className={cn(
              "absolute -right-1.5 -top-1.5",
              "flex h-4 w-4 items-center justify-center rounded-none",
              "bg-brand-400 text-[10px] font-bold text-brand-900 rounded-[2px]"
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <button className={className}>{content}</button>;
};

export { NavActionItem };
