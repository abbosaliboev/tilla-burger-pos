'use client';

import { useState, useEffect, useCallback } from 'react';
import { categories, menuItems } from '@/lib/menu';
import { CartItem, MenuItem, Order, PaymentMethod, TableSession } from '@/lib/types';
import { saveOrder, formatPrice } from '@/lib/storage';
import Link from 'next/link';

const TABLE_COUNT = 5;
const TAKEOUT_COUNT = 3;
const SESSIONS_KEY = 'tilla_burger_sessions';
const ACTIVE_TABLE_KEY = 'tilla_burger_active_table';

function defaultTables(): TableSession[] {
  const tables: TableSession[] = Array.from({ length: TABLE_COUNT }, (_, i) => ({
    id: `table-${i + 1}`,
    name: `Stol ${i + 1}`,
    type: 'dine-in',
    cart: [],
  }));
  for (let i = 1; i <= TAKEOUT_COUNT; i++) {
    tables.push({ id: `takeout-${i}`, name: `Takeout ${i}`, type: 'takeout', cart: [] });
  }
  return tables;
}

function loadTables(): TableSession[] {
  if (typeof window === 'undefined') return defaultTables();
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return defaultTables();
    const saved: TableSession[] = JSON.parse(raw);
    // merge: keep structure, restore carts
    return defaultTables().map((t) => {
      const found = saved.find((s) => s.id === t.id);
      return found ? { ...t, cart: found.cart, openedAt: found.openedAt } : t;
    });
  } catch {
    return defaultTables();
  }
}

function saveTables(tables: TableSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(tables));
}

