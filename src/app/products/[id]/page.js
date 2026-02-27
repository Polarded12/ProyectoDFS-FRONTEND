'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productosApi, divisasApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingScreen, ErrorMessage, Alert } from '@/components/UIHelpers';

const CATEGORY_ICONS = { palas: '🏓', pelotas: '🎾', ropa: '👕', calzado: '👟', accesorios: '🎽' };
const CURRENCIES = ['USD', 'EUR', 'GBP', 'ARS', 'CLP', 'COP'];

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [converted, setConverted]           = useState(null);
  const [converting, setConverting]         = useState(false);
  const [convertError, setConvertError]     = useState(null);

  useEffect(() => {
    productosApi.getById(id)
      .then(setProducto)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConvert = async () => {
    if (!producto?.precio) return;
    setConverting(true);
    setConvertError(null); // Limpiamos errores previos
    
    try {
      const data = await divisasApi.convertir(producto.precio, 'MXN', targetCurrency);
      
      // Validamos si la API devuelve el número directo o un objeto { resultado: ... }
      if (typeof data === 'number') {
        setConverted({ resultado: data });
      } else {
        setConverted(data);
      }
    } catch (err) {
      // Ahora sí mostramos el error si el backend falla
      setConvertError(err.message || 'Error al conectar con el servidor de divisas.');
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Seguro que deseas eliminar este artículo?')) return;
    await productosApi.eliminar(id);
    router.push('/products');
  };

  if (loading) return <LoadingScreen />;
  if (error)   return <div className="py-20 px-8 max-w-4xl mx-auto"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></div>;
  if (!producto) return null;

  const { nombre, marca, precio, stock, categoria, descripcion, imagen_url } = producto;
  const productId = producto._id || producto.id;

  return (
    <div className="min-h-screen py-32 px-8 md:px-12 bg-[#000000]">
      <div className="max-w-6xl mx-auto">
        
        {/* Navegación Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-[#737373] mb-12 uppercase tracking-wider font-bold">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition-colors">Catálogo</Link>
          <span>/</span>
          <span className="text-[#f97316] truncate">{nombre}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Imagen (Minimalista y con unoptimized para evitar el error de CDN) */}
          <div className="relative rounded-2xl overflow-hidden aspect-square flex items-center justify-center border border-white/10 bg-[#0a0a0a] p-10">
            {imagen_url ? (
              <Image 
                src={imagen_url} 
                alt={nombre} 
                fill 
                unoptimized
                className="object-contain p-10" 
              />
            ) : (
              <span className="text-8xl opacity-20">{CATEGORY_ICONS[categoria] || '📦'}</span>
            )}
          </div>

          {/* Información del Artículo */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              {categoria && (
                <span className="text-[11px] px-3 py-1.5 rounded bg-white/5 text-white border border-white/10 uppercase font-bold tracking-widest">
                  {categoria}
                </span>
              )}
              {stock !== undefined && stock <= 0 ? (
                <span className="text-[11px] px-3 py-1.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 uppercase font-bold tracking-widest">
                  Agotado
                </span>
              ) : (
                <span className="text-[11px] px-3 py-1.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 uppercase font-bold tracking-widest">
                  {stock} Disponibles
                </span>
              )}
            </div>

            <div>
              {marca && <p className="text-[#737373] text-sm uppercase tracking-widest mb-2">{marca}</p>}
              <h1 className="text-4xl md:text-5xl text-white leading-tight font-medium">{nombre}</h1>
            </div>

            <p className="text-4xl font-bold text-[#f97316]">
              ${Number(precio).toLocaleString('en-US', { minimumFractionDigits: 2 })} MXN
            </p>

            {descripcion && <p className="text-[#a3a3a3] text-base leading-relaxed">{descripcion}</p>}

            {/* Conversor de Divisas */}
            <div className="rounded-xl p-6 mt-6 bg-[#0a0a0a] border border-white/10">
              <p className="text-xs text-[#737373] uppercase tracking-wider mb-4 font-bold">Convertir moneda estimada</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={targetCurrency} 
                  onChange={e => { setTargetCurrency(e.target.value); setConverted(null); setConvertError(null); }}
                  className="flex-1 px-4 py-3.5 rounded-lg text-sm text-white border border-white/20 bg-[#121212] focus:border-[#f97316] outline-none transition-colors"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                <button 
                  onClick={handleConvert} 
                  disabled={converting}
                  className="px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider disabled:opacity-50 transition-colors bg-[#f97316] text-black hover:bg-[#ea580c]"
                >
                  {converting ? 'Calculando...' : 'Convertir'}
                </button>
              </div>

              {/* Mensajes de resultado o error */}
              {convertError && (
                <p className="mt-4 text-red-500 text-sm">{convertError}</p>
              )}
              {converted && converted.resultado && (
                <p className="mt-5 text-white text-xl font-medium">
                  ≈ {Number(converted.resultado).toLocaleString('es', { minimumFractionDigits: 2 })} <span className="text-[#f97316]">{targetCurrency}</span>
                </p>
              )}
            </div>

            {/* Acciones de Administrador */}
            {isAdmin && (
              <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
                <Link href={`/admin?edit=${productId}`}
                  className="flex-1 text-center py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider border border-white/10 text-white hover:bg-white/5 transition-colors">
                  Editar Artículo
                </Link>
                <button onClick={handleDelete}
                  className="flex-1 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors">
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