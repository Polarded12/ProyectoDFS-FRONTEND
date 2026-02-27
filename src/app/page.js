'use client';
import { useState, useEffect, useCallback } from 'react';
import { productosApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { SkeletonCard, EmptyState, Alert } from '@/components/UIHelpers';

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState(''); 

  const loadProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productosApi.getAll({ search: query, limit: 20 });
      setProductos(data?.productos || []);
    } catch (err) {
      setError('No se pudieron cargar los artículos.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(searchTerm); 
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      
      {/* ── SECCIÓN DE BÚSQUEDA MINIMALISTA ── */}
      <section className="pt-40 pb-24 px-8 md:px-12 border-b border-white/10 flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl md:text-8xl text-white mb-12 tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
          REVES<span className="text-[#f97316]">SHOP</span>
        </h1>

        <form onSubmit={handleSearch} className="w-full max-w-3xl relative mx-auto p-2 rounded-full border border-white/20 bg-[#0a0a0a] focus-within:border-[#f97316] transition-colors">
          <input
            type="text"
            placeholder="Buscar palas, pelotas, ropa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-8 py-5 rounded-full text-lg text-white bg-transparent outline-none pl-6 pr-40"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-10 py-4 rounded-full bg-[#f97316] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#ea580c] transition-colors"
          >
            Buscar
          </button>
        </form>
      </section>

      {/* ── GALERÍA DE ARTÍCULOS ── */}
      <section className="py-24 px-8 md:px-12 max-w-[90rem] mx-auto">
        {error && <div className="mb-10"><Alert type="error" message={error} /></div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {/* Aquí aplicamos la corrección de la key con el index */}
            {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)}
          </div>
        ) : productos.length === 0 ? (
          <EmptyState icon="🔍" message="No encontramos artículos" subtitle="Intenta con otra palabra clave" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {/* Aquí aplicamos la corrección de la key segura con index como respaldo */}
            {productos.map((p, index) => (
              <ProductCard key={p._id || p.id || `prod-${index}`} producto={p} />
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
}