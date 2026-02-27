'use client';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORY_ICONS = {
  palas: '🏓', pelotas: '🎾', ropa: '👕', calzado: '👟', accesorios: '🎽',
};

export default function ProductCard({ producto, onDelete, onEdit, showAdminActions }) {
  // Extraemos las propiedades. No extraemos _id directamente aquí para manejarlo seguro abajo
  const { nombre, marca, precio, stock, categoria, imagen_url } = producto;
  
  // Esto arregla el "undefined" buscando el ID sea como sea que lo mande el backend
  const productId = producto._id || producto.id; 

  return (
    <div className="group flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#f97316] transition-all duration-300">
      
      {/* Imagen del artículo */}
      <div className="relative h-72 flex items-center justify-center bg-[#121212] p-8 border-b border-white/10">
        {imagen_url ? (
          <Image 
            src={imagen_url} 
            alt={nombre} 
            fill 
            unoptimized /* <--- ESTO EVITA EL ERROR DEL SERVIDOR (EAI_AGAIN) */
            className="object-contain p-8 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
          />
        ) : (
          <span className="text-6xl opacity-20">{CATEGORY_ICONS[categoria] || '📦'}</span>
        )}
        
        {/* Etiqueta de stock */}
        {stock !== undefined && stock <= 0 && (
          <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">
            Agotado
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-1 gap-2">
        <p className="text-[#737373] text-xs uppercase tracking-widest">{marca || 'Revesshop'}</p>
        <h3 className="text-white font-medium text-xl leading-snug line-clamp-2">{nombre}</h3>
        
        <p className="text-[#f97316] text-2xl font-bold mt-auto pt-6">
          ${Number(precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link 
            href={`/products/${productId}`} /* Usamos el ID seguro */
            className="flex-1 text-center py-3.5 px-4 text-sm font-bold tracking-wide bg-white/5 text-white border border-white/10 rounded-lg hover:bg-[#f97316] hover:border-[#f97316] hover:text-black transition-all"
          >
            VER DETALLE
          </Link>
          
          {showAdminActions && (
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => onEdit?.(productId)} 
                className="flex-1 sm:flex-none px-5 py-3.5 text-sm bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                title="Editar"
              >
                ✎
              </button>
              <button 
                onClick={() => onDelete?.(productId)} 
                className="flex-1 sm:flex-none px-5 py-3.5 text-sm bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}