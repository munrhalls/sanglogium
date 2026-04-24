/**
 * Gold Standard Examples - Sang-Logium
 *
 * This file demonstrates all coding conventions in one place.
 * Agents should reference this when implementing new features.
 * Rules defined in: AGENTS.md
 */

// ==========================================
// 1. SERVER COMPONENT (Default Pattern)
// ==========================================
// ✅ DO: Use Server Components for data fetching
// ✅ DO: Parallel data fetching with Promise.all()
// ❌ NEVER: Add "use client" to pages that just fetch data

// CORRECT EXAMPLE:
import { sanityClient } from '@/sanity/lib/client'
import { productQuery, relatedProductsQuery } from '@/sanity/lib/queries'
import type { SanityProduct } from '@/sanity/types'

interface ProductPageProps {
  params: { slug: string }
}

export async function ProductPage({ params }: ProductPageProps) {
  // ✅ Parallel data fetching - reduces waterfall
  const [product, relatedProducts] = await Promise.all([
    sanityClient.fetch<SanityProduct>(productQuery, { slug: params.slug }),
    sanityClient.fetch<SanityProduct[]>(relatedProductsQuery, { slug: params.slug }),
  ])

  // Prebuilt props pattern - pass to Client Component if needed
  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
    />
  )
}

// ❌ WRONG EXAMPLE (Don't do this):
// 'use client' // <- Unnecessary! This is just data fetching
// import { useEffect, useState } from 'react'
// export function ProductPage({ params }) {
//   const [product, setProduct] = useState(null)
//   useEffect(() => { // <- No! Use Server Component instead
//     fetchProduct(params.slug).then(setProduct)
//   }, [params.slug])
//   return <ProductDetail product={product} />
// }

// ==========================================
// 2. CLIENT COMPONENT (When Needed)
// ==========================================
// ✅ DO: Minimal 'use client' - only when interactivity required
// ✅ DO: Explicit error handling with try/catch
// ❌ NEVER: Use 'use client' for components that just display props

'use client'

import { useState } from 'react'
import { addToCart } from '@/app/actions/basket'

interface AddToCartButtonProps {
  productId: string
  stripePriceId: string
}

