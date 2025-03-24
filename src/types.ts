
export interface Sandwich {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isCustom?: boolean;
  ingredients?: any[];
  quantity: number;
}

export interface CartItemType extends Sandwich {
  quantity: number;
}

export interface CartContextType {
  cart: CartItemType[];
  addToCart: (item: Sandwich) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  sendOrderNotification: (orderDetails: OrderDetails) => Promise<boolean>;
}

export interface OrderDetails {
  orderItems: CartItemType[];
  customerInfo: CustomerInfo;
  orderDate: string;
  orderTotal: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}
