export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export type OrderType = 'dine-in' | 'takeout';

export interface TableSession {
  id: string;        // 'table-1' ... 'table-5' | 'takeout'
  name: string;      // 'Stol 1' ... | 'Takeout'
  type: OrderType;
  cart: CartItem[];
  openedAt?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  date: string;
}
