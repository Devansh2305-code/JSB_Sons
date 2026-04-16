'use client';
import { Product } from '@/app/customer/page';
import { useAppStore } from '@/store/appStore';

interface Props {
  product: Product;
  onAddToCart: (p: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const cart = useAppStore(s => s.cart);
  const inCart = cart.find(c => c.productId === product._id);
  const outOfStock = product.stock === 0;

  return (
    <div className="product-card animate-fade-in">
      {/* Image */}
      <div style={{
        height: '200px', background: '#1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {product.image ? (
          <img src={product.image} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '4rem', opacity: 0.3 }}>👕</span>
        )}
        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: 'rgba(239,68,68,0.9)', color: '#fff', padding: '0.3rem 0.8rem',
              borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
            }}>OUT OF STOCK</span>
          </div>
        )}
        {/* Color swatch */}
        <div style={{
          position: 'absolute', top: '0.7rem', right: '0.7rem',
          background: 'rgba(0,0,0,0.7)', borderRadius: '8px',
          padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: '#c8a96e',
          backdropFilter: 'blur(4px)', fontWeight: '600',
        }}>{product.color}</div>
      </div>

      {/* Info */}
      <div style={{ padding: '1rem' }}>
        <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.3rem', lineHeight: 1.3 }}>
          {product.name}
        </h4>
        {product.category && (
          <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.6rem' }}>{product.category}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <div>
            <p className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: '800' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </p>
            <p style={{ color: '#888', fontSize: '0.72rem' }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>
          <button
            onClick={() => !outOfStock && onAddToCart(product)}
            disabled={outOfStock}
            style={{
              background: outOfStock ? '#2a2a2a' : inCart ? 'rgba(200,169,110,0.2)' : 'linear-gradient(135deg, #c8a96e, #a6854a)',
              border: inCart && !outOfStock ? '1px solid #c8a96e' : 'none',
              color: outOfStock ? '#555' : inCart ? '#c8a96e' : '#0d0d0d',
              borderRadius: '10px', padding: '0.5rem 0.9rem',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '0.8rem', transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}>
            {inCart ? '✓ In Cart' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
