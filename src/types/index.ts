export type Category =
  | 'Food Class'
  | 'Pastries'
  | 'Desserts'
  | 'Yogurt Master Class'
  | 'Drink Class'
  | 'Cake Class'
  | 'Soup Class';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: Category;
  price: number;
  image: string;
  available: boolean;
  popular: boolean;
  chefsSpecial: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Settings {
  whatsapp: string;
  deliveryFee: number;
  storeName: string;
}

export interface OrderDetails {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}
