import { CMSBasketItem } from './parseBasketItems'

export function separateByAvailability(
  basketItems: CMSBasketItem[]
): { available: CMSBasketItem[]; unavailable: CMSBasketItem[] } {
  return basketItems.reduce(
    (acc, item) => {
      if (item.availableStock > 0) {
        acc.available.push(item)
      } else {
        acc.unavailable.push(item)
      }
      return acc
    },
    { available: [] as CMSBasketItem[], unavailable: [] as CMSBasketItem[] }
  )
}
