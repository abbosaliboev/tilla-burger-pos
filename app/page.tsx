'use client';

import { useState, useEffect } from 'react';
import { categories, menuItems } from '@/lib/menu';
import { CartItem, MenuItem, Order, PaymentMethod } from '@/lib/types';
import { saveOrder, formatPrice } from '@/lib/storage';
import Link from 'next/link';

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState('pizza');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) +
          ' · ' +
          now.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    tick();
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = menuItems.filter((item) => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const changeQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const total = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const confirmPayment = (method: PaymentMethod) => {
    const now = new Date();
    const order: Order = {
      id: Date.now().toString(),
      items: cart,
      subtotal: total,
      total,
      paymentMethod: method,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };
    saveOrder(order);
    setLastOrder(order);
    setCart([]);
    setShowPayment(false);
    setShowReceipt(true);
  };

  const methodLabel: Record<PaymentMethod, string> = {
    cash: '💵 Naqd pul',
    card: '💳 Karta',
    transfer: '📲 Hisob (Transfer)',
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-amber-400">🍔 Tilla Burger</span>
          <span className="text-gray-400 text-sm">{currentTime}</span>
        </div>
        <Link
          href="/reports"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium transition-colors"
        >
          📊 Hisobot
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Menu */}
        <div className="flex flex-col flex-1 overflow-hidden border-r border-gray-800">
          {/* Category tabs */}
          <div className="flex gap-2 p-3 bg-gray-900 overflow-x-auto shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-gray-950 shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Menu items grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map((item) => {
                const inCart = cart.find((c) => c.item.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all min-h-[120px] active:scale-95 ${
                      inCart
                        ? 'bg-amber-500/20 border-amber-500 shadow-amber-500/20 shadow-lg'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-gray-950 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                    <span className="text-4xl mb-2">
                      {categories.find((c) => c.id === item.category)?.emoji}
                    </span>
                    <span className="font-semibold text-sm text-center leading-tight mb-1 px-1">
                      {item.name}
                    </span>
                    <span className="text-amber-400 font-bold text-sm">
                      {item.price.toLocaleString('uz-UZ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div className="flex flex-col w-80 lg:w-96 bg-gray-900 shrink-0">
          <div className="px-4 py-3 border-b border-gray-800 shrink-0">
            <h2 className="font-bold text-lg">
              🛒 Buyurtma{' '}
              {cartCount > 0 && (
                <span className="text-amber-400">({cartCount} ta)</span>
              )}
            </h2>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                <span className="text-6xl">🛒</span>
                <span className="text-base">Buyurtma bo&apos;sh</span>
                <span className="text-sm text-center px-6 text-gray-600">
                  Menyu tugmalariga bosib qo&apos;shing
                </span>
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                {cart.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex items-center gap-2 bg-gray-800 rounded-xl p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{cartItem.item.name}</div>
                      <div className="text-amber-400 text-xs mt-0.5">
                        {cartItem.item.price.toLocaleString('uz-UZ')} × {cartItem.quantity} ={' '}
                        <span className="font-bold">
                          {(cartItem.item.price * cartItem.quantity).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => changeQty(cartItem.item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-red-500/70 flex items-center justify-center font-bold text-lg transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold">{cartItem.quantity}</span>
                      <button
                        onClick={() => changeQty(cartItem.item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-green-500/70 flex items-center justify-center font-bold text-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-red-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & Pay */}
          <div className="p-4 border-t border-gray-800 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Jami:</span>
              <span className="text-amber-400 text-2xl font-bold">{formatPrice(total)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCart([])}
                disabled={cart.length === 0}
                className="px-4 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition-colors text-sm"
              >
                Tozalash
              </button>
              <button
                onClick={() => setShowPayment(true)}
                disabled={cart.length === 0}
                className="flex-1 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-950 text-lg transition-colors"
              >
                To&apos;lash →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold mb-1 text-center">To&apos;lov usulini tanlang</h3>
            <div className="text-center text-amber-400 text-3xl font-bold mb-6">
              {formatPrice(total)}
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {(Object.entries(methodLabel) as [PaymentMethod, string][]).map(
                ([method, label]) => (
                  <button
                    key={method}
                    onClick={() => confirmPayment(method)}
                    className="py-5 rounded-2xl bg-gray-800 hover:bg-amber-500 hover:text-gray-950 font-bold text-xl transition-all active:scale-95 border-2 border-gray-700 hover:border-amber-500"
                  >
                    {label}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setShowPayment(false)}
              className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 font-medium transition-colors text-gray-400"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-2">✅</div>
              <h3 className="text-xl font-bold text-green-400">Buyurtma qabul qilindi!</h3>
              <p className="text-gray-400 text-sm mt-1">
                {methodLabel[lastOrder.paymentMethod]}
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 mb-4 space-y-2 max-h-48 overflow-y-auto">
              {lastOrder.items.map((ci) => (
                <div key={ci.item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {ci.item.name} × {ci.quantity}
                  </span>
                  <span className="text-amber-400 font-medium">
                    {(ci.item.price * ci.quantity).toLocaleString('uz-UZ')}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center font-bold text-lg mb-5 px-1">
              <span>Jami:</span>
              <span className="text-amber-400 text-xl">{formatPrice(lastOrder.total)}</span>
            </div>
            <button
              onClick={() => setShowReceipt(false)}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-lg transition-colors"
            >
              Yangi buyurtma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
