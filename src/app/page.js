'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productosApi, divisasApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { SkeletonCard, Alert } from '@/components/UIHelpers';

const CATEGORIAS = [
  { key: 'palas', label: 'Palas', icon: '🏓' },
  { key: 'pelotas', label: 'Pelotas', icon: '🎾' },
  { key: 'ropa', label: 'Ropa', icon: '👕' },
  { key: 'calzado', label: 'Calzado', icon: '👟' },
  { key: 'accesorios', label: 'Accesorios', icon: '🎽' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const prod = await productosApi.getAll({ limit: 6 });
        setFeatured(prod?.productos || []);
      } catch (err) {
        setError('No se pudo cargar el catálogo.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      {/* HERO SIMPLE */}
      <section className="min-h-[80vh] flex items-center px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <h1 className="text-7xl md:text-9xl leading-none text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              JUEGA<br />
              <span className="text-[#f97316]">DIFERENTE</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xl leading-relaxed">
              El mejor equipamiento de pádel para jugadores que buscan la perfección. Palas, pelotas y accesorios de élite.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="px-8 py-4 rounded bg-[#f97316] font-bold text-black text-sm hover:bg-[#ea580c] transition-colors">
                Ver Catálogo
              </Link>
              <Link href="/auth/register" className="px-8 py-4 rounded border border-white/20 font-semibold text-sm text-white hover:bg-white/5 transition-colors">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-5xl text-white" style={{ fontFamily: 'var(--font-display)' }}>DESTACADOS</h2>
            <Link href="/products" className="text-sm text-[#f97316] hover:underline">Ver todos →</Link>
          </div>

          {error && <Alert type="error" message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map(p => <ProductCard key={p._id} producto={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}