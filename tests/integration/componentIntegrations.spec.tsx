import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketControls } from '@/features/basket'
import { FeaturedCard } from '@/features/homepage'
import IemCard from '@/app/components/features/homepage/iems-gallery/IemCard'
import DacCard from '@/app/components/features/homepage/dacs/DacCard'
import AccessoryCard from '@/app/components/features/homepage/accessories/AccessoryCard'
import { useBasketStore } from '@/features/basket'

// Mock next/link to avoid complex router setup
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// Mock next-sanity/image
vi.mock('next-sanity/image', () => ({
  Image: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))


describe('Basket Controls Integration Across App', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
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

  describe('Basket Page', () => {
    const mockProductId = 'product-1'

    describe('BasketControls on basket page', () => {
      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          expect(screen.getByTestId(`increment-${mockProductId}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProductId}`)).toBeInTheDocument()
        })

        it('renders remove button', () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          expect(screen.getByTestId(`remove-${mockProductId}`)).toBeInTheDocument()
        })

        it('caps decrement at 1 (does not remove)', () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          const decrementButton = screen.getByTestId(`decrement-${mockProductId}`)
          decrementButton.click()
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
          expect(decrementButton).toBeDisabled()
        })

        it('removes item via remove button', async () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          screen.getByTestId(`remove-${mockProductId}`).click()
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.queryByTestId('quantity-display')).not.toBeInTheDocument()
          expect(screen.getByTestId(`add-to-basket-${mockProductId}`)).toBeInTheDocument()
        })
      })
    })
  })
})
