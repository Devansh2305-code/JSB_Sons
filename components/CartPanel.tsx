'use client';
import { useAppStore } from '@/store/appStore';

interface Props {
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartPanel({ onClose, onCheckout }: Props) {
  const { cart, updateCartQty, removeFromCart } = useAppStore();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="sidebar animate-slide-right" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.2rem' }}>🛒 Your Cart</h2>
        <button onClick={onClose} style={{
          background: '#222', border: '1px solid #2a2a2a', borderRadius: '8px',
          color: '#888', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem',
        }}>✕ Close</button>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🛒</div>
            <p style={{ fontWeight: '600' }}>Your cart is empty</p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Add products to get started</p>
          </div>
        ) : cart.map(item => (
          <div key={item.productId} className="glass-light" style={{ padding: '0.85rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Image */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '10px', background: '#1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
            }}>
              {item.image
                ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '1.5rem' }}>👕</span>}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: '600', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
              <p style={{ color: '#888', fontSize: '0.75rem' }}>{item.color}</p>
              <p className="gradient-text" style={{ fontWeight: '700', fontSize: '0.9rem' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
            </div>

            {/* Qty controls */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <button onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #2a2a2a',
                  background: '#222', color: '#c8a96e', cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                }}>+</button>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#c8a96e' }}>{item.quantity}</span>
              <button onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #2a2a2a',
                  background: '#222', color: '#888', cursor: 'pointer', fontWeight: '700', fontSize: '1rem',
                }}>−</button>
            </div>

            {/* Remove */}
            <button onClick={() => removeFromCart(item.productId)} style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', color: '#ef4444', cursor: 'pointer', padding: '0.4rem',
              fontSize: '0.75rem',
            }}>🗑️</button>
          </div>
        ))}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #2a2a2a', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', color: '#888' }}>
            <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.05rem', fontWeight: '700' }}>
            <span>Total</span>
            <span className="gradient-text">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <button className="btn-gold" onClick={onCheckout} style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}>
            Proceed to Checkout →
          </button>
        </div>
      )}
    </div>
  );
}
