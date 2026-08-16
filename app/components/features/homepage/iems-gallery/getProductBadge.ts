import { IemProduct } from "./getIemProducts";

export function getProductBadge(product: IemProduct, index: number): string | undefined {
  const name = product.name.toLowerCase();

  if (name.includes("moondrop rays gaming")) {
    return "New Arrival";
  }

  if (name.includes("sennheiser ie 900")) {
    return "Bestseller";
  }

  if (index === 0) {
    return "New Arrival";
  }

  if (index === 7) {
    return "Bestseller";
  }

  return undefined;
}
