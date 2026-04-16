'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

type Mode = 'login' | 'register';
type Role = 'customer' | 'owner';

export default function HomePage() {
  const router = useRouter();
  const { setUser, setToken } = useAppStore();
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { ...form, role };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setUser(data.user);
      setToken(data.token);
      router.push(data.user.role === 'owner' ? '/owner' : '/customer');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(200,169,110,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(200,169,110,0.05) 0%, transparent 50%), #0d0d0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px',
        borderRadius: '50%', background: 'rgba(200,169,110,0.04)', filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '8%', width: '200px', height: '200px',
        borderRadius: '50%', background: 'rgba(200,169,110,0.06)', filter: 'blur(40px)',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '20px', marginBottom: '1rem',
            background: 'linear-gradient(135deg, #c8a96e, #a6854a)',
            boxShadow: '0 8px 32px rgba(200,169,110,0.3)',
          }}>
            <span style={{ fontSize: '2rem' }}>👔</span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.4rem', fontWeight: '700', lineHeight: 1.1,
            marginBottom: '0.3rem',
          }}>
            <span className="gradient-text">JSB Sons</span>
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Premium Clothing
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: '2rem' }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: '#111', borderRadius: '12px',
            padding: '4px', marginBottom: '1.5rem', gap: '4px',
          }}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: '9px', border: 'none',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  background: mode === m ? 'linear-gradient(135deg, #c8a96e, #a6854a)' : 'transparent',
                  color: mode === m ? '#0d0d0d' : '#888',
                  fontFamily: 'Inter, sans-serif',
                }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Role selector – only for register */}
          {mode === 'register' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Register as</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['customer', 'owner'] as Role[]).map((r) => (
                  <button key={r} onClick={() => setRole(r)}
                    style={{
                      flex: 1, padding: '0.6rem', border: `1px solid ${role === r ? '#c8a96e' : '#2a2a2a'}`,
                      borderRadius: '10px', background: role === r ? 'rgba(200,169,110,0.1)' : '#1a1a1a',
                      color: role === r ? '#c8a96e' : '#888', cursor: 'pointer', fontWeight: '600',
                      fontSize: '0.85rem', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                    }}>
                    {r === 'customer' ? '🛍️ Customer' : '🏪 Owner'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full Name</label>
                  <input className="input-gold" placeholder="Your full name" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Phone</label>
                  <input className="input-gold" placeholder="+91 XXXXXXXXXX" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
              <input className="input-gold" type="email" placeholder="email@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              <input className="input-gold" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '0.75rem 1rem', color: '#ef4444', fontSize: '0.85rem',
              }}>{error}</div>
            )}

            <button type="submit" className="btn-gold" disabled={loading}
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #0d0d0d', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                  Please wait...
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#888', fontSize: '0.82rem' }}>
              Demo owner: <strong style={{ color: '#c8a96e' }}>owner@jsb.com</strong> / <strong style={{ color: '#c8a96e' }}>owner123</strong>
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#555', fontSize: '0.8rem' }}>
          © 2024 JSB Sons. All rights reserved.
        </p>
      </div>
    </div>
  );
}
