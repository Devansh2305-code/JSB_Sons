'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

interface Props {
  cartCount: number;
  onCartClick: () => void;
  onProfileClick: () => void;
  search: string;
  onSearch: (v: string) => void;
}

export default function CustomerNav({ cartCount, onCartClick, onProfileClick, search, onSearch }: Props) {
  const router = useRouter();
  const { logout } = useAppStore();

  return (
    <nav className="nav">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => router.push('/customer')}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #c8a96e, #a6854a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
        }}>👔</div>
        <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          <span className="gradient-text">JSB Sons</span>
        </span>
      </div>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: '480px', margin: '0 1.5rem', position: 'relative' }}>
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '1rem' }}>🔍</span>
        <input
          className="input-gold"
          style={{ paddingLeft: '2.5rem' }}
          placeholder="Search clothing, colors, categories..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Cart button */}
        <button onClick={onCartClick} style={{
          position: 'relative', padding: '0.5rem 1rem',
          background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)',
          borderRadius: '10px', cursor: 'pointer', color: '#c8a96e',
          display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '600',
          transition: 'all 0.2s',
        }}>
          🛒 Cart
          {cartCount > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #c8a96e, #a6854a)',
              color: '#0d0d0d', borderRadius: '999px',
              padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: '700',
            }}>{cartCount}</span>
          )}
        </button>

        {/* Profile button */}
        <button onClick={onProfileClick} style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #c8a96e, #a6854a)',
          border: 'none', cursor: 'pointer', fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>👤</button>
      </div>
    </nav>
  );
}
