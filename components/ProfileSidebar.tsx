'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'next/navigation';

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  token: string;
}

type Tab = 'profile' | 'orders' | 'support';

export default function ProfileSidebar({ onClose, token }: Props) {
  const { user, logout } = useAppStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (tab === 'orders') fetchOrders();
  }, [tab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { /* ignore */ }
    finally { setLoadingOrders(false); }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#0ea5e9', delivered: '#22c55e', cancelled: '#ef4444',
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'orders', label: 'Order History', icon: '📦' },
    { id: 'support', label: 'Support', icon: '💬' },
  ];

  return (
    <div className="sidebar animate-slide-right" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.1rem' }}>Account</h2>
        <button onClick={onClose} style={{
          background: '#222', border: '1px solid #2a2a2a', borderRadius: '8px',
          color: '#888', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem',
        }}>✕</button>
      </div>

      {/* User info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
        padding: '1rem', background: 'rgba(200,169,110,0.08)', borderRadius: '14px',
        border: '1px solid rgba(200,169,110,0.15)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #c8a96e, #a6854a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
        }}>👤</div>
        <div>
          <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user?.name}</p>
          <p style={{ color: '#888', fontSize: '0.78rem' }}>{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', background: '#111', borderRadius: '12px', padding: '4px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '0.5rem 0.25rem', border: 'none', borderRadius: '9px',
            cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', textAlign: 'center',
            background: tab === t.id ? 'linear-gradient(135deg, #c8a96e, #a6854a)' : 'transparent',
            color: tab === t.id ? '#0d0d0d' : '#888', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
          }}>
            <div>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Email', value: user?.email || '' },
              { label: 'Phone', value: user?.phone || 'Not set' },
              { label: 'Role', value: user?.role || '' },
            ].map(field => (
              <div key={field.label} className="glass-light" style={{ padding: '0.85rem 1rem' }}>
                <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{field.label}</p>
                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{field.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loadingOrders ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shimmer" style={{ height: '80px', borderRadius: '12px' }} />
              ))
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
                <p>No orders yet</p>
              </div>
            ) : orders.map(order => (
              <div key={order._id} className="glass-light" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>#{order._id.slice(-6).toUpperCase()}</p>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                </div>
                <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  {order.items.length} items · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </p>
                <p className="gradient-text" style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === 'support' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-light" style={{ padding: '1.25rem' }}>
              <p style={{ fontWeight: '700', marginBottom: '0.4rem' }}>📞 Call Us</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>+91 98765 43210</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>Mon-Sat, 10am - 7pm</p>
            </div>
            <div className="glass-light" style={{ padding: '1.25rem' }}>
              <p style={{ fontWeight: '700', marginBottom: '0.4rem' }}>📧 Email Support</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>support@jsbsons.com</p>
            </div>
            <div className="glass-light" style={{ padding: '1.25rem' }}>
              <p style={{ fontWeight: '700', marginBottom: '0.4rem' }}>💬 WhatsApp</p>
              <a
                href="https://wa.me/919876543210?text=Hello%20JSB%20Sons%2C%20I%20need%20help"
                target="_blank" rel="noreferrer"
                style={{
                  display: 'inline-block', marginTop: '0.4rem',
                  background: '#25d366', color: '#fff', borderRadius: '8px',
                  padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none',
                }}>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="btn-ghost" style={{ marginTop: '1.5rem', width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>
        Sign Out
      </button>
    </div>
  );
}