const methodLabel: Record<PaymentMethod, string> = {
  cash: '💵 Naqd pul',
  card: '💳 Karta',
  transfer: '📲 Transfer',
};

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState('pizza');
  const [tables, setTables] = useState<TableSession[]>(loadTables);
  const [activeTableId, setActiveTableId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'takeout-1';
    return localStorage.getItem(ACTIVE_TABLE_KEY) || 'takeout-1';
  });
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) +
          ' · ' +
          now.toLocaleDateString('ko-KR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    tick();
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, []);

  // localStorage ga saqlash + state ni yangilash
  const persistTables = (updater: (prev: TableSession[]) => TableSession[]) => {
    setTables((prev) => {
      const next = updater(prev);
      saveTables(next);
      return next;
    });
  };

  const persistActiveTable = (id: string) => {
    setActiveTableId(id);
    if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_TABLE_KEY, id);
  };

  const activeTable = tables.find((t) => t.id === activeTableId) ?? tables[0];
  const cart = activeTable.cart;
  const filteredItems = menuItems.filter((item) => item.category === activeCategory);
  const total = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const updateTableCart = useCallback(
    (tableId: string, updater: (cart: CartItem[]) => CartItem[]) => {
      persistTables((prev) =>
        prev.map((t) => {
          if (t.id !== tableId) return t;
          const newCart = updater(t.cart);
          return {
            ...t,
            cart: newCart,
            openedAt: !t.openedAt && newCart.length > 0 ? new Date().toISOString() : t.openedAt,
          };
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const addToCart = (item: MenuItem) => {
    updateTableCart(activeTableId, (prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const changeQty = (itemId: string, delta: number) => {
    updateTableCart(activeTableId, (prev) =>
      prev
        .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const clearTable = (tableId: string) => {
    persistTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, cart: [], openedAt: undefined } : t))
    );
  };

  const confirmPayment = (method: PaymentMethod) => {
    const now = new Date();
    const order: Order = {
      id: Date.now().toString(),
      tableId: activeTable.id,
      tableName: activeTable.name,
      orderType: activeTable.type,
      items: cart,
      subtotal: total,
      total,
      paymentMethod: method,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };
    saveOrder(order);
    setLastOrder(order);
    clearTable(activeTableId);
    setShowPayment(false);
    setShowReceipt(true);
  };

  const tableTotal = (t: TableSession) =>
    t.cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  const tableItemCount = (t: TableSession) =>
    t.cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-amber-400">🍔 Tilla Burger</span>
          <span className="text-gray-500 text-sm">{currentTime}</span>
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
          <div className="flex flex-wrap gap-2 p-3 bg-gray-900 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
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
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2">
              {filteredItems.map((item) => {
                const inCart = cart.find((c) => c.item.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-h-[100px] active:scale-95 ${
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
                    <span className="text-3xl mb-1">
                      {categories.find((c) => c.id === item.category)?.emoji}
                    </span>
                    <span className="font-semibold text-xs text-center leading-tight mb-1 px-1">
                      {item.name}
                    </span>
                    <span className="text-amber-400 font-bold text-xs">
                      {formatPrice(item.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Tables + Cart */}
        <div className="flex flex-col w-80 lg:w-96 bg-gray-900 shrink-0">
          {/* Tab header */}
          <div className="shrink-0 border-b border-gray-800 p-2 space-y-2">

            {/* Takeout x3 — katta, birinchi */}
            <div className="flex gap-1.5">
              {tables
                .filter((t) => t.type === 'takeout')
                .map((t) => {
                  const isActive = t.id === activeTableId;
                  const hasItems = t.cart.length > 0;
                  return (
                    <button
                      key={t.id}
                      onClick={() => persistActiveTable(t.id)}
                      className={`flex-1 flex flex-col items-center justify-center px-2 py-2.5 rounded-xl border-2 font-bold transition-all ${
                        isActive
                          ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                          : hasItems
                          ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-blue-500/50'
                      }`}
                    >
                      <span className="text-xl">🛍️</span>
                      <span className="text-xs font-bold">{t.name}</span>
                      {hasItems ? (
                        <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-white' : 'text-blue-300'}`}>
                          {tableItemCount(t)} ta
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-600">bo&apos;sh</span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Dine-in stollar — kichik qator */}
            <div className="flex gap-1.5 overflow-x-auto">
              {tables
                .filter((t) => t.type === 'dine-in')
                .map((t) => {
                  const hasItems = t.cart.length > 0;
                  const isActive = t.id === activeTableId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => persistActiveTable(t.id)}
                      className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all shrink-0 min-w-[58px] border-2 ${
                        isActive
                          ? 'bg-amber-500 border-amber-400 text-gray-950'
                          : hasItems
                          ? 'bg-green-500/15 border-green-500 text-green-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-base">🪑</span>
                      <span className="text-xs font-bold whitespace-nowrap">{t.name}</span>
                      {hasItems && !isActive && (
                        <span className="text-[10px] font-bold text-green-300">
                          {tableItemCount(t)} ta
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                <span className="text-6xl">{activeTable.type === 'takeout' ? '🛍️' : '🪑'}</span>
                <span className="text-base font-semibold text-gray-400">{activeTable.name} — bo&apos;sh</span>
                <span className="text-sm text-center px-6 text-gray-600">
                  Chap tomondan mahsulot tanlang
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
                        {formatPrice(cartItem.item.price)} × {cartItem.quantity} ={' '}
                        <span className="font-bold">
                          {formatPrice(cartItem.item.price * cartItem.quantity)}
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
                      onClick={() => changeQty(cartItem.item.id, -cartItem.quantity)}
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
                onClick={() => clearTable(activeTableId)}
                disabled={cart.length === 0}
                className="px-4 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition-colors text-sm"
              >
                Tozalash
              </button>
              <button
                onClick={() => setShowPayment(true)}
                disabled={cart.length === 0}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  activeTable.type === 'takeout'
                    ? 'bg-blue-500 hover:bg-blue-400 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-gray-950'
                }`}
              >
                To&apos;lash →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Occupied tables overview bar */}
      {tables.some((t) => t.cart.length > 0) && (
        <div className="shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-2 flex gap-3 overflow-x-auto">
          <span className="text-gray-500 text-xs shrink-0 self-center">Faol:</span>
          {tables
            .filter((t) => t.cart.length > 0)
            .map((t) => (
              <button
                key={t.id}
                onClick={() => persistActiveTable(t.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  t.id === activeTableId
                    ? 'bg-amber-500 text-gray-950'
                    : t.type === 'takeout'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-green-500/20 text-green-400 border border-green-500/40'
                }`}
              >
                <span>{t.name}</span>
                <span className="font-bold">{formatPrice(tableTotal(t))}</span>
              </button>
            ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl">
            <div className="text-center mb-1">
              <p className="text-gray-400 text-sm">{activeTable.name}</p>
              <h3 className="text-xl font-bold">To&apos;lov usulini tanlang</h3>
            </div>
            <div className="text-center text-amber-400 text-3xl font-bold mb-6">
              {formatPrice(total)}
            </div>
            <div className="flex flex-col gap-3 mb-5">
              {(Object.entries(methodLabel) as [PaymentMethod, string][]).map(([method, label]) => (
                <button
                  key={method}
                  onClick={() => confirmPayment(method)}
                  className="py-5 rounded-2xl bg-gray-800 hover:bg-amber-500 hover:text-gray-950 font-bold text-xl transition-all active:scale-95 border-2 border-gray-700 hover:border-amber-500"
                >
                  {label}
                </button>
              ))}
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
              <h3 className="text-xl font-bold text-green-400">To&apos;lov qabul qilindi!</h3>
              <p className="text-gray-400 text-sm mt-1">
                {lastOrder.tableName} · {methodLabel[lastOrder.paymentMethod]}
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 mb-4 space-y-2 max-h-48 overflow-y-auto">
              {lastOrder.items.map((ci) => (
                <div key={ci.item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {ci.item.name} × {ci.quantity}
                  </span>
                  <span className="text-amber-400 font-medium">
                    {formatPrice(ci.item.price * ci.quantity)}
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
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
