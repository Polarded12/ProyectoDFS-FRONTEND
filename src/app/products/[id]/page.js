'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productosApi, divisasApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingScreen, ErrorMessage, Alert } from '@/components/UIHelpers';

const CATEGORY_ICONS = { palas: '🏓', pelotas: '🎾', ropa: '👕', calzado: '👟', accesorios: '🎽' };
const CURRENCIES = ['MXN', 'EUR', 'GBP', 'ARS', 'CLP', 'COP'];

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [targetCurrency, setTargetCurrency] = useState('MXN');
  const [converted, setConverted]           = useState(null);
  const [converting, setConverting]         = useState(false);

  useEffect(() => {
    productosApi.getById(id)
      .then(setProducto)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConvert = async () => {
    if (!producto?.precio) return;
    setConverting(true);
    try {
      const data = await divisasApi.convertir(producto.precio, 'USD', targetCurrency);
      setConverted(data);
    } catch {
      // silently fail
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este producto?')) return;
    await productosApi.eliminar(id);
    router.push('/products');
  };

  if (loading) return <LoadingScreen />;
  if (error)   return <div className="py-20 px-6 max-w-4xl mx-auto"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></div>;
  if (!producto) return null;

  const { nombre, marca, precio, stock, categoria, descripcion, imagen_url } = producto;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-300 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-300 transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-gray-400">{nombre}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-square flex items-center justify-center"
            style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>
            {imagen_url ? (
              <Image src={imagen_url} alt={nombre} fill className="object-contain p-6" />
            ) : (
              <span className="text-8xl opacity-30">{CATEGORY_ICONS[categoria] || '📦'}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {categoria && (
                <span className="text-xs px-3 py-1 rounded-full capitalize"
                  style={{ background: 'rgba(198,241,53,0.12)', color: '#f97316', border: '1px solid rgba(198,241,53,0.25)' }}>
                  {categoria}
                </span>
              )}
              <span className={`text-xs px-3 py-1 rounded-full ${
                stock > 10 ? 'bg-green-500/15 text-green-400' :
                stock > 0  ? 'bg-yellow-500/15 text-yellow-400' :
                             'bg-red-500/15 text-red-400'
              }`}>
                {stock > 0 ? `${stock} en stock` : 'Sin stock'}
              </span>
            </div>

            {marca && <p className="text-sm text-gray-500 uppercase tracking-widest">{marca}</p>}
            <h1 className="text-4xl text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{nombre}</h1>

            <p className="text-4xl font-bold" style={{ color: '#f97316' }}>
              ${Number(precio).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>

            {descripcion && <p className="text-gray-400 text-sm leading-relaxed">{descripcion}</p>}

            {/* Currency converter */}
            <div className="rounded-xl p-5 mt-2" style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Convertir precio</p>
              <div className="flex gap-2">
                <select value={targetCurrency} onChange={e => { setTargetCurrency(e.target.value); setConverted(null); }}
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm text-gray-300 border border-white/10 bg-transparent"
                  style={{ background: '#0d1017' }}>
                  {CURRENCIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                </select>
                <button onClick={handleConvert} disabled={converting}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all hover:brightness-110 text-black"
                  style={{ background: '#f97316' }}>
                  {converting ? '...' : 'Convertir'}
                </button>
              </div>
              {converted && (
                <p className="mt-3 text-white font-bold">
                  ≈ {Number(converted.resultado).toLocaleString('es', { minimumFractionDigits: 2 })} {targetCurrency}
                </p>
              )}
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex gap-3 mt-2">
                <Link href={`/admin?edit=${id}`}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-colors">
                  ✎ Editar
                </Link>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
