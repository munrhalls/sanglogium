export type Address = {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
};

export type Status = "LOADING" | "FIX" | "CONFIRM" | "ACCEPT";

export type ServerResponse = {
  status: Status;
  address?: Address;
  geocode?: {
    location: {
      latitude: number;
      longitude: number;
    };
  };
  placeId?: string;
  errors?: Record<string, string>;
};

export type ServerProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  _rev: string;
};

export type BasketCheckoutItem = {
  _id: string;
  quantity: number;
};
