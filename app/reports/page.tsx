'use client';

import { useState, useEffect } from 'react';
import { getOrders, formatPrice } from '@/lib/storage';
import { Order, PaymentMethod } from '@/lib/types';
import Link from 'next/link';

const methodLabel: Record<PaymentMethod, string> = {
  cash: '💵 Naqd',
  card: '💳 Karta',
  transfer: '📲 Transfer',
};

const methodColor: Record<PaymentMethod, string> = {
  cash: 'text-green-400',
  card: 'text-blue-400',
  transfer: 'text-purple-400',
};

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);

  useEffect(() => {
    const all = getOrders();
    const today = new Date().toISOString().split('T')[0];
    const dateSet = new Set(all.map((o) => o.date));
    dateSet.add(today); // bugun har doim ko'rinsin
    const dates = [...dateSet].sort((a, b) => b.localeCompare(a));
    setAllDates(dates);
    setOrders(all.filter((o) => o.date === selectedDate));
  }, [selectedDate]);

  const total = orders.reduce((s, o) => s + o.total, 0);
  const dineInTotal = orders.filter((o) => o.orderType === 'dine-in').reduce((s, o) => s + o.total, 0);
  const takeoutTotal = orders.filter((o) => o.orderType === 'takeout').reduce((s, o) => s + o.total, 0);

  const byMethod = orders.reduce(
    (acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.total;
      return acc;
    },
    {} as Record<PaymentMethod, number>
  );

  const topItems = () => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((ci) => {
        if (!counts[ci.item.id]) counts[ci.item.id] = { name: ci.item.name, qty: 0, revenue: 0 };
        counts[ci.item.id].qty += ci.quantity;
        counts[ci.item.id].revenue += ci.item.price * ci.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 8);
  };

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('ko-KR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  const isToday = (d: string) => d === new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm transition-colors"
          >
            ← Kassa
          </Link>
          <div>
            <span className="font-bold text-lg">📊 Kunlik Hisobot</span>
            <p className="text-xs text-gray-500 mt-0.5">
              {isToday(selectedDate) ? '📅 Bugun' : formatDate(selectedDate)}
              {orders.length > 0 && <span className="ml-2 text-amber-400 font-bold">{formatPrice(total)}</span>}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Date sidebar */}
        <div className="lg:w-48 bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-800 shrink-0">
          <div className="p-3">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2 px-2">Sanalar</p>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
              {allDates.length === 0 ? (
                <p className="text-gray-500 text-sm px-2">Hali buyurtma yo&apos;q</p>
              ) : (
                allDates.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                      d === selectedDate
                        ? 'bg-amber-500 text-gray-950'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {isToday(d) ? '📅 Bugun' : formatDate(d)}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
              <span className="text-5xl">📭</span>
              <span>{formatDate(selectedDate)} uchun buyurtma topilmadi</span>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 col-span-2 sm:col-span-1">
                  <p className="text-gray-400 text-xs mb-1">Jami tushum</p>
                  <p className="text-amber-400 font-bold text-xl">{formatPrice(total)}</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Buyurtmalar</p>
                  <p className="text-white font-bold text-xl">{orders.length} ta</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">🪑 Dine-in</p>
                  <p className="text-green-400 font-bold text-base">{formatPrice(dineInTotal)}</p>
                  <p className="text-gray-500 text-xs">{orders.filter((o) => o.orderType === 'dine-in').length} ta</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">🛍️ Takeout</p>
                  <p className="text-blue-400 font-bold text-base">{formatPrice(takeoutTotal)}</p>
                  <p className="text-gray-500 text-xs">{orders.filter((o) => o.orderType === 'takeout').length} ta</p>
                </div>
              </div>

              {/* Payment breakdown */}
              <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <h3 className="font-bold mb-3 text-gray-300">To&apos;lov usullari</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['cash', 'card', 'transfer'] as PaymentMethod[]).map((m) => (
                    <div key={m} className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">{methodLabel[m]}</p>
                      <p className={`font-bold text-base ${methodColor[m]}`}>
                        {byMethod[m] ? formatPrice(byMethod[m]) : '₩0'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {orders.filter((o) => o.paymentMethod === m).length} ta
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top items */}
              {topItems().length > 0 && (
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <h3 className="font-bold mb-3 text-gray-300">Ko&apos;p sotilgan taomlar</h3>
                  <div className="space-y-2">
                    {topItems().map((item, i) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0"
                      >
                        <span className="text-gray-500 text-sm w-5 text-center font-bold">{i + 1}</span>
                        <span className="flex-1 font-medium">{item.name}</span>
                        <span className="text-amber-400 font-bold text-sm">{item.qty} ta</span>
                        <span className="text-gray-400 text-sm">{formatPrice(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order list */}
              <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <h3 className="font-bold mb-3 text-gray-300">
                  Buyurtmalar ro&apos;yxati ({orders.length} ta)
                </h3>
                <div className="space-y-2">
                  {[...orders].reverse().map((order) => (
                    <div key={order.id} className="bg-gray-800 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">
                            {new Date(order.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              order.orderType === 'takeout'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {order.tableName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${methodColor[order.paymentMethod]}`}>
                            {methodLabel[order.paymentMethod]}
                          </span>
                          <span className="text-amber-400 font-bold text-sm">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((ci) => (
                          <span
                            key={ci.item.id}
                            className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300"
                          >
                            {ci.item.name} ×{ci.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
