'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productosApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import ProductCard from '@/components/ProductCard';
import { SkeletonCard, EmptyState, Alert } from '@/components/UIHelpers';

const CATEGORIAS = ['palas', 'pelotas', 'ropa', 'calzado', 'accesorios'];

function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useAuth();

  const [productos, setProductos] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const page      = Number(searchParams.get('page')      || 1);
  const categoria = searchParams.get('categoria')        || '';
  const search    = searchParams.get('search')           || '';
  const marca     = searchParams.get('marca')            || '';
  const limit     = 12;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productosApi.getAll({
        page, limit, categoria, search, marca,
      });
      setProductos(data?.productos || []);
      setTotal(data?.total || 0);
    } catch (e) {
      setError(e.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [page, categoria, search, marca]);

  useEffect(() => { load(); }, [load]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`/products?${p.toString()}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await productosApi.eliminar(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl text-white mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          CATÁLOGO
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar..."
            defaultValue={search}
            onKeyDown={(e) => e.key === 'Enter' && setParam('search', e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-white bg-transparent border border-white/10 focus:border-white/20 placeholder-gray-600 w-64"
            style={{ background: '#111620' }}
          />
          <select value={categoria} onChange={(e) => setParam('categoria', e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-gray-300 border border-white/10 focus:border-white/20 bg-transparent"
            style={{ background: '#111620' }}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => (
              <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>
            ))}
          </select>
          <input type="text" placeholder="Marca..." defaultValue={marca}
            onKeyDown={(e) => e.key === 'Enter' && setParam('marca', e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-white bg-transparent border border-white/10 focus:border-white/20 placeholder-gray-600 w-40"
            style={{ background: '#111620' }}
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setParam('categoria', '')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              !categoria ? 'text-black' : 'text-gray-500 hover:text-gray-300 border border-white/10'
            }`}
            style={!categoria ? { background: '#f97316' } : {}}>
            Todos
          </button>
          {CATEGORIAS.map(c => (
            <button key={c} onClick={() => setParam('categoria', c)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                categoria === c ? 'text-black' : 'text-gray-500 hover:text-gray-300 border border-white/10'
              }`}
              style={categoria === c ? { background: '#f97316' } : {}}>
              {c}
            </button>
          ))}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : productos.length === 0 ? (
          <EmptyState icon="🏓" message="No se encontraron productos" subtitle="Prueba con otros filtros" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {productos.map(p => (
              <ProductCard key={p._id} producto={p}
                showAdminActions={isAdmin}
                onDelete={handleDelete}
                onEdit={(id) => router.push(`/admin?edit=${id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p}
                onClick={() => {
                  const ps = new URLSearchParams(searchParams.toString());
                  ps.set('page', p);
                  router.push(`/products?${ps.toString()}`);
                }}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  p === page ? 'text-black' : 'text-gray-500 hover:text-white border border-white/10'
                }`}
                style={p === page ? { background: '#f97316' } : {}}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>}>
      <ProductsCatalog />
    </Suspense>
  );
}
