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
