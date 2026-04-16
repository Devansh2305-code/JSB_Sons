'use client';
import { useState, useEffect, useRef } from 'react';

interface Product {
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

interface Props { token: string; }

const CATEGORIES = ['Shirts', 'Pants', 'Kurta', 'Jacket', 'T-Shirt', 'Suit', 'Ethnic', 'Sports', 'Other'];

const emptyForm = { name: '', color: '', stock: '', price: '', image: '', barcode: '', category: 'Other', description: '' };

export default function ProductsManager({ token }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [formError, setFormError] = useState('');
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, color: p.color, stock: String(p.stock), price: String(p.price),
      image: p.image, barcode: p.barcode || '', category: p.category || 'Other', description: p.description || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      setFormError('Product name, price and stock are required.');
      return;
    }
    setFormError('');
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    const url = editing ? `/api/products/${editing._id}` : '/api/products';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast(editing ? 'Product updated!' : 'Product added!');
      setShowModal(false);
      fetchProducts();
    } else {
      const d = await res.json();
      setFormError(d.error || 'Failed to save product. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    showToast('Product deleted');
    fetchProducts();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.color.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Product Catalog</h2>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>{products.length} products total</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>🔍</span>
            <input className="input-gold" style={{ paddingLeft: '2.25rem', width: '220px' }}
              placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-gold" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer" style={{ height: '280px', borderRadius: '16px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No products found</p>
          <button className="btn-gold" onClick={openAdd} style={{ marginTop: '1rem' }}>Add First Product</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(p => (
            <div key={p._id} className="product-card">
              <div style={{ height: '170px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {p.image
                  ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '3.5rem', opacity: 0.3 }}>👕</span>}
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.75)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#c8a96e' }}>
                  {p.color}
                </div>
              </div>
              <div style={{ padding: '0.875rem' }}>
                <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{p.name}</p>
                <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{p.category}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="gradient-text" style={{ fontWeight: '800', fontSize: '1rem' }}>₹{p.price.toLocaleString('en-IN')}</span>
                  <span style={{
                    fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '999px',
                    background: p.stock > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: p.stock > 0 ? '#22c55e' : '#ef4444',
                    border: `1px solid ${p.stock > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    fontWeight: '600',
                  }}>
                    {p.stock > 0 ? `${p.stock} left` : 'Out of stock'}
                  </span>
                </div>
                {p.barcode && (
                  <p style={{ color: '#444', fontSize: '0.68rem', fontFamily: 'monospace', marginBottom: '0.75rem' }}>#{p.barcode}</p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEdit(p)} className="btn-ghost" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="btn-danger" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{ zIndex: 60 }}
        >
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#888', cursor: 'pointer', padding: '0.4rem 0.8rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Image upload */}
              <div>
                <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Product Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '80px', height: '80px', background: '#111', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                  }}>
                    {form.image
                      ? <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '2rem', opacity: 0.3 }}>👕</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="image/*" ref={imgRef} style={{ display: 'none' }} onChange={handleImageChange} />
                    <button className="btn-ghost" onClick={() => imgRef.current?.click()} style={{ width: '100%' }}>
                      📸 Upload Image
                    </button>
                    <p style={{ color: '#555', fontSize: '0.72rem', marginTop: '0.3rem' }}>JPG, PNG, WEBP (max 2MB)</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Product Name *</label>
                  <input className="input-gold" placeholder="e.g. White Formal Shirt" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Color *</label>
                  <input className="input-gold" placeholder="e.g. White" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price (₹) *</label>
                  <input className="input-gold" type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stock *</label>
                  <input className="input-gold" type="number" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</label>
                  <select className="input-gold" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Barcode (optional)</label>
                  <input className="input-gold" placeholder="Auto-generated if empty" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
                <textarea className="input-gold" rows={2} placeholder="Optional product description..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ resize: 'none', fontFamily: 'Inter, sans-serif' }} />
              </div>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '0.75rem 1rem',
                color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem',
              }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-gold" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ borderLeft: '3px solid #c8a96e' }}>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{toast}</p>
        </div>
      )}
    </div>
  );
}
