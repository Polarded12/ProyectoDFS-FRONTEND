'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from '@/components/UIHelpers';

export default function ProfilePage() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading || !user) return <LoadingScreen />;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-6xl text-white mb-10" style={{ fontFamily: 'var(--font-display)' }}>PERFIL</h1>

        {/* Avatar card */}
        <div className="rounded-2xl p-8 mb-6 flex items-center gap-6"
          style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-black shrink-0"
            style={{ background: '#f97316' }}>
            {user.nombre?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.nombre}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium capitalize"
              style={{ background: isAdmin ? 'rgba(198,241,53,0.15)' : 'rgba(255,255,255,0.06)', color: isAdmin ? '#f97316' : '#9ca3af' }}>
              {user.rol || 'usuario'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Detalles de cuenta</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'ID', value: user._id },
              { label: 'Nombre', value: user.nombre },
              { label: 'Email', value: user.email },
              { label: 'Rol', value: user.rol },
              { label: 'Miembro desde', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es') : '—' },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2.5 border-b border-white/4 last:border-0">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{row.label}</span>
                <span className="text-sm text-white font-mono truncate max-w-xs text-right">{row.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/products"
            className="px-5 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
            Ver catálogo →
          </Link>
          {isAdmin && (
            <Link href="/admin"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 text-black"
              style={{ background: '#f97316' }}>
              Panel admin →
            </Link>
          )}
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <h3 className="text-sm text-red-400 mb-3">Zona de riesgo</h3>
          <button onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
