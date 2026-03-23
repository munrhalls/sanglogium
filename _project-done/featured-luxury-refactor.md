# Featured Component Luxury Refactor

## Scope of Deliverables

### Structural Refactoring

**FeaturedCard Article Element**
- Remove `border` and `hover:border` classes from the article element
- Remove `border-secondary-800` and `hover:border-secondary-600` utility classes
- Maintain transparent background and transition effects

**Price/Action Section Divider**
- Remove `border-t` and `pt-4` divider classes from the price/action section
- Remove `border-t border-secondary-800` utility classes
- Implement negative space (margins) for visual separation instead of explicit lines

**Consistent Negative Space Implementation**
- Add consistent margin gaps between image block, product info, and CTA section
- Replace border-based separation with whitespace-based separation
- Ensure visual hierarchy through strategic spacing rather than decorative elements

### Carousel Control Realignment

**Arrow Positioning**
- Move CarouselPrevious and CarouselNext to be children of the image container (brand-300 background block)
- Alternatively, implement perfect overlay positioning relative to the product image
- Remove arrows from the current position below the carousel track

**Arrow Visual Cleanup**
- Remove background boxes, borders, and fixed `h-12 w-12` constraints from arrow buttons
- Remove `border-secondary-600`, `text-secondary-400`, and `hover:border-accent-500` classes
- Implement high-contrast chevron icons without container styling

**Arrow Alignment**
- Vertically center arrows relative to the product image within the beige background block
- Ensure arrows are positioned at optimal touch targets without visual clutter
- Maintain responsive behavior across all breakpoints

### Typography & Content Cleanup

**Brand Name Redundancy**
- Delete the brand name eyebrow text (`product.brand`) to eliminate redundancy with product title
- Remove the `<h3 className="text-body tracking-editorial text-accent-500 uppercase">{product.brand}</h3>` element
- Maintain product name as the primary text identifier
- brand name should be part of the image - color brand-900, positioning - in the top left corner, size - big enough for weight and clarity, small enough to not compete with image at all

**Text Using Design System**
- replace wrong class names (e.g. text-h2, with the appropriate fitting typography aliases from tailwind.config.ts)

**Text Hierarchy Optimization**
- Adjust spacing between `text-h2` (Featured) and `text-small` (Curated Excellence) elements
- Ensure no visual competition between heading levels
- Implement proper vertical rhythm between title and subtitle elements

### Iconography

**ShoppingCart Visual Weight**
- Update ShoppingCart icon weight or size to perfectly match the visual weight of "ADD" text
- Ensure icon and text maintain visual harmony in the btn-cart component
- Consider using `weight="regular"` or adjusting `size` prop for balance

## Out of Scope

- Modifying the CarouselRoot logic or state management
- Changing the getFeaturedProducts data fetching logic
- Updating global Tailwind configurations or theme files
- Altering the responsive breakpoint behavior
- Modifying carousel swipe or touch interactions
- Changes to the data structure or Sanity integration

## Constraints

### Framework Requirements
- React (Next.js) with TypeScript
- Tailwind CSS utility classes only
- Server component architecture maintained

### Design Principles
- **Luxury Minimalism**: Reliance on whitespace over decorative lines
- **Visual Hierarchy**: Clear information structure without competing elements
- **Consistent Spacing**: Systematic use of negative space for separation

### Color Stability
- Maintain dark background (`brand-950`) for the main container
- Preserve beige image background (`brand-300`) for product images
- Keep existing accent colors for interactive states

### Environment Specifications
- Windows 11 development environment
- PowerShell command line
- VS Code editor
- Next.js 14+ with App Router

## Forbidden (Hard Rules)

### No Explicit Lines
- Strictly forbidden to use border classes for layout separation
- No `border-*`, `border-t`, `border-b` utility classes for visual hierarchy
- All separation must be achieved through margin/padding spacing

### No Redundant Brand Text
- Do not render the brand name twice in a single card
- Product title must serve as the primary identifier
- Eliminate duplicate information display

### No Mixed Code/Comments
- All comments must be removed from the final component code
- Clean, production-ready implementation without explanatory comments
- Maintain code clarity through structure, not documentation

### No Inline Styles
- All styling must be via Tailwind utility classes
- No `style` props or CSS-in-JS solutions
- Consistent utility-first approach throughout

## Definition of Done

The refactor is complete when:
1. All borders are removed and replaced with whitespace separation
2. Carousel controls are properly positioned within the image container
3. Brand name redundancy is eliminated
4. Typography hierarchy is optimized without competition
5. ShoppingCart icon matches "ADD" text visual weight
6. Component maintains all existing functionality
7. Code is clean without comments or inline styles
8. Luxury standard rating improves from 6/10 to 8/10+

## Success Metrics

- Visual cleanliness score (subjective luxury assessment)
- Reduced visual noise through border elimination
- Improved information hierarchy through typography cleanup
- Enhanced touch target usability for carousel controls
- Maintained accessibility and responsive behavior
