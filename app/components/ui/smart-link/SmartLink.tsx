import Link from "next/link";

interface SmartLinkPayload {
  type: "product" | "sale" | "custom";
  product?: { slug?: string };
  sale?: { slug?: string };
  url?: string;
}

export const SmartLink = ({
  link,
  className,
  children,
}: {
  link: SmartLinkPayload;
  className?: string;
  children: React.ReactNode;
}) => {
  let href = "/";

  switch (link.type) {
    case "product":
      href = `/products/${link.product?.slug}`;
      break;
    case "sale":
      href = `/sales/${link.sale?.slug}`;
      break;
    case "custom":
      href = link.url || "/";
      break;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
