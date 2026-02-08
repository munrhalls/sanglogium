// TODO should have two icons: cart and user profile (or sign in if not authenticated). These should be hidden on mobile and visible on desktop. They should be placed to the right of the search bar, with a gap of .6 (24px) between them and the search bar, and between each other. The cart icon should have a badge with the number of items in the cart, which should be hidden if the cart is empty. The user profile icon should have a dropdown menu with options for "My Account", "Orders", and "Sign Out" (if authenticated) or "Sign In" (if not authenticated).
// icon itself
// - should be 24x24

// icon with text - look and style behavior
// - should have proper text under the icon
// - with proper spacing (as decreed by spacing system 8pt grid)
// - both vertical (icon to text) and horizontal (between icons) - but careful - horizontal should be handled by icons group
// - should be proper typography selection from the source of truth - tailwind config
// - should have proper subtle hover effect (either on text or icon itself, a subtle highlight)
// - the highlight should be using brand color for the highlight effect, not random color (from palette source of truth)
// - should take 40px height together with text
// - text, like all typography elements, should be truncated in terms of line height

// icons as a group
// - should implement gap between icons based on spacing system
// - should avoid using any anti-patterns such as horizontal margins (that should be handled by the container of this comp)
