'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Alert } from '@/components/UIHelpers';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      router.push(user.rol === 'admin' ? '/admin' : '/products');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>ENTRAR</h1>
          <p className="text-gray-500 text-sm">Accede a tu cuenta Revesshop</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>
          {error && <div className="mb-5"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}

          <form onSubmit={handle} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="tu@email.com"
                className="px-4 py-3 rounded-xl text-white text-sm border border-white/10 focus:border-white/20 placeholder-gray-700"
                style={{ background: '#0d1017' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Contraseña</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="px-4 py-3 rounded-xl text-white text-sm border border-white/10 focus:border-white/20 placeholder-gray-700"
                style={{ background: '#0d1017' }} />
            </div>
            <button type="submit" disabled={loading}
              className="mt-2 py-3 rounded-xl font-bold text-black text-sm disabled:opacity-50 transition-all hover:brightness-110"
              style={{ background: '#f97316' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="hover:underline" style={{ color: '#f97316' }}>
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
