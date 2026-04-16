'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateAndShareInvoice } from '@/lib/invoice';

interface Product {
  _id: string; name: string; color: string; price: number; stock: number;
  image: string; barcode: string; category: string;
}

interface BillItem {
  productId: string; name: string; price: number; quantity: number;
  color: string; image: string; stock: number;
}

interface Props { token: string; }

export default function BillingSystem({ token }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [lastBill, setLastBill] = useState<{id: string; total: number} | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const addToBill = useCallback((product: Product, qty = 1) => {
    setBillItems(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) {
        return prev.map(i => i.productId === product._id
          ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) }
          : i);
      }
      return [...prev, {
        productId: product._id, name: product.name, price: product.price,
        quantity: qty, color: product.color, image: product.image, stock: product.stock,
      }];
    });
    showToast(`${product.name} added to bill`);
  }, []);

  const handleBarcodeSearch = async (code: string) => {
    if (!code.trim()) return;
    // Search locally first
    const local = products.find(p => p.barcode === code.trim());
    if (local) { addToBill(local); setBarcodeInput(''); return; }
    // Fetch from API
    const res = await fetch(`/api/products?barcode=${encodeURIComponent(code.trim())}`);
    const data = await res.json();
    const found = data.products?.[0];
    if (found) { addToBill(found); setBarcodeInput(''); }
    else showToast('Product not found for this barcode');
  };

  const startCameraScanner = async () => {
    if (typeof window === 'undefined') return;
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const qr = new Html5Qrcode('qr-scanner-area');
      html5QrRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 120 } },
        async (decodedText: string) => {
          await handleBarcodeSearch(decodedText);
          await qr.stop();
          setScanning(false);
          html5QrRef.current = null;
        },
        undefined
      );
    } catch (err) {
      console.error(err);
      setScanning(false);
      showToast('Camera not available. Use barcode input instead.');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (html5QrRef.current as any).stop?.();
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  const total = billItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async (shareWhatsApp: boolean) => {
    if (billItems.length === 0) { showToast('Add items to bill first'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: billItems.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, color: i.color, image: i.image })),
          totalAmount: total,
          customerName,
          customerPhone,
          paymentMethod,
          address: 'In-store',
          notes: 'POS Sale',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const fakeOrder = {
        _id: data.order._id,
        customerName,
        customerPhone,
        items: billItems,
        totalAmount: total,
        paymentMethod,
        status: 'delivered',
        createdAt: new Date().toISOString(),
      };
      generateAndShareInvoice(fakeOrder, shareWhatsApp);
      setLastBill({ id: data.order._id, total });
      setBillItems([]);
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      showToast('Bill generated successfully!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Checkout failed');
    }
    setSaving(false);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').toLowerCase().includes(search.toLowerCase()) ||
    p.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>🧾 POS Billing System</h2>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>Scan barcodes or search products to create bills</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Product search + scanner */}
        <div>
          {/* Barcode scanner controls */}
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.9rem' }}>📷 Barcode Scanner</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <input
                ref={barcodeRef}
                className="input-gold"
                style={{ flex: 1, minWidth: '180px' }}
                placeholder="Type or scan barcode..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBarcodeSearch(barcodeInput)}
              />
              <button className="btn-gold" onClick={() => handleBarcodeSearch(barcodeInput)}>
                🔍 Search
              </button>
              <button
                onClick={scanning ? stopScanner : startCameraScanner}
                style={{
                  background: scanning ? 'rgba(239,68,68,0.15)' : 'rgba(200,169,110,0.15)',
                  border: `1px solid ${scanning ? 'rgba(239,68,68,0.4)' : 'rgba(200,169,110,0.4)'}`,
                  color: scanning ? '#ef4444' : '#c8a96e',
                  borderRadius: '10px', padding: '0.6rem 1rem',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
                }}>
                {scanning ? '⏹️ Stop Camera' : '📷 Camera Scan'}
              </button>
            </div>

            {/* Camera preview area */}
            <div id="qr-scanner-area" ref={scannerRef} style={{ display: scanning ? 'block' : 'none', borderRadius: '12px', overflow: 'hidden', maxHeight: '280px' }} />
          </div>

          {/* Product search & grid */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>🔍</span>
            <input className="input-gold" style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by name or color..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {filtered.map(p => (
              <button key={p._id} onClick={() => addToBill(p)}
                disabled={p.stock === 0}
                style={{
                  background: p.stock === 0 ? '#111' : '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px', padding: '0.875rem', cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                  textAlign: 'left', transition: 'all 0.2s', opacity: p.stock === 0 ? 0.5 : 1,
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => { if (p.stock > 0) (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8a96e'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'; }}>
                <div style={{ width: '100%', height: '80px', background: '#111', borderRadius: '8px', marginBottom: '0.6rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem', opacity: 0.3 }}>👕</span>}
                </div>
                <p style={{ fontWeight: '600', fontSize: '0.78rem', color: '#ccc', lineHeight: 1.3, marginBottom: '0.25rem' }}>{p.name}</p>
                <p style={{ color: '#c8a96e', fontWeight: '700', fontSize: '0.85rem' }}>₹{p.price.toLocaleString('en-IN')}</p>
                <p style={{ color: '#888', fontSize: '0.68rem' }}>{p.stock > 0 ? `${p.stock} left` : 'Out of stock'}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Bill */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '1.5rem', position: 'sticky', top: '80px' }}>
          <p style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1.25rem' }}>🧾 Current Bill</p>

          {/* Customer info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <input className="input-gold" placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            <input className="input-gold" placeholder="Phone (+91...)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
            <select className="input-gold" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>

          {/* Bill items */}
          <div style={{ minHeight: '120px', maxHeight: '260px', overflowY: 'auto', marginBottom: '1rem' }}>
            {billItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧾</div>
                <p style={{ fontSize: '0.82rem' }}>Scan or select products</p>
              </div>
            ) : billItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #2a2a2a' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <p style={{ color: '#888', fontSize: '0.72rem' }}>₹{item.price.toLocaleString('en-IN')} each</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => setBillItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                    style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #2a2a2a', background: '#222', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>−</button>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#c8a96e', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => setBillItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i))}
                    style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #2a2a2a', background: '#222', color: '#c8a96e', cursor: 'pointer', fontSize: '0.9rem' }}>+</button>
                  <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: '600', fontSize: '0.82rem', color: '#c8a96e' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  <button onClick={() => setBillItems(prev => prev.filter(i => i.productId !== item.productId))}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          {billItems.length > 0 && (
            <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem' }}>
                <span>Total</span>
                <span className="gradient-text">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button className="btn-gold" onClick={() => handleCheckout(false)} disabled={saving || billItems.length === 0} style={{ width: '100%', padding: '0.8rem' }}>
              {saving ? 'Processing...' : '🧾 Generate Bill & Print'}
            </button>
            {customerPhone && (
              <button onClick={() => handleCheckout(true)} disabled={saving || billItems.length === 0}
                style={{
                  width: '100%', padding: '0.75rem', background: '#25d366', color: '#fff',
                  border: 'none', borderRadius: '10px', cursor: billItems.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '700', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif',
                  opacity: billItems.length === 0 ? 0.5 : 1,
                }}>
                💬 Bill + Send on WhatsApp
              </button>
            )}
            {billItems.length > 0 && (
              <button className="btn-ghost" onClick={() => setBillItems([])} style={{ width: '100%', fontSize: '0.82rem' }}>
                🗑️ Clear Bill
              </button>
            )}
          </div>

          {/* Last bill */}
          {lastBill && (
            <div style={{ marginTop: '1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '0.875rem', textAlign: 'center' }}>
              <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.85rem' }}>✅ Last Bill: #{lastBill.id.slice(-6).toUpperCase()}</p>
              <p style={{ color: '#22c55e', fontSize: '0.78rem' }}>₹{lastBill.total.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast" style={{ borderLeft: '3px solid #c8a96e' }}>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{toast}</p>
        </div>
      )}
    </div>
  );
}
