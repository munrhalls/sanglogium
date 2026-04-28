test.describe('Commercial Happy Path: Basket Domain Boundary', () => {
  
  test.use({
    timezoneId: 'Europe/Warsaw',
    geolocation: { longitude: 17.0385, latitude: 51.1079 },
    permissions: ['geolocation'],
  });

  test('User can successfully add an item to the basket and reach the finalized basket view', () => {
    // Arrange: Navigate the real Chromium browser to a known, stable product page sourced from the Sanity v3 CMS
    
    // Act: Simulate a physical user clicking the primary 'Add to Basket' action button
    
    // Assert: Verify the Header Cart Icon successfully hydrates and visually updates its counter badge to display exactly '1'
    
    // Act: Simulate the user clicking the Header Cart Icon to open the basket
    
    // Assert: Verify the Next.js routing system successfully transitions the browser to the /basket URL
    
    // Assert: Verify the basket page accurately renders the selected product item in the DOM, proving the Zustand data translated to physical UI reality
    
    // Assert: Verify the 'Proceed to Checkout' action button is present and not disabled, confirming the basket domain flow is complete and ready to hand off to the checkout domain
  });

});