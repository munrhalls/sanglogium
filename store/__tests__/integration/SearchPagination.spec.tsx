// # Execution Specs: Search Feature — Pagination Component

// ## Selected Slice
// - Slice: SearchPagination.tsx — client-side pagination controls
// - Reason: Core UX for search results navigation; URL param manipulation

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SearchPagination } from '@/app/components/features/search/SearchPagination'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

describe('SearchPagination', () => {
  const originalPathname = window.location.pathname

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, pathname: '/search' },
    })
  })

  afterEach(() => {
    cleanup()
    mockPush.mockClear()
    mockSearchParams.delete('page')
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, pathname: originalPathname },
    })
  })

  describe('when total fits on one page', () => {
    it('renders nothing for 0 results', () => {
      const { container } = render(<SearchPagination totalCount={0} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing for fewer results than perPage', () => {
      const { container } = render(<SearchPagination totalCount={10} perPage={24} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when total equals perPage', () => {
      const { container } = render(<SearchPagination totalCount={24} perPage={24} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when multiple pages exist', () => {
    it('renders page info and navigation buttons', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByText(/Showing 1–24 of 50/)).toBeInTheDocument()
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    })

    it('disables Previous on first page', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      const prevBtn = screen.getByRole('button', { name: /Previous/i })
      expect(prevBtn).toBeDisabled()
    })

    it('enables Previous when not on first page', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      const prevBtn = screen.getByRole('button', { name: /Previous/i })
      expect(prevBtn).not.toBeDisabled()
    })

    it('disables Next on last page', () => {
      mockSearchParams.set('page', '3')
      render(<SearchPagination totalCount={50} perPage={24} />)

      const nextBtn = screen.getByRole('button', { name: /Next/i })
      expect(nextBtn).toBeDisabled()
    })

    it('navigates to next page on Next click', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(mockPush).toHaveBeenCalledWith('/search?page=2', { scroll: false })
    })

    it('navigates to previous page on Previous click', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      fireEvent.click(screen.getByRole('button', { name: /Previous/i }))
      expect(mockPush).toHaveBeenCalledWith('/search', { scroll: false })
    })

    it('preserves existing query params when navigating', () => {
      mockSearchParams.set('q', 'sennheiser')
      render(<SearchPagination totalCount={50} perPage={24} />)

      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('q=sennheiser'),
        { scroll: false }
      )
    })

    it('shows correct range for middle page', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByText(/Showing 25–48 of 50/)).toBeInTheDocument()
    })

    it('shows correct range for last partial page', () => {
      mockSearchParams.set('page', '3')
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByText(/Showing 49–50 of 50/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has aria-label on navigation', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Search results pagination')
    })

    it('has aria-label on Previous button', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('button', { name: /Previous page/ })).toBeInTheDocument()
    })

    it('has aria-label on Next button', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('button', { name: /Next page/ })).toBeInTheDocument()
    })

    it('has aria-live on page indicator', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      const pageIndicator = screen.getByText(/Page 1 of 3/)
      expect(pageIndicator).toHaveAttribute('aria-live', 'polite')
    })
  })
})
