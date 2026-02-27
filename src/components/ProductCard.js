'use client';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORY_ICONS = {
  palas: '🏓', pelotas: '🎾', ropa: '👕', calzado: '👟', accesorios: '🎽',
};

export default function ProductCard({ producto, onDelete, onEdit, showAdminActions }) {
  const { _id, nombre, marca, precio, stock, categoria, imagen_url } = producto;

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 group"
      style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Image */}
      <div className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{ background: '#0d1017' }}>
        {imagen_url ? (
          <Image src={imagen_url} alt={nombre} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
        ) : (
          <span className="text-5xl opacity-40">{CATEGORY_ICONS[categoria] || '📦'}</span>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {categoria && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
              style={{ background: 'rgba(198,241,53,0.15)', color: '#f97316', border: '1px solid rgba(198,241,53,0.3)' }}>
              {categoria}
            </span>
          )}
        </div>
        {stock !== undefined && (
          <div className="absolute top-3 right-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              stock > 10 ? 'bg-green-500/15 text-green-400' :
              stock > 0  ? 'bg-yellow-500/15 text-yellow-400' :
                           'bg-red-500/15 text-red-400'
            }`}>
              {stock > 0 ? `${stock} uds.` : 'Sin stock'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-1">
        {marca && <p className="text-xs text-gray-500 uppercase tracking-widest">{marca}</p>}
        <p className="font-semibold text-white leading-snug text-sm line-clamp-2">{nombre}</p>
        <p className="text-lg font-bold mt-auto pt-2" style={{ color: '#f97316' }}>
          ${Number(precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>

        <div className="flex gap-2 mt-3">
          <Link href={`/products/${_id}`}
            className="flex-1 text-center text-sm py-2 rounded-lg font-medium transition-all border border-white/10 hover:border-white/20 text-gray-300 hover:text-white">
            Ver →
          </Link>
          {showAdminActions && (
            <>
              <button onClick={() => onEdit?.(_id)}
                className="px-3 py-2 text-xs rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                ✎
              </button>
              <button onClick={() => onDelete?.(_id)}
                className="px-3 py-2 text-xs rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
