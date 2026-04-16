'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/appStore';

interface Props {
  onClose: () => void;
  token: string;
  onSuccess: (orderId: string) => void;
}

export default function CheckoutModal({ onClose, token, onSuccess }: Props) {
  const { cart, user, clearCart } = useAppStore();
  const [form, setForm] = useState({ phone: user?.phone || '', address: '', paymentMethod: 'COD', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleOrder = async () => {
    if (!form.address) { setError('Please enter delivery address'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, color: i.color, image: i.image })),
          totalAmount: total,
          customerPhone: form.phone,
          address: form.address,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      clearCart();
      onSuccess(data.order._id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ zIndex: 60 }}
    >
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>🧾 Checkout</h2>
          <button onClick={onClose} style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#888', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>✕</button>
        </div>

        {/* Order summary */}
        <div style={{ background: '#111', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#888', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Order Summary</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {cart.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#ccc' }}>{item.name} × {item.quantity}</span>
                <span style={{ color: '#c8a96e', fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
            <span>Total</span>
            <span className="gradient-text" style={{ fontSize: '1.1rem' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Phone Number</label>
            <input className="input-gold" placeholder="+91 XXXXXXXXXX" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Delivery Address *</label>
            <textarea className="input-gold" placeholder="Enter full delivery address..." rows={3}
              value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              style={{ resize: 'none', fontFamily: 'Inter, sans-serif' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment Method</label>
            <select className="input-gold" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="COD">Cash on Delivery</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notes (optional)</label>
            <input className="input-gold" placeholder="Any special instructions..." value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button className="btn-gold" onClick={handleOrder} disabled={loading}
          style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}>
          {loading ? 'Placing Order...' : '🚀 Place Order'}
        </button>
      </div>
    </div>
  );
}
