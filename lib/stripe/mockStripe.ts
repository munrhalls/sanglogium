// Mock Stripe implementation for development
export const mockStripe = {
  checkout: {
    sessions: {
      create: async (params: any) => {
        console.log('=== MOCK STRIPE: Creating session ===');
        console.log('   Params:', JSON.stringify(params, null, 2));
        
        // Return mock session with fake URL
        return {
          id: 'cs_mock_' + Date.now(),
          url: 'https://checkout.stripe.com/mock-session/' + Date.now(),
          payment_status: 'unpaid',
          success_url: params.success_url,
          cancel_url: params.cancel_url,
          line_items: params.line_items,
          metadata: params.metadata
        };
      }
    }
  }
};
