'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Alert } from '@/components/UIHelpers';

function strengthLevel(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8)        score++;
  if (/[A-Z]/.test(pwd))      score++;
  if (/[0-9]/.test(pwd))      score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#f97316'];

export default function RegisterPage() {
  const router = useRouter();
  const { registro, login } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const strength = strengthLevel(form.password);

  const handle = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (form.password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    setLoading(true); setError(null);
    try {
      await registro(form.nombre, form.email, form.password);
      setSuccess(true);
      setTimeout(async () => {
        await login(form.email, form.password);
        router.push('/products');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎾</div>
        <h2 className="text-4xl text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>¡BIENVENIDO!</h2>
        <p className="text-gray-400">Redirigiendo al catálogo...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>REGISTRO</h1>
          <p className="text-gray-500 text-sm">Crea tu cuenta en Revesshop</p>
        </div>
        <div className="rounded-2xl p-8" style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>
          {error && <div className="mb-5"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}
          <form onSubmit={handle} className="flex flex-col gap-5">
            {[
              { key: 'nombre',   label: 'Nombre',          type: 'text',     placeholder: 'Tu nombre' },
              { key: 'email',    label: 'Email',            type: 'email',    placeholder: 'tu@email.com' },
              { key: 'password', label: 'Contraseña',       type: 'password', placeholder: '••••••••' },
              { key: 'confirm',  label: 'Confirmar contraseña', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">{f.label}</label>
                <input type={f.type} required value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  className="px-4 py-3 rounded-xl text-white text-sm border border-white/10 focus:border-white/20 placeholder-gray-700"
                  style={{ background: '#0d1017' }} />
              </div>
            ))}

            {/* Password strength */}
            {form.password && (
              <div className="flex gap-1.5 items-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all"
                    style={{ background: i < strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.08)' }} />
                ))}
                <span className="text-xs ml-1" style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="mt-2 py-3 rounded-xl font-bold text-black text-sm disabled:opacity-50 hover:brightness-110 transition-all"
              style={{ background: '#f97316' }}>
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="hover:underline" style={{ color: '#f97316' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
