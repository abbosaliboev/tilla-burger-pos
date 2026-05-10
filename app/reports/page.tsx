'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { getOrders, formatPrice } from '@/lib/storage';
import { fullItemName } from '@/lib/menu';
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

function getLast14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });
}

function shortDate(d: string) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

function isToday(d: string) {
  return d === new Date().toISOString().split('T')[0];
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('ko-KR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-amber-400 font-bold">{formatPrice(payload[0].value)}</p>
        <p className="text-gray-500 text-xs">{payload[0].payload.count} ta buyurtma</p>
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [sidebarDates, setSidebarDates] = useState<string[]>([]);

  useEffect(() => {
    const all = getOrders();
    setAllOrders(all);
    const today = new Date().toISOString().split('T')[0];
    const dateSet = new Set(all.map((o) => o.date));
    dateSet.add(today);
    setSidebarDates([...dateSet].sort((a, b) => b.localeCompare(a)));
  }, []);

  const orders = allOrders.filter((o) => o.date === selectedDate);

  // KPI
  const total = orders.reduce((s, o) => s + o.total, 0);
  const dineInTotal = orders.filter((o) => o.orderType === 'dine-in').reduce((s, o) => s + o.total, 0);
  const takeoutTotal = orders.filter((o) => o.orderType === 'takeout').reduce((s, o) => s + o.total, 0);

  const byMethod = orders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.total;
    return acc;
  }, {} as Record<PaymentMethod, number>);

  // 14-day chart data
  const chartData = getLast14Days().map((d) => {
    const dayOrders = allOrders.filter((o) => o.date === d);
    return {
      date: shortDate(d),
      fullDate: d,
      total: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
      isToday: isToday(d),
      isSelected: d === selectedDate,
    };
  });

  // Top items with full names
  const topItems = () => {
    const counts: Record<string, { fullName: string; qty: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((ci) => {
        const key = ci.item.id;
        if (!counts[key]) {
          counts[key] = {
            fullName: fullItemName(ci.item.category, ci.item.name),
            qty: 0,
            revenue: 0,
          };
        }
        counts[key].qty += ci.quantity;
        counts[key].revenue += ci.item.price * ci.quantity;
      });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty);
  };

  const items = topItems();
  const maxQty = items[0]?.qty || 1;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm transition-colors">
            ← Kassa
          </Link>
          <div>
            <span className="font-bold text-lg">📊 Kunlik Hisobot</span>
            <p className="text-xs text-gray-500 mt-0.5">
              {isToday(selectedDate) ? '📅 Bugun' : formatDate(selectedDate)}
              {orders.length > 0 && (
                <span className="ml-2 text-amber-400 font-bold">{formatPrice(total)}</span>
              )}
            </p>
          </div>
        </div>
        <Link
          href="/reports/hourly"
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm transition-colors shrink-0"
        >
          ⏰ Soatlik tahlil
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: dates */}
        <div className="w-40 bg-gray-900 border-r border-gray-800 shrink-0 overflow-y-auto">
          <div className="p-2 space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-semibold px-2 pt-1 pb-1">Sanalar</p>
            {sidebarDates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                  d === selectedDate
                    ? 'bg-amber-500 text-gray-950'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                {isToday(d) ? '📅 Bugun' : formatDate(d)}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-4">
          {orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
              <span className="text-5xl">📭</span>
              <span className="text-sm">
                {isToday(selectedDate) ? 'Bugun hali buyurtma yo\'q' : `${formatDate(selectedDate)} uchun buyurtma topilmadi`}
              </span>
            </div>
          )}

          <div className="max-w-5xl mx-auto space-y-5">
            {/* KPI cards */}
            {orders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 sm:col-span-1 col-span-2">
                  <p className="text-gray-400 text-xs mb-1">Jami tushum</p>
                  <p className="text-amber-400 font-bold text-2xl">{formatPrice(total)}</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Buyurtmalar</p>
                  <p className="text-white font-bold text-xl">{orders.length} ta</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {orders.length > 0 ? formatPrice(Math.round(total / orders.length)) + ' o\'rtacha' : ''}
                  </p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">🪑 Dine-in</p>
                  <p className="text-green-400 font-bold text-lg">{formatPrice(dineInTotal)}</p>
                  <p className="text-gray-500 text-xs">{orders.filter((o) => o.orderType === 'dine-in').length} ta</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">🛍️ Takeout</p>
                  <p className="text-blue-400 font-bold text-lg">{formatPrice(takeoutTotal)}</p>
                  <p className="text-gray-500 text-xs">{orders.filter((o) => o.orderType === 'takeout').length} ta</p>
                </div>
              </div>
            )}

            {/* 14-day chart — har doim ko'rinadi */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <h3 className="font-bold mb-4 text-gray-300 text-sm">
                📈 So&apos;nggi 14 kun — kunlik savdo
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barCategoryGap="25%"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(e: any) => { if (e?.activePayload?.[0]) setSelectedDate(e.activePayload[0].payload.fullDate); }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v === 0 ? '0' : `₩${(v / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.isSelected
                            ? '#f59e0b'
                            : entry.isToday
                            ? '#3b82f6'
                            : entry.total > 0
                            ? '#4b5563'
                            : '#1f2937'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-1 text-center">
                Grafik ustunlariga bosib sana tanlashingiz mumkin · <span className="text-amber-400">■</span> Tanlangan · <span className="text-blue-400">■</span> Bugun
              </p>
            </div>

            {orders.length > 0 && (
              <>
                {/* Payment methods */}
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <h3 className="font-bold mb-3 text-gray-300 text-sm">💳 To&apos;lov usullari</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(['cash', 'card', 'transfer'] as PaymentMethod[]).map((m) => (
                      <div key={m} className="bg-gray-800 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-xs mb-1">{methodLabel[m]}</p>
                        <p className={`font-bold text-base ${methodColor[m]}`}>
                          {byMethod[m] ? formatPrice(byMethod[m]) : '₩0'}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {orders.filter((o) => o.paymentMethod === m).length} ta buyurtma
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top items with full names + bar */}
                {items.length > 0 && (
                  <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <h3 className="font-bold mb-3 text-gray-300 text-sm">🏆 Sotilgan mahsulotlar</h3>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={item.fullName} className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs font-bold w-5 text-right shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">{item.fullName}</span>
                              <div className="flex items-center gap-3 shrink-0 ml-2">
                                <span className="text-amber-400 font-bold text-sm">{item.qty} ta</span>
                                <span className="text-gray-400 text-xs w-24 text-right">{formatPrice(item.revenue)}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-amber-500"
                                style={{ width: `${(item.qty / maxQty) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order list */}
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <h3 className="font-bold mb-3 text-gray-300 text-sm">
                    🧾 Buyurtmalar ro&apos;yxati ({orders.length} ta)
                  </h3>
                  <div className="space-y-2">
                    {[...orders].reverse().map((order) => (
                      <div key={order.id} className="bg-gray-800 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">
                              {new Date(order.timestamp).toLocaleTimeString('ko-KR', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              order.orderType === 'takeout'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
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
                            <span key={ci.item.id}
                              className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">
                              {fullItemName(ci.item.category, ci.item.name)} ×{ci.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
