import { Order } from './types';

const ORDERS_KEY = 'tilla_burger_orders';

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

export function getOrdersByDate(date: string): Order[] {
  return getOrders().filter((o) => o.date === date);
}

export function getTodayOrders(): Order[] {
  const today = new Date().toISOString().split('T')[0];
  return getOrdersByDate(today);
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('uz-UZ') + " so'm";
}
