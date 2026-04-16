'use client';
import { useRouter } from 'next/navigation';
import { useAppStore, User } from '@/store/appStore';

interface Props { user: User; }

export default function OwnerNav({ user }: Props) {
  const router = useRouter();
  const { logout } = useAppStore();

  return (
    <nav className="nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => router.push('/owner')}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #c8a96e, #a6854a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
        }}>🏪</div>
        <div>
          <span style={{ fontWeight: '800', fontSize: '1rem' }}><span className="gradient-text">JSB Sons</span></span>
          <span style={{ color: '#888', fontSize: '0.7rem', marginLeft: '0.5rem' }}>Owner Panel</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user.name}</p>
          <p style={{ color: '#888', fontSize: '0.72rem' }}>Owner</p>
        </div>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #c8a96e, #a6854a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
        }}>👤</div>
        <button onClick={() => { logout(); router.push('/'); }} style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', padding: '0.45rem 0.9rem', borderRadius: '8px',
          cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', fontFamily: 'Inter, sans-serif',
        }}>Sign Out</button>
      </div>
    </nav>
  );
}
