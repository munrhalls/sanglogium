import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketButton } from '../../../components/features/basket/BasketButton'
import { BasketControls } from '../../../components/features/basket/BasketControls'
import { FeaturedCard } from '../../../app/components/features/homepage/featured/Featured'
import IemCard from '../../../app/components/features/homepage/iems-gallery/IemCard'
import DacCard from '../../../app/components/features/homepage/dacs/DacCard'
import AccessoryCard from '../../../app/components/features/homepage/accessories/AccessoryCard'
import { ProductCard } from '../../../app/components/features/products/ProductCard'
import { ProductInfo } from '../../../app/components/features/products/ProductInfo'

// Mock next/link to avoid complex router setup
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// Mock next-sanity/image
vi.mock('next-sanity/image', () => ({
  Image: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock urlFor to handle simple URL strings
vi.mock('@/sanity-config/lib/image', () => ({
  urlFor: (source: any) => ({
    width: () => ({
      height: () => ({
        auto: () => ({
          quality: () => ({
            url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
          }),
          url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
        }),
        url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
      }),
      auto: () => ({
        quality: () => ({
          url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
        }),
        url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
      }),
      url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
    }),
    auto: () => ({
      quality: () => ({
        url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
      }),
      url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
    }),
    url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
  }),
}))

describe('Basket Controls Integration Across App', () => {

  describe('Navigation Components', () => {
    describe('BasketButton', () => {
      it('navigates to /basket page on click', () => {
        render(<BasketButton />)
        const button = screen.getByTestId('basket-button')
        expect(button).toHaveAttribute('href', '/basket')
      })
    })
  })

  describe('Home Page Product Cards', () => {
    const mockFeaturedProduct = {
      _id: 'product-1',
      name: 'Test Product',
      slug: 'test-product',
      brand: { name: 'Test Brand', _id: 'brand-1', slug: 'test-brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      productPromo: 'Featured',
      image: { asset: { url: 'https://example.com/image.jpg' } },
    }

    const mockIemProduct = {
      _id: 'product-2',
      name: 'Test Product',
      slug: 'test-product',
      brand: { name: 'Test Brand', _id: 'brand-1', slug: 'test-brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      imageUrl: 'https://example.com/image.jpg',
      image: { asset: { url: 'https://example.com/image.jpg' } },
    }

    const mockAccessoryProduct = {
      _id: 'product-3',
      name: 'Test Product',
      slug: 'test-product',
      brand: { name: 'Test Brand', _id: 'brand-1', slug: 'test-brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      imageUrl: 'https://example.com/image.jpg',
    }

    describe('FeaturedCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })

        it('does not render increment/decrement controls', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          expect(screen.queryByTestId(`increment-${mockFeaturedProduct._id}`)).not.toBeInTheDocument()
          expect(screen.queryByTestId(`decrement-${mockFeaturedProduct._id}`)).not.toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockFeaturedProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })

        it('displays correct quantity', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`).click()
          })
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
        })
      })
    })

    describe('IemCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<IemCard product={mockIemProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockIemProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<IemCard product={mockIemProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockIemProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockIemProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockIemProduct._id}`)).toBeInTheDocument()
        })
      })
    })

    describe('DacCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<DacCard item={mockFeaturedProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<DacCard item={mockFeaturedProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockFeaturedProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })
      })
    })

    describe('AccessoryCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<AccessoryCard item={mockAccessoryProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockAccessoryProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<AccessoryCard item={mockAccessoryProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockAccessoryProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockAccessoryProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockAccessoryProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Category Page Product Grid', () => {
    const mockProduct = {
      _id: 'product-1',
      name: 'Test Product',
      brand: { name: 'Test Brand', _id: 'brand-1' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      image: { asset: { url: 'https://example.com/image.jpg' } },
      slug: { current: 'test-product' },
    }

    describe('ProductCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<ProductCard product={mockProduct} />)
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProduct._id}`)).toBeInTheDocument()
        })

        it('updates quantity display after increment click', async () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action, then increment
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
            screen.getByTestId(`increment-${mockProduct._id}`).click()
          })
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
        })

        it('removes item after decrement to zero', async () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action, then decrement to zero
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
            screen.getByTestId(`decrement-${mockProduct._id}`).click()
          })
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.queryByTestId('quantity-display')).not.toBeInTheDocument()
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Product Detail Page', () => {
    const mockProduct = {
      _id: 'product-1',
      name: 'Test Product',
      brand: { name: 'Test Brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      sku: 'TEST-001',
      slug: 'test-product',
      image: { asset: { url: 'https://example.com/image.jpg' } },
    }

    describe('ProductInfo', () => {
      describe('when product not in basket', () => {
        it('renders large add button from BasketControls', () => {
          render(<ProductInfo product={mockProduct} />)
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          render(<ProductInfo product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProduct._id}`)).toBeInTheDocument()
        })

        it('displays correct quantity', () => {
          render(<ProductInfo product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
        })

        it('removes item after decrement to zero', async () => {
          render(<ProductInfo product={mockProduct} />)
          // ACT - add product via user action, then decrement to zero
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
            screen.getByTestId(`decrement-${mockProduct._id}`).click()
          })
          // Wait for React state update
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.queryByTestId('quantity-display')).not.toBeInTheDocument()
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Search Results Page', () => {
    const mockProduct = {
      _id: 'product-1',
      name: 'Test Product',
      brand: { name: 'Test Brand', _id: 'brand-1' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      image: { asset: { url: 'https://example.com/image.jpg' } },
      slug: { current: 'test-product' },
    }

    describe('ProductCard in search results', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<ProductCard product={mockProduct} />)
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Basket Page', () => {
    const mockProductId = 'product-1'

    describe('BasketControls on basket page', () => {
      describe('when product in basket', () => {
        // NOTE: Basket page context assumes product is already in basket.
        // Cannot add product through BasketControls UI on basket page (no add button).
        // This test requires pre-existing state which is a limitation of black-box testing
        // for components that assume external state. Consider page-level integration test
        // for full user flow.

        it('renders increment/decrement controls', () => {
          render(<BasketControls isBasketPage={true} productId={mockProductId} displayPriceAtAdd={100} availableStockAtAdd={10} />)
          expect(screen.getByTestId(`increment-${mockProductId}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProductId}`)).toBeInTheDocument()
        })

        it('renders remove button', () => {
          render(<BasketControls isBasketPage={true} productId={mockProductId} displayPriceAtAdd={100} availableStockAtAdd={10} />)
          expect(screen.getByTestId(`remove-${mockProductId}`)).toBeInTheDocument()
        })

        it('caps decrement at 1 (does not remove)', () => {
          render(<BasketControls isBasketPage={true} productId={mockProductId} displayPriceAtAdd={100} availableStockAtAdd={10} />)
          const decrementButton = screen.getByTestId(`decrement-${mockProductId}`)
          decrementButton.click()
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
          expect(decrementButton).toBeDisabled()
        })

        it('removes item via remove button', async () => {
          render(<BasketControls isBasketPage={true} productId={mockProductId} displayPriceAtAdd={100} availableStockAtAdd={10} />)
          screen.getByTestId(`remove-${mockProductId}`).click()
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.queryByTestId('quantity-display')).not.toBeInTheDocument()
          expect(screen.getByTestId(`add-to-basket-${mockProductId}`)).toBeInTheDocument()
        })
      })
    })
  })
})
