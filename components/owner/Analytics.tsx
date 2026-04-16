'use client';
import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  statusCounts: Record<string, number>;
}

interface Props { token: string; }

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#0ea5e9', '#22c55e', '#ef4444'];

export default function Analytics({ token }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setData(d);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token, range]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const statCards = data ? [
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: '#c8a96e' },
    { label: 'Total Orders', value: data.totalOrders, icon: '📦', color: '#3b82f6' },
    { label: 'Avg Order Value', value: `₹${Math.round(data.avgOrderValue).toLocaleString('en-IN')}`, icon: '📈', color: '#22c55e' },
    { label: 'Delivered', value: data.statusCounts.delivered || 0, icon: '✅', color: '#8b5cf6' },
  ] : [];

  const pieData = data ? Object.entries(data.statusCounts).map(([name, value]) => ({ name, value })) : [];

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Sales Analytics</h2>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Business overview and insights</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#111', borderRadius: '12px', padding: '4px' }}>
          {[
            { v: '7', l: '7 Days' },
            { v: '30', l: '30 Days' },
            { v: '90', l: '3 Months' },
          ].map(r => (
            <button key={r.v} onClick={() => setRange(r.v)} style={{
              padding: '0.4rem 0.9rem', borderRadius: '9px', border: 'none',
              background: range === r.v ? 'linear-gradient(135deg, #c8a96e, #a6854a)' : 'transparent',
              color: range === r.v ? '#0d0d0d' : '#888', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}>{r.l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer" style={{ height: '110px', borderRadius: '16px' }} />)}
        </div>
      ) : data && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {statCards.map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
                  <p style={{ color: '#888', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                </div>
                <p style={{ fontWeight: '800', fontSize: '1.5rem', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '1.5rem', minWidth: 0 }}>
              <p style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>📈 Revenue Over Time</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.dailyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c8a96e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c8a96e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#444" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="#444" tick={{ fill: '#888', fontSize: 11 }} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#f0f0f0' }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#c8a96e" strokeWidth={2} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '1.5rem', minWidth: 0 }}>
              <p style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>📊 Order Status</p>
              {pieData.every(d => d.value === 0) ? (
                <div style={{ textAlign: 'center', paddingTop: '3rem', color: '#888' }}>No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#f0f0f0' }} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#888' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top products bar chart */}
          {data.topProducts.length > 0 && (
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '1.5rem' }}>
              <p style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>🏆 Top Products by Revenue</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.topProducts} layout="vertical">
                  <XAxis type="number" stroke="#444" tick={{ fill: '#888', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <YAxis type="category" dataKey="name" width={120} stroke="#444" tick={{ fill: '#ccc', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', color: '#f0f0f0' }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#c8a96e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
