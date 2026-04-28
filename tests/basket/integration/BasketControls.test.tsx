  describe('Basket UI Controls (View Layer Component Integration)', () => {
    
describe('Primitive Component Principles & Conditional Rendering', () => {
      it('renders the "Add to Basket" button when the target productId is missing from the store', () => {
        // Arrange: Mock the Zustand store to return an empty items array.
        // Act: Query for the "Add to Basket" button.
        // Assert: The button is visible in the document. Increment/Decrement UI is NOT visible. 
      })
      
      it('renders increment/decrement controls instead of the "Add" button when the productId exists in store', () => {
        // Arrange: Mock store with product 'prod-123' at quantity 1.
        // Act: Query for quantity controls.
        // Assert: Increment/Decrement UI is visible; Add button is not.
      })
    })

    describe('UI Add Button Contract', () => {
      it('dispatches the addProduct action with the correct productId when clicked', () => {
        // Arrange: Mock the Zustand store and spy on the addProduct function. Render the add button component.
        // Act: Simulate a user click on the add button.
        // Assert: The mocked addProduct function was called exactly once with the target productId.
      })
    })

    describe('UI Increment Button Contract', () => {
      it('dispatches the incrementQuantity action with the productId and CMS stock limit when clicked', () => {
        // Arrange: Mock store with quantity 1. Pass a CMS stock limit of 5 as a prop. Render the component.
        // Act: Simulate a user click on the increment button.
        // Assert: The mocked incrementQuantity function was called with the productId and the stock limit of 5.
      })

      it('renders in a disabled visual state and blocks clicks when current quantity equals or exceeds the stock limit', () => {
        // Arrange: Mock store with quantity 5. Pass CMS stock limit of 5. Render component.
        // Act: Attempt to simulate a user click on the increment button.
        // Assert: The HTML button element possesses the 'disabled' attribute.
        // Assert: The mocked incrementQuantity function was never called.
      })
    })

    describe('UI Decrement Button Contract', () => {
      it('Basket page: dispatches decrementQuantity when quantity > 1', () => {
        // Arrange: quantity=2
        // Act: Click decrement
        // Assert: decrementQuantity called
      });

      it('Other Pages: dispatches removeProduct when decrementing from 1 to 0', () => {
        // Arrange: isBasketPage={false}, quantity=1
        // Act: Click decrement
        // Assert: removeProduct called (decrement floor 0 logic)
      });
    });

    describe('UI Remove (X) Button Contract', () => {
      it('dispatches removeProduct immediately when clicked', () => {
        // Arrange: isBasketPage={true}
        // Act: Click "X" button
        // Assert: removeProduct called with productId
      });
    });

    describe('Contextual Rendering (Product Page vs. Basket Page)', () => {
      it('Basket Page: Renders "X" remove button and disables decrement when quantity is 1', () => {
        // Arrange: Render with isBasketPage={true}, quantity=1
        // Assert: "X" button visible. Decrement button disabled (capped at 1).
      });

      it('Other Pages: Hides "X" button and allows decrement to reach 0', () => {
        // Arrange: Render with isBasketPage={false}, quantity=1
        // Assert: "X" button NOT in DOM. Decrement button enabled.
      });
    });
    
    describe('Header Cart Button Routing and Display', () => {
      it('consumes the selectTotalItemsCount selector and renders the exact integer in the badge', () => {
        // Arrange: Mock the store's selectTotalItemsCount to return 7. Render the HeaderCartButton.
        // Act: Query the DOM for the badge element.
        // Assert: The badge element contains the text "7".
      })

      it('pushes the user to the /basket route when the cart icon is clicked', () => {
        // Arrange: Mock the Next.js useRouter hook. Render the HeaderCartButton.
        // Act: Simulate a user click on the cart icon.
        // Assert: The mocked router.push function was called with the exact string '/basket'.
      })
    })
  })
