// Add this to your browser console to see stock/reservation status on product pages
// This helps verify the reservation system is working during manual testing

(function() {
  // Create a floating indicator
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #333;
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    max-width: 300px;
  `;
  
  // Function to update indicator
  function updateIndicator() {
    // Try to get stock info from the page
    const stockElements = document.querySelectorAll('[data-stock], .stock, [data-testid*="stock"]');
    const priceElements = document.querySelectorAll('[data-price], .price, [data-testid*="price"]');
    
    let html = '<strong>Reservation Status</strong><br>';
    
    if (stockElements.length > 0) {
      stockElements.forEach(el => {
        html += `Stock: ${el.textContent}<br>`;
      });
    }
    
    if (priceElements.length > 0) {
      priceElements.forEach(el => {
        html += `Price: ${el.textContent}<br>`;
      });
    }
    
    // Check for basket items
    const basketItems = document.querySelectorAll('[data-testid^="basket-item-"]');
    html += `Basket items: ${basketItems.length}<br>`;
    
    // Check for checkout button
    const checkoutBtn = document.querySelector('[data-testid="checkout-button"]');
    html += `Checkout: ${checkoutBtn ? 'Available' : 'Not available'}<br>`;
    
    indicator.innerHTML = html;
  }
  
  // Add to page
  document.body.appendChild(indicator);
  
  // Update immediately and every second
  updateIndicator();
  setInterval(updateIndicator, 1000);
  
  console.log('Reservation status indicator added. Check top-right corner.');
})();
