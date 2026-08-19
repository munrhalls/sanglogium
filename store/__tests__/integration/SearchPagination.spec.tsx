// # Execution Specs: Search Feature — Pagination Component

// ## Selected Slice
// - Slice: SearchPagination.tsx — client-side pagination controls (real <Link> hrefs)
// - Reason: Core UX for search results navigation; URL param preservation (G8)

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SearchPagination } from '@/app/components/features/search/SearchPagination'

// Mock next/navigation
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  usePathname: () => '/search',
  useSearchParams: () => mockSearchParams,
}))

// Mock next/link to render a plain <a> in jsdom (Next-only props are dropped)
vi.mock('next/link', () => ({
  default: ({ children, href, 'aria-label': ariaLabel }: any) => (
    <a href={href} aria-label={ariaLabel}>{children}</a>
  ),
}))

describe('SearchPagination', () => {
  beforeEach(() => {
    mockSearchParams.delete('page')
    mockSearchParams.delete('q')
    mockSearchParams.delete('sort')
  })

  afterEach(() => {
    cleanup()
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
    it('renders page info and navigation links', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByText(/Showing 1–24 of 50/)).toBeInTheDocument()
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Next page/i })).toBeInTheDocument()
    })

    it('renders Previous as a disabled span on the first page', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.queryByRole('link', { name: /Previous page/i })).not.toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('enables Previous when not on first page', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByRole('link', { name: /Previous page/i })).toBeInTheDocument()
    })

    it('disables Next on last page', () => {
      mockSearchParams.set('page', '3')
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.queryByRole('link', { name: /Next page/i })).not.toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('links to the next page preserving query params', () => {
      mockSearchParams.set('q', 'sennheiser')
      render(<SearchPagination totalCount={50} perPage={24} />)

      const next = screen.getByRole('link', { name: /Next page/i })
      expect(next).toHaveAttribute('href', '/search?q=sennheiser&page=2')
    })

    it('links to the previous page and drops page=1', () => {
      mockSearchParams.set('q', 'sennheiser')
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      const prev = screen.getByRole('link', { name: /Previous page/i })
      expect(prev).toHaveAttribute('href', '/search?q=sennheiser')
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

    it('has aria-label on Previous link', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('link', { name: /Previous page/ })).toBeInTheDocument()
    })

    it('has aria-label on Next link', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('link', { name: /Next page/ })).toBeInTheDocument()
    })

    it('has aria-live on page indicator', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      const pageIndicator = screen.getByText(/Page 1 of 3/)
      expect(pageIndicator).toHaveAttribute('aria-live', 'polite')
    })
  })
})
