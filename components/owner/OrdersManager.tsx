'use client';
import { useState, useEffect, useCallback } from 'react';
import { generateAndShareInvoice } from '@/lib/invoice';

interface OrderItem { name: string; quantity: number; price: number; color: string; }
interface Order {
  _id: string; customerName: string; customerEmail: string; customerPhone: string;
  items: OrderItem[]; totalAmount: number; status: string;
  address: string; paymentMethod: string; notes: string; createdAt: string;
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

interface Props { token: string; }

export default function OrdersManager({ token }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [toast, setToast] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchOrders(); const i = setInterval(fetchOrders, 30000); return () => clearInterval(i); }, [fetchOrders]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateStatus = async (orderId: string, status: string, order: Order) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Order status updated to ${status}`);
      fetchOrders();
      if (selected?._id === orderId) setSelected({ ...selected, status });
      // Auto invoice on delivery
      if (status === 'delivered') {
        generateAndShareInvoice({ ...order, status }, false);
        showToast('Order delivered! Invoice generated.');
      }
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const statusColors: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#0ea5e9', delivered: '#22c55e', cancelled: '#ef4444',
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Live Orders</h2>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Auto-refreshes every 30 seconds</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#111', borderRadius: '12px', padding: '4px' }}>
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '0.4rem 0.75rem', borderRadius: '9px', border: 'none',
              background: filter === s ? 'linear-gradient(135deg, #c8a96e, #a6854a)' : 'transparent',
              color: filter === s ? '#0d0d0d' : '#888', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.75rem', textTransform: 'capitalize',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer" style={{ height: '80px', borderRadius: '14px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Orders list */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(order => (
              <div key={order._id}
                onClick={() => setSelected(order)}
                style={{
                  background: selected?._id === order._id ? 'rgba(200,169,110,0.08)' : '#1a1a1a',
                  border: `1px solid ${selected?._id === order._id ? 'rgba(200,169,110,0.4)' : '#2a2a2a'}`,
                  borderRadius: '14px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>#{order._id.slice(-6).toUpperCase()}</p>
                    <p style={{ color: '#888', fontSize: '0.78rem' }}>{order.customerName} · {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                    <p className="gradient-text" style={{ fontWeight: '800', fontSize: '0.95rem', marginTop: '0.25rem' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <p style={{ color: '#888', fontSize: '0.78rem' }}>
                  {order.items.length} items · {order.paymentMethod}
                </p>
              </div>
            ))}
          </div>

          {/* Order detail */}
          {selected && (
            <div style={{ flex: '1 1 320px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1rem' }}>#{selected._id.slice(-6).toUpperCase()}</h3>
                <button onClick={() => setSelected(null)} style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#888', cursor: 'pointer', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>✕</button>
              </div>

              {/* Customer info */}
              <div className="glass-light" style={{ padding: '0.875rem', marginBottom: '1rem' }}>
                <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Customer</p>
                <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{selected.customerName}</p>
                <p style={{ color: '#888', fontSize: '0.78rem' }}>{selected.customerEmail}</p>
                {selected.customerPhone && <p style={{ color: '#888', fontSize: '0.78rem' }}>{selected.customerPhone}</p>}
                {selected.address && <p style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.25rem' }}>{selected.address}</p>}
              </div>

              {/* Items */}
              <div className="glass-light" style={{ padding: '0.875rem', marginBottom: '1rem' }}>
                <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Items</p>
                {selected.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#ccc' }}>{item.name} × {item.quantity}</span>
                    <span style={{ color: '#c8a96e', fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                  <span>Total</span>
                  <span className="gradient-text">₹{selected.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status update */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Update Status</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(selected._id, s, selected)} style={{
                      padding: '0.35rem 0.75rem', borderRadius: '999px', border: `1px solid ${selected.status === s ? statusColors[s] : '#2a2a2a'}`,
                      background: selected.status === s ? `${statusColors[s]}22` : 'transparent',
                      color: selected.status === s ? statusColors[s] : '#888',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600',
                      textTransform: 'capitalize', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Invoice & WhatsApp */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => generateAndShareInvoice(selected, false)} className="btn-ghost" style={{ flex: 1, fontSize: '0.8rem', padding: '0.55rem' }}>
                  📄 Invoice PDF
                </button>
                {selected.customerPhone && (
                  <button onClick={() => generateAndShareInvoice(selected, true)} style={{
                    flex: 1, background: '#25d366', color: '#fff', border: 'none',
                    borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem',
                    fontWeight: '600', padding: '0.55rem', fontFamily: 'Inter, sans-serif',
                  }}>
                    💬 WhatsApp
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="toast" style={{ borderLeft: '3px solid #c8a96e' }}>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{toast}</p>
        </div>
      )}
    </div>
  );
}
