// TODO Testing Checklist
// Ready for manual testing:

//  Click Menu → URL shows ?menu=true → Drawer opens
//  Click Search → URL shows ?search=true → Drawer opens
//  Click CLOSE → Query param removed → Drawer closes
//  Browser back button → Closes drawer
//  Refresh with ?menu=true → Drawer stays open
//  Direct navigation to /?search=true → Opens search
//  Opening one drawer closes the other (mutual exclusivity)

//  ?menu=true opens mobile menu drawer
//  ?search=true opens mobile search drawer
//  Close buttons remove query params and close drawer
//  Animation slides smoothly (300ms transition)
//  Categories load and display correctly
//  Mobile menu icons toggle between open/close states
//  Only one drawer open at a time
// Performance:
//  Layout no longer has searchParams in signature
//  next build shows layout as static (not dynamic)
//  No hydration errors in console
//  No layout shifts during drawer toggle
//  Suspense fallback displays correctly
// Edge Cases:
//  Direct URL navigation with ?menu=true works
//  Browser back button closes drawer
//  Refreshing page with params maintains state
//  Navigation while drawer open closes it

// Opening menu drawer (?menu=true) - smooth animation
// Opening search drawer (?search=true) - smooth animation
// Closing drawers - smooth animation
// Rapid toggling - no visual jank
// Browser back/forward still works correctly
// URL state remains shareable/bookmarkable
