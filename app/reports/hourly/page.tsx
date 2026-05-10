'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { getOrders, formatPrice } from '@/lib/storage';
import { Order } from '@/lib/types';
import Link from 'next/link';

type Period = 'today' | 'week';
type Metric = 'count' | 'revenue';

function buildHourlyData(orders: Order[]) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${h.toString().padStart(2, '0')}:00`,
    count: 0,
    revenue: 0,
  }));
  orders.forEach((o) => {
    const h = new Date(o.timestamp).getHours();
    hours[h].count += 1;
    hours[h].revenue += o.total;
  });
  return hours;
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HourTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-amber-400 font-bold">
        {metric === 'count' ? `${d.count} ta buyurtma` : formatPrice(d.revenue)}
      </p>
      {metric === 'count' && d.revenue > 0 && (
        <p className="text-gray-500 text-xs">{formatPrice(d.revenue)}</p>
      )}
      {metric === 'revenue' && d.count > 0 && (
        <p className="text-gray-500 text-xs">{d.count} ta buyurtma</p>
      )}
    </div>
  );
}

export default function HourlyPage() {
  const [period, setPeriod] = useState<Period>('today');
  const [metric, setMetric] = useState<Metric>('count');
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    setAllOrders(getOrders());
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const last7 = getLast7Days();

  const filtered = period === 'today'
    ? allOrders.filter((o) => o.date === today)
    : allOrders.filter((o) => last7.includes(o.date));

  const data = buildHourlyData(filtered);

  const maxVal = Math.max(...data.map((d) => metric === 'count' ? d.count : d.revenue), 1);

  const peakHour = [...data].sort((a, b) =>
    metric === 'count' ? b.count - a.count : b.revenue - a.revenue
  )[0];

  const activeHours = data.filter((d) => (metric === 'count' ? d.count : d.revenue) > 0);

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const avgPerOrder = filtered.length > 0 ? Math.round(totalRevenue / filtered.length) : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <Link
          href="/reports"
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm transition-colors shrink-0"
        >
          ← Hisobot
        </Link>
        <div>
          <span className="font-bold text-lg">⏰ Soat bo&apos;ylab tahlil</span>
          <p className="text-xs text-gray-500 mt-0.5">Qaysi vaqtda ko&apos;p buyurtma bo&apos;lishini ko&apos;ring</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
              {(['today', 'week'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === p ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p === 'today' ? '📅 Bugun' : '📆 Bu hafta'}
                </button>
              ))}
            </div>

            <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
              {(['count', 'revenue'] as Metric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    metric === m ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m === 'count' ? '🧾 Buyurtmalar' : '💰 Tushum'}
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">Jami buyurtma</p>
              <p className="text-white font-bold text-xl">{filtered.length} ta</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">Eng band soat</p>
              <p className="text-amber-400 font-bold text-xl">
                {filtered.length > 0 ? peakHour.label : '—'}
              </p>
              {filtered.length > 0 && (
                <p className="text-gray-500 text-xs mt-0.5">
                  {metric === 'count' ? `${peakHour.count} ta` : formatPrice(peakHour.revenue)}
                </p>
              )}
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">Faol soatlar</p>
              <p className="text-blue-400 font-bold text-xl">{activeHours.length} soat</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">O&apos;rtacha zakaz</p>
              <p className="text-green-400 font-bold text-xl">
                {filtered.length > 0 ? formatPrice(avgPerOrder) : '—'}
              </p>
            </div>
          </div>

          {/* Main chart */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <h3 className="font-bold mb-4 text-gray-300 text-sm">
              {metric === 'count' ? '🧾 Soat bo\'yicha buyurtmalar soni' : '💰 Soat bo\'yicha tushum'}
              {period === 'week' && (
                <span className="text-gray-500 font-normal ml-2">(7 kun yig&apos;ilgan)</span>
              )}
            </h3>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                <span className="text-5xl">📭</span>
                <span className="text-sm">
                  {period === 'today' ? 'Bugun hali buyurtma yo\'q' : 'Bu hafta buyurtma topilmadi'}
                </span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={1}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) =>
                        metric === 'revenue'
                          ? v === 0 ? '0' : `₩${(v / 1000).toFixed(0)}k`
                          : String(v)
                      }
                      width={metric === 'revenue' ? 50 : 28}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<HourTooltip metric={metric} />}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
                    <Bar
                      dataKey={metric === 'count' ? 'count' : 'revenue'}
                      radius={[4, 4, 0, 0]}
                    >
                      {data.map((entry, i) => {
                        const val = metric === 'count' ? entry.count : entry.revenue;
                        const isPeak = val === maxVal && val > 0;
                        return (
                          <Cell
                            key={i}
                            fill={isPeak ? '#f59e0b' : val > 0 ? '#4b5563' : '#1f2937'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  <span className="text-amber-400">■</span> Eng band soat ·{' '}
                  <span className="text-gray-500">■</span> Faol soat
                </p>
              </>
            )}
          </div>

          {/* Top 5 hours table */}
          {activeHours.length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <h3 className="font-bold mb-3 text-gray-300 text-sm">🏆 Eng band soatlar</h3>
              <div className="space-y-2.5">
                {[...data]
                  .sort((a, b) =>
                    metric === 'count' ? b.count - a.count : b.revenue - a.revenue
                  )
                  .filter((d) => (metric === 'count' ? d.count : d.revenue) > 0)
                  .slice(0, 5)
                  .map((d, i) => {
                    const val = metric === 'count' ? d.count : d.revenue;
                    return (
                      <div key={d.hour} className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs font-bold w-5 text-right shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-gray-300 text-sm font-mono w-14 shrink-0">
                          {d.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all"
                              style={{ width: `${(val / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-amber-400 font-bold text-sm shrink-0 w-28 text-right">
                          {metric === 'count' ? `${d.count} ta` : formatPrice(d.revenue)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
