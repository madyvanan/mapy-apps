export type UserRole = 'customer' | 'restaurant' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  mail_verify_link_sent?: boolean;
  mail_verified?: boolean;
  mobile_verified?: boolean;
}

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  cuisineTypes: string[];
  logo?: string;
  coverImage?: string;
  address: { street: string; city: string; state: string; pincode: string };
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  deliveryRadius: number;
  minOrder: number;
  deliveryFee: number;
  avgDeliveryTime: number;
  isVerified: boolean;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  tags: string[];
  customizations: { name: string; options: { label: string; extraPrice: number }[] }[];
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: { name: string; option: string; extraPrice: number }[];
  subtotal: number;
}

export interface Cart {
  restaurantId: string;
  items: CartItem[];
  totalAmount: number;
}

export interface Order {
  _id: string;
  restaurantId: string | Restaurant;
  items: CartItem[];
  deliveryAddress: Omit<Address, '_id' | 'label' | 'isDefault'>;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  totalAmount: number;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  error?: { code: string; message: string };
}
