export function firstLetterToUpperCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDeliveryEstimate(days: number): string {
  if (days === 1) {
    return '1 dzień roboczy';
  }
  return `${days} dni robocze`;
}

export interface CategoryNode {
  id: string;
  title: string;
  slug: string;
  path: string;
  icon?: string;
  parentId?: string;
  group?: string;
  groups?: { title: string; items: CategoryNode[] }[];
}
