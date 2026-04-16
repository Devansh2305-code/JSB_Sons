'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, CartItem } from '@/store/appStore';
import CustomerNav from '@/components/CustomerNav';
import ProductCard from '@/components/ProductCard';
import CartPanel from '@/components/CartPanel';
import ProfileSidebar from '@/components/ProfileSidebar';
import CheckoutModal from '@/components/CheckoutModal';

export interface Product {
  _id: string;
  name: string;
  color: string;
  stock: number;
  price: number;
  image: string;
  barcode: string;
  category: string;
  description: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, token, cart } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/');
    }
  }, [user, router]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddToCart = (product: Product) => {
    const item: CartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      color: product.color,
      image: product.image,
      stock: product.stock,
    };
    useAppStore.getState().addToCart(item);
    showToast(`${product.name} added to cart!`);
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <CustomerNav
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
        search={search}
        onSearch={setSearch}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(200,169,110,0.12) 0%, rgba(166,133,74,0.06) 100%)',
          border: '1px solid rgba(200,169,110,0.2)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <p style={{ color: '#c8a96e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
              Welcome back
            </p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              Hello, {user.name.split(' ')[0]} 👋
            </h2>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              Discover our latest clothing collection
            </p>
          </div>
          <div style={{
            background: 'rgba(200,169,110,0.15)', borderRadius: '16px',
            padding: '1.25rem 2rem', textAlign: 'center',
          }}>
            <p style={{ color: '#888', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cart Total</p>
            <p className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800' }}>
              ₹{cartTotal.toLocaleString('en-IN')}
            </p>
            <p style={{ color: '#888', fontSize: '0.78rem' }}>{cartCount} items</p>
          </div>
        </div>

        {/* Products grid */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
            {search ? `Results for "${search}"` : 'All Products'}
            <span style={{ color: '#888', fontWeight: '400', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
              ({products.length})
            </span>
          </h3>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: '300px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No products found</p>
            <p style={{ fontSize: '0.85rem' }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {/* Cart Panel */}
      {cartOpen && (
        <>
          <div className="overlay" onClick={() => setCartOpen(false)} />
          <CartPanel
            onClose={() => setCartOpen(false)}
            onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
          />
        </>
      )}

      {/* Profile Sidebar */}
      {profileOpen && (
        <>
          <div className="overlay" onClick={() => setProfileOpen(false)} />
          <ProfileSidebar onClose={() => setProfileOpen(false)} token={token || ''} />
        </>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
          token={token || ''}
          onSuccess={(orderId) => {
            setCheckoutOpen(false);
            showToast(`Order #${orderId.slice(-6).toUpperCase()} placed successfully!`);
          }}
        />
      )}

      {/* Toast  */}
      {toast && (
        <div className="toast" style={{ borderLeft: '3px solid #c8a96e' }}>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{toast}</p>
        </div>
      )}
    </div>
  );
}
