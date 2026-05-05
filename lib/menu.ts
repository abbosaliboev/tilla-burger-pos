import { MenuItem, Category } from './types';

export const categories: Category[] = [
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'lavash', name: 'Lavash', emoji: '🌯' },
  { id: 'hotdog', name: 'Hot Dog', emoji: '🌭' },
  { id: 'burger', name: 'Burger', emoji: '🍔' },
  { id: 'chicken', name: 'Chicken', emoji: '🍗' },
  { id: 'fries', name: 'Set & Fries', emoji: '🍟' },
  { id: 'drinks', name: 'Drinks', emoji: '🥤' },
];

export const menuItems: MenuItem[] = [
  // Pizza
  { id: 'pizza-cheese', name: 'Cheese', price: 8000, category: 'pizza' },
  { id: 'pizza-peperoni', name: 'Peperoni', price: 10000, category: 'pizza' },
  { id: 'pizza-chicken', name: 'Chicken', price: 11000, category: 'pizza' },
  { id: 'pizza-mix', name: 'Pizza Mix', price: 12000, category: 'pizza' },

  // Lavash
  { id: 'lavash-chicken', name: 'Chicken', price: 8500, category: 'lavash' },
  { id: 'lavash-chicken-cheese', name: 'Chicken + Cheese', price: 9500, category: 'lavash' },
  { id: 'lavash-big-tandir', name: 'Big (Tandir)', price: 10000, category: 'lavash' },
  { id: 'lavash-big-tandir-cheese', name: 'Big Tandir Cheese', price: 11000, category: 'lavash' },

  // Hot Dog
  { id: 'hotdog-classic', name: 'Classic (1-sosikali)', price: 6000, category: 'hotdog' },
  { id: 'hotdog-big', name: 'Big (2-sosikali)', price: 8000, category: 'hotdog' },

  // Burger
  { id: 'burger-chicken', name: 'Chicken', price: 7000, category: 'burger' },
  { id: 'burger-lamb', name: "Lamb (Qo'y)", price: 8000, category: 'burger' },
  { id: 'burger-mix', name: 'Mix Burger', price: 9000, category: 'burger' },

  // Chicken
  { id: 'chicken-5pc', name: '5 pc', price: 6000, category: 'chicken' },
  { id: 'chicken-8pc', name: '8 pc', price: 9000, category: 'chicken' },

  // Fries & Set
  { id: 'set-drink-fries', name: 'Drink + Fries', price: 4000, category: 'fries' },
  { id: 'fries-regular', name: 'Fries', price: 2000, category: 'fries' },

  // Drinks
  { id: 'drink-moxito', name: 'Moxito', price: 3000, category: 'drinks' },
  { id: 'drink-kampot', name: 'Kampot', price: 3000, category: 'drinks' },
  { id: 'drink-ayron', name: 'Ayron', price: 3000, category: 'drinks' },
  { id: 'drink-buratino', name: 'Buratino', price: 3000, category: 'drinks' },
  { id: 'drink-gorilla', name: 'Gorilla', price: 3500, category: 'drinks' },
  { id: 'drink-dena', name: 'Dena', price: 4000, category: 'drinks' },
];
