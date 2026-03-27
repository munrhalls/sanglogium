// Test utilities for homepage testing

export interface MockProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  image: {
    asset: { url: string };
    alt: string;
  };
  slug: { current: string };
}

export const mockProduct: MockProduct = {
  _id: 'test-product-1',
  name: 'Test Headphone Model',
  brand: 'TestBrand',
  displayPrice: 299.99,
  image: { 
    asset: { url: '/test-image.jpg' }, 
    alt: 'Test product image' 
  },
  slug: { current: 'test-headphone-model' }
};

export const mockDacProduct: MockProduct = {
  _id: 'test-dac-1',
  name: 'Test DAC Model',
  brand: 'TestDACBrand',
  displayPrice: 599.99,
  image: { 
    asset: { url: '/test-dac-image.jpg' }, 
    alt: 'Test DAC product image' 
  },
  slug: { current: 'test-dac-model' }
};

export const mockIemProduct: MockProduct = {
  _id: 'test-iem-1',
  name: 'Test IEM Model',
  brand: 'TestIEMBrand',
  displayPrice: 199.99,
  image: { 
    asset: { url: '/test-iem-image.jpg' }, 
    alt: 'Test IEM product image' 
  },
  slug: { current: 'test-iem-model' }
};

export const mockAccessoryProduct: MockProduct = {
  _id: 'test-accessory-1',
  name: 'Test Accessory Model',
  brand: 'TestAccessoryBrand',
  displayPrice: 49.99,
  image: { 
    asset: { url: '/test-accessory-image.jpg' }, 
    alt: 'Test accessory product image' 
  },
  slug: { current: 'test-accessory-model' }
};