// CORRECT EXAMPLE:
export function AddToCartButton({ productId, stripePriceId }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    try {
      setLoading(true)
      setError(null)

      const result = await addToCart({
        productId,
        stripePriceId,
        quantity: 1
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to add to cart')
      }

      // Success handling
      showToast.success('Added to cart')
    } catch (err) {
      // ✅ Explicit error handling
      console.error('Failed to add to cart:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}

// ❌ WRONG EXAMPLE (Don't do this):
// 'use client'
// export function ProductCard({ product }) { // <- Just displays props, doesn't need 'use client'
//   return <div>{product.name}</div>
// }

// ==========================================
// 3. DATA FETCHING PATTERN (GROQ)
// ==========================================
// ✅ DO: GROQ queries in separate file (sanity/lib/queries.ts)
// ✅ DO: Use Typegen types from Sanity
// ✅ DO: Correct reference syntax: brand->name (NOT brand->{name})
// ❌ NEVER: Hardcode GROQ queries in components

// CORRECT EXAMPLE (in sanity/lib/queries.ts):
export const productQuery = `
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    // ✅ Correct reference syntax
    brand->{
      _id,
      name,
      slug
    },
    pricePln,
    "imageUrl": images[0].asset->url,
    catalogueLocationKeys
  }
`

// ❌ WRONG EXAMPLE (Don't do this):
// const query = `*[_type == "product"] { brand->{name} }` // <- Wrong! Use brand->name

// ==========================================
// 4. STYLING PATTERN (Tailwind)
// ==========================================
// ✅ DO: Tailwind utility classes ONLY
// ✅ DO: Scoped classes, no global CSS modifications
// ✅ DO: Use design tokens from tailwind.config.ts
// ❌ NEVER: Modify global CSS files

// CORRECT EXAMPLE:
interface ProductCardProps {
  name: string
  price: number
  imageUrl: string | null
}

export function ProductCard({ name, price, imageUrl }: ProductCardProps) {
  return (
    // ✅ Scoped Tailwind utilities only
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover rounded-md"
        />
      )}
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      <p className="text-base text-gray-700">{price} PLN</p>
    </div>
  )
}

// ❌ WRONG EXAMPLE (Don't do this):
// // globals.css - DON'T ADD ARBITRARY CSS
// .product-card { custom styles... }
//
// // Component using global CSS
// export function ProductCard() {
//   return <div className="product-card">...</div> // <- No!
// }

// ==========================================
// 5. TESTING PATTERN (Vitest)
// ==========================================
// ✅ DO: Vitest (NOT Jest)
// ✅ DO: Import from source, not copy logic
// ✅ DO: Test behavior, not implementation
// ❌ NEVER: Copy implementation into test files

// CORRECT EXAMPLE:
import { describe, it, expect } from 'vitest'
import { calculateBasketStatus } from '@/lib/checkout/basketStatus' // <- Import from source!

describe('calculateBasketStatus', () => {
  it('should return "empty" when any product has 0 reserved quantity', () => {
    const basket = {
      products: [
        { reservedQuantity: 0, requestedQuantity: 2 }
      ]
    }

    // ✅ Test behavior/result, not implementation
    expect(calculateBasketStatus(basket)).toBe('empty')
  })

  it('should return "full" when all products have full reservation', () => {
    const basket = {
      products: [
        { reservedQuantity: 2, requestedQuantity: 2 }
      ]
    }

    expect(calculateBasketStatus(basket)).toBe('full')
  })
})

// ❌ WRONG EXAMPLE (Don't do this):
// import { describe, it, expect } from 'vitest'
//
// // ❌ Copying implementation into test!
// function calculateBasketStatus(basket) {
//   return basket.products.some(p => p.reservedQuantity === 0) ? 'empty' : 'full'
// }
//
// describe('basket status', () => {
//   it('works', () => {
//     expect(calculateBasketStatus({ products: [] })).toBe('full')
//   })
// })

// ==========================================
// 6. STATE MANAGEMENT (Zustand/React Context)
// ==========================================
// ✅ DO: Use React Context for prop injection (NOT cloneElement)
// ✅ DO: Null checks for useQueryState (returns undefined during hydration)
// ❌ NEVER: Use cloneElement for prop injection

// CORRECT EXAMPLE (React Context):
import { createContext, useContext, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' })

export function ThemeProvider({ children, theme }: { children: ReactNode; theme: 'light' | 'dark' }) {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

// ❌ WRONG EXAMPLE (Don't do this):
// import { cloneElement, Children } from 'react'
// export function ThemeProvider({ children, theme }) {
//   return Children.map(children, child =>
//     cloneElement(child, { theme }) // <- NEVER do this! Use Context instead
//   )
// }

// ==========================================
// 7. URL STATE (nuqs/useQueryState)
// ==========================================
// ✅ DO: Add null checks for useQueryState
// ✅ DO: Use default values or optional chaining
// ❌ NEVER: Assume useQueryState returns array immediately

// CORRECT EXAMPLE:
// import { useQueryState } from 'nuqs'
//
// export function FilterComponent() {
//   // ✅ Pattern 1: Destructure with default
//   const [filters = []] = useQueryState('filters', { defaultValue: [] })
//
//   // ✅ Pattern 2: Null check with fallback
//   const [filters] = useQueryState('filters')
//   const safeFilters = filters || []
//
//   return (
//     <div>
//       {safeFilters.map(filter => (
//         <FilterChip key={filter} value={filter} />
//       ))}
//     </div>
//   )
// }

// ❌ WRONG EXAMPLE (Don't do this):
// const [filters] = useQueryState('filters')
// return (
//   <div>
//     {filters.map(f => ...)} // <- CRASH! filters undefined during hydration
//   </div>
// )

// ==========================================
// 8. TYPE SAFETY (Sanity Typegen)
// ==========================================
// ✅ DO: Use Typegen outputs as source of truth
// ✅ DO: Use Pick<> pattern for subset types
// ✅ DO: Run `npm run typegen` before type changes
// ❌ NEVER: Manually define types that conflict with Sanity types

// CORRECT EXAMPLE:
import type { SanityProduct } from '@/sanity/types' // <- Typegen output

// ✅ Pick pattern for subset types
type ProductCardData = Pick<SanityProduct, '_id' | 'name' | 'pricePln' | 'images'>

export function ProductCard({ product }: { product: ProductCardData }) {
  return <div>{product.name}</div>
}

// ❌ WRONG EXAMPLE (Don't do this):
// // Manually defining type that may conflict with Sanity schema
// interface Product { // <- Don't do this!
//   id: string  // <- Sanity uses _id
//   name: string
//   price: number  // <- Sanity uses pricePln
// }

// ==========================================
// Helper Types (for TypeScript completeness)
// ==========================================

// These would come from actual project imports
declare function showToast(options: { success: string } | { error: string }): void
declare function showToastSuccess(message: string): void

// Mock types for file compilation
type BasketStatus = 'empty' | 'decremented' | 'full'

// Placeholder for actual implementation imports
declare function calculateBasketStatus(basket: unknown): BasketStatus

interface ProductDetailProps {
  product: unknown
  relatedProducts: unknown[]
}

function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  return null // Placeholder
}

function FilterChip({ value }: { value: string }) {
  return null // Placeholder
}
