'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import OwnerNav from '@/components/OwnerNav';
import ProductsManager from '@/components/owner/ProductsManager';
import OrdersManager from '@/components/owner/OrdersManager';
import Analytics from '@/components/owner/Analytics';
import BillingSystem from '@/components/owner/BillingSystem';

type Tab = 'analytics' | 'products' | 'orders' | 'billing';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, token } = useAppStore();
  const [tab, setTab] = useState<Tab>('analytics');

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'products', label: 'Products', icon: '👕' },
    { id: 'orders', label: 'Live Orders', icon: '📦' },
    { id: 'billing', label: 'Billing / POS', icon: '🧾' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
      <OwnerNav user={user} />

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '0', background: '#111', borderBottom: '1px solid #1a1a1a',
        overflowX: 'auto', padding: '0 1.5rem',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem 1.5rem', border: 'none', background: 'transparent',
            color: tab === t.id ? '#c8a96e' : '#888', fontWeight: tab === t.id ? '700' : '500',
            cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap',
            borderBottom: `2px solid ${tab === t.id ? '#c8a96e' : 'transparent'}`,
            transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'analytics' && <Analytics token={token || ''} />}
        {tab === 'products' && <ProductsManager token={token || ''} />}
        {tab === 'orders' && <OrdersManager token={token || ''} />}
        {tab === 'billing' && <BillingSystem token={token || ''} />}
      </div>
    </div>
  );
}
