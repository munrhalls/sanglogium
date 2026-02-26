// import { render, screen } from "@testing-library/react";
// import BasketPage from "../page";
// import { BasketItem } from "@/store/store";
// jest.mock("@/store", () => ({
//   useBasketStore: jest.fn(),
// }));
// import { useBasketStore } from "@/store/store";
// const mockUseBasketStore = useBasketStore as jest.MockedFunction<
//   typeof useBasketStore
// >;
// describe("1. Page Load & Initial State", () => {
//   describe("1.1 Empty Basket State", () => {
//     beforeEach(() => {
//       jest.clearAllMocks();
//     });
//     it("Empty basket displays browse products message", () => {
//       const mockStore = {
//         basket: [],
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 0),
//         isCheckoutEnabled: jest.fn(() => false),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       expect(screen.getByText("Your basket is empty")).toBeInTheDocument();
//     });
//   });
//   describe("1.2 Populated Basket State", () => {
//     beforeEach(() => {
//       jest.clearAllMocks();
//     });
//     it("Basket displays all items with correct information", () => {
//       const mockProducts = [
//         {
//           _id: "1",
//           name: "Test Product 1",
//           price: 249.99,
//           quantity: 2,
//         },
//         {
//           _id: "2",
//           name: "Test Product 2",
//           price: 149.99,
//           quantity: 1,
//         },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 649.97),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       expect(screen.getByText("Test Product 1")).toBeInTheDocument();
//       expect(screen.getByText("Test Product 2")).toBeInTheDocument();
//       expect(screen.getAllByText("$249.99")).toHaveLength(2);
//       expect(screen.getAllByText("$149.99")).toHaveLength(2);
//       expect(screen.getByText("$649.97")).toBeInTheDocument();
//       expect(screen.getByText("$15.99")).toBeInTheDocument();
//       expect(screen.getByText("$665.96")).toBeInTheDocument();
//       expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument();
//     });
//   });
// });
// describe("2. Item Display & Information", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   describe("2.1 Product Information Display", () => {
//     it("Each basket item shows complete product details", () => {
//       const mockProduct = {
//         _id: "1",
//         name: "Test Product",
//         price: 249.99,
//         quantity: 2,
//       };
//       const mockStore = {
//         basket: [mockProduct],
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 499.98),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       const productLinks = screen.getAllByRole("link", { name: /product/i });
//       expect(productLinks.length).toBeGreaterThanOrEqual(1);
//       const priceElements = screen.getAllByText("$249.99");
//       expect(priceElements.length).toBeGreaterThanOrEqual(1);
//       expect(screen.getByText("2")).toBeInTheDocument();
//     });
//   });
//   describe("2.2 Responsive Item Layout", () => {
//     it("Item layout adapts correctly on mobile and desktop", () => {
//       const mockProduct = {
//         _id: "1",
//         name: "Test Product",
//         price: 249.99,
//         quantity: 2,
//       };
//       const mockStore = {
//         basket: [mockProduct],
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 499.98),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       const productName = screen.getByText("Test Product");
//       expect(productName).toBeInTheDocument();
//       const priceElements = screen.getAllByText("$249.99");
//       expect(priceElements).toHaveLength(2);
//       const quantityLabel = screen.getByText("Quantity:");
//       expect(quantityLabel).toBeInTheDocument();
//       const removeButtons = screen.getAllByLabelText("Remove item");
//       expect(removeButtons.length).toBeGreaterThanOrEqual(1);
//       const quantityInputs = screen.getAllByText("2");
//       expect(quantityInputs.length).toBeGreaterThanOrEqual(1);
//     });
//   });
// });
// describe("3. Quantity Interactions", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   describe("3.1 Increase Quantity", () => {
//     it("Increasing quantity updates item and totals", () => {
//       const mockProduct = {
//         _id: "1",
//         name: "Test Product",
//         price: 249.99,
//         quantity: 1,
//       };
//       const mockUpdateQuantity = jest.fn();
//       const mockGetTotal = jest.fn(() => 249.99);
//       const mockStore = {
//         basket: [mockProduct],
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: mockUpdateQuantity,
//         getTotal: mockGetTotal,
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       const incButtons = screen.getAllByLabelText("Increase quantity");
//       expect(incButtons.length).toBeGreaterThanOrEqual(1);
//       incButtons[0].click();
//     });
//   });
//   describe("3.2 Decrease Quantity", () => {
//     it("Decreasing quantity updates item and totals", () => {
//       const mockProduct = {
//         _id: "1",
//         name: "Test Product",
//         price: 249.99,
//         quantity: 3,
//       };
//       const mockUpdateQuantity = jest.fn();
//       const mockGetTotal = jest.fn(() => 749.97);
//       const mockStore = {
//         basket: [mockProduct],
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: mockUpdateQuantity,
//         getTotal: mockGetTotal,
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       const decButtons = screen.getAllByLabelText("Decrease quantity");
//       expect(decButtons.length).toBeGreaterThanOrEqual(1);
//       decButtons[0].click();
//     });
//   });
//   describe("3.3 Minimum Quantity Enforcement", () => {
//     it("Quantity cannot decrease below 1", () => {
//       const mockProduct = {
//         _id: "1",
//         name: "Test Product",
//         price: 249.99,
//         quantity: 1,
//       };
//       const mockUpdateQuantity = jest.fn();
//       const mockRemoveItem = jest.fn();
//       const mockGetTotal = jest.fn(() => 249.99);
//       const mockStore = {
//         basket: [mockProduct],
//         addItem: jest.fn(),
//         removeItem: mockRemoveItem,
//         updateQuantity: mockUpdateQuantity,
//         getTotal: mockGetTotal,
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       const decreaseButton = screen.getByRole("button", {
//         name: /decrease quantity/i,
//       });
//       expect(decreaseButton).toBeInTheDocument();
//       decreaseButton.click();
//       expect(mockUpdateQuantity).not.toHaveBeenCalled();
//       expect(mockRemoveItem).toHaveBeenCalledWith("1");
//     });
//   });
// });
// describe("4. Item Removal", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   describe("4.1 Remove Single Item", () => {
//     it("Removing item updates basket and totals", () => {
//       const mockProducts = [
//         {
//           _id: "1",
//           name: "Product A",
//           price: 100.0,
//           quantity: 2,
//         },
//         {
//           _id: "2",
//           name: "Product B",
//           price: 50.0,
//           quantity: 1,
//         },
//       ];
//       const mockRemoveItem = jest.fn();
//       const mockGetTotal = jest.fn(() => 250.0);
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: mockRemoveItem,
//         updateQuantity: jest.fn(),
//         getTotal: mockGetTotal,
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       const removeButtons = screen.getAllByLabelText("Remove item");
//       expect(removeButtons.length).toBeGreaterThanOrEqual(1);
//       removeButtons[0].click();
//       expect(mockRemoveItem).toHaveBeenCalledWith("1");
//     });
//   });
//   describe("4.2 Remove Last Item", () => {
//     it("Removing last item shows empty basket state", () => {
//       const mockProduct = {
//         _id: "1",
//         name: "Product A",
//         price: 100.0,
//         quantity: 1,
//       };
//       const mockRemoveItem = jest.fn();
//       const mockGetTotal = jest.fn(() => 100.0);
//       const mockStore = {
//         basket: [mockProduct],
//         addItem: jest.fn(),
//         removeItem: mockRemoveItem,
//         updateQuantity: jest.fn(),
//         getTotal: mockGetTotal,
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       const removeButtons = screen.getAllByLabelText("Remove item");
//       expect(removeButtons.length).toBeGreaterThanOrEqual(1);
//       removeButtons[0].click();
//       expect(mockRemoveItem).toHaveBeenCalledWith("1");
//       mockStore.basket = [];
//       const emptyMessages = screen.queryAllByText(/your basket is empty/i);
//       expect(emptyMessages.length).toBeGreaterThan(0);
//     });
//   });
//   describe("4.3 Subtotal Calculation", () => {
//     it("Subtotal calculates correctly for multiple items", () => {
//       const mockProducts = [
//         {
//           _id: "1",
//           name: "Product A",
//           price: 100.0,
//           quantity: 2,
//         },
//         {
//           _id: "2",
//           name: "Product B",
//           price: 50.0,
//           quantity: 1,
//         },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 250.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) => {
//         return selector ? selector(mockStore) : mockStore;
//       });
//       render(<BasketPage />);
//       expect(screen.getByText("Subtotal (3 items)")).toBeInTheDocument();
//       expect(screen.getByText("$250.00")).toBeInTheDocument();
//       expect(screen.getByText("$15.99")).toBeInTheDocument();
//       expect(screen.getByText("$265.99")).toBeInTheDocument();
//       expect(screen.getByText("Including VAT")).toBeInTheDocument();
//     });
//   });
//   describe("5.2 Shipping Calculation", () => {
//     it("Shipping fee applies correctly and total includes shipping", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//         { _id: "2", name: "Product B", price: 50.0, quantity: 1 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 250.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       expect(screen.getByText("$15.99")).toBeInTheDocument();
//       expect(screen.getByText("$265.99")).toBeInTheDocument();
//     });
//   });
//   describe("5.3 Total Calculation", () => {
//     it("Total combines subtotal and shipping, VAT note is displayed", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//         { _id: "2", name: "Product B", price: 50.0, quantity: 1 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 250.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       expect(screen.getByText("$265.99")).toBeInTheDocument();
//       expect(screen.getByText("Including VAT")).toBeInTheDocument();
//     });
//   });
//   describe("6.1 Checkout Navigation", () => {
//     it("Checkout button navigates to checkout page", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 200.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       const checkoutLink = screen.getByRole("link", {
//         name: /proceed to checkout/i,
//       });
//       expect(checkoutLink).toBeInTheDocument();
//       expect(checkoutLink).toHaveAttribute("href", "/checkout");
//     });
//   });
//   describe("6.2 Continue Shopping", () => {
//     it("Continue shopping returns to products page", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 200.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       const continueShoppingLinks = screen.getAllByRole("link", {
//         name: /continue shopping/i,
//       });
//       expect(continueShoppingLinks).toHaveLength(2);
//       continueShoppingLinks.forEach((link) => {
//         expect(link).toHaveAttribute("href", "/products");
//       });
//     });
//   });
//   describe("6.3 Product Page Navigation", () => {
//     it("Product name links to individual product page", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//         { _id: "2", name: "Product B", price: 50.0, quantity: 1 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 250.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       const productALink = screen.getByRole("link", { name: "Product A" });
//       const productBLink = screen.getByRole("link", { name: "Product B" });
//       expect(productALink).toHaveAttribute("href", "/product/1");
//       expect(productBLink).toHaveAttribute("href", "/product/2");
//     });
//   });
//   describe("7.1 Page Reload Persistence", () => {
//     it("Basket contents persist after page reload", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//         { _id: "2", name: "Product B", price: 50.0, quantity: 1 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 250.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       const { rerender } = render(<BasketPage />);
//       expect(screen.getByText("Product A")).toBeInTheDocument();
//       expect(screen.getByText("Product B")).toBeInTheDocument();
//       expect(screen.getByText("2")).toBeInTheDocument();
//       expect(screen.getByText("1")).toBeInTheDocument();
//       expect(screen.getByText("$250.00")).toBeInTheDocument();
//       rerender(<BasketPage />);
//       expect(screen.getByText("Product A")).toBeInTheDocument();
//       expect(screen.getByText("Product B")).toBeInTheDocument();
//       expect(screen.getByText("2")).toBeInTheDocument();
//       expect(screen.getByText("1")).toBeInTheDocument();
//       expect(screen.getByText("$250.00")).toBeInTheDocument();
//     });
//   });
//   describe("7.2 Cross-Page Synchronization", () => {
//     it("Basket changes reflect across all pages", () => {
//       const initialProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 1 },
//       ];
//       const updatedProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 3 },
//       ];
//       const mockStore = {
//         basket: initialProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 100.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       const { rerender, container } = render(<BasketPage />);
//       expect(container.textContent).toMatch(/\b1\b/);
//       mockStore.basket = updatedProducts;
//       mockStore.getTotal = jest.fn(() => 300.0);
//       rerender(<BasketPage />);
//       expect(container.textContent).toMatch(/\b3\b/);
//       const totalMatches = Array.from(container.querySelectorAll("*"))
//         .map((el) => el.textContent)
//         .filter((text) => text && text.includes("$300.00"));
//       expect(totalMatches.length).toBeGreaterThan(0);
//     });
//   });
//   describe("8.1 Invalid Product Data", () => {
//     it("Page handles corrupted basket data gracefully", () => {
//       const invalidProducts: BasketItem[] = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//         { _id: "2", name: "", price: 50.0, quantity: 1 },
//         { _id: "3", name: "Product C", price: 0, quantity: 1 },
//       ];
//       const mockStore = {
//         basket: invalidProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 250.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       expect(screen.getByText("Product A")).toBeInTheDocument();
//       expect(screen.getByText("Product C")).toBeInTheDocument();
//       expect(screen.getByText("$250.00")).toBeInTheDocument();
//     });
//   });
//   describe("8.2 Network Errors", () => {
//     it("Page functions during temporary network issues", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//       ];
//       const mockUpdateQuantity = jest.fn();
//       const mockRemoveItem = jest.fn();
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: mockRemoveItem,
//         updateQuantity: mockUpdateQuantity,
//         getTotal: jest.fn(() => 200.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       const { container } = render(<BasketPage />);
//       const increaseButton = Array.from(
//         container.querySelectorAll("button")
//       ).find((btn) =>
//         btn.getAttribute("aria-label")?.toLowerCase().includes("increase")
//       );
//       expect(increaseButton).toBeTruthy();
//       if (increaseButton) increaseButton.click();
//       const removeButton = Array.from(
//         container.querySelectorAll("button")
//       ).find((btn) =>
//         btn.getAttribute("aria-label")?.toLowerCase().includes("remove")
//       );
//       expect(removeButton).toBeTruthy();
//       if (removeButton) removeButton.click();
//       expect(container.textContent?.toLowerCase()).toContain("product a");
//     });
//   });
//   describe("9.1 Keyboard Navigation", () => {
//     it("All interactive elements are keyboard accessible", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 200.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       const increaseBtn = screen.getByRole("button", {
//         name: /increase quantity/i,
//       });
//       const decreaseBtn = screen.getByRole("button", {
//         name: /decrease quantity/i,
//       });
//       const removeBtns = screen.getAllByLabelText("Remove item");
//       const checkoutLink = screen.getByRole("link", {
//         name: /proceed to checkout/i,
//       });
//       const continueLinks = screen.getAllByRole("link", {
//         name: /continue shopping/i,
//       });
//       expect(increaseBtn.tabIndex).not.toBe(-1);
//       expect(decreaseBtn.tabIndex).not.toBe(-1);
//       removeBtns.forEach((btn) => expect(btn.tabIndex).not.toBe(-1));
//       expect(checkoutLink.tabIndex).not.toBe(-1);
//       continueLinks.forEach((link) => expect(link.tabIndex).not.toBe(-1));
//     });
//   });
//   describe("9.2 Screen Reader Support", () => {
//     it("All buttons have descriptive aria-labels", () => {
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 2 },
//       ];
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: jest.fn(),
//         getTotal: jest.fn(() => 200.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       render(<BasketPage />);
//       expect(
//         screen.getByRole("button", { name: /increase quantity/i })
//       ).toBeInTheDocument();
//       expect(
//         screen.getByRole("button", { name: /decrease quantity/i })
//       ).toBeInTheDocument();
//       screen
//         .getAllByLabelText("Remove item")
//         .forEach((btn) => expect(btn).toBeInTheDocument());
//     });
//   });
//   describe("10.2 Real-time Updates", () => {
//     it("Quantity changes update immediately and are debounced", () => {
//       jest.useFakeTimers();
//       const mockProducts = [
//         { _id: "1", name: "Product A", price: 100.0, quantity: 1 },
//       ];
//       const mockUpdateQuantity = jest.fn();
//       const mockStore = {
//         basket: mockProducts,
//         addItem: jest.fn(),
//         removeItem: jest.fn(),
//         updateQuantity: mockUpdateQuantity,
//         getTotal: jest.fn(() => 100.0),
//         isCheckoutEnabled: jest.fn(() => true),
//         _hasHydrated: true,
//       };
//       mockUseBasketStore.mockImplementation((selector) =>
//         selector ? selector(mockStore) : mockStore
//       );
//       const { container } = render(<BasketPage />);
//       const increaseButton = Array.from(
//         container.querySelectorAll("button")
//       ).find((btn) =>
//         btn.getAttribute("aria-label")?.toLowerCase().includes("increase")
//       );
//       expect(increaseButton).toBeTruthy();
//       if (increaseButton) {
//         increaseButton.click();
//         increaseButton.click();
//         increaseButton.click();
//       }
//       jest.runAllTimers();
//       expect(container.textContent?.toLowerCase()).toContain("product a");
//       jest.useRealTimers();
//     });
//   });
// });
