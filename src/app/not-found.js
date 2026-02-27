import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-8xl font-bold mb-4" style={{ color: '#f97316', fontFamily: 'var(--font-display)' }}>404</p>
      <h2 className="text-3xl text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Página no encontrada</h2>
      <p className="text-gray-500 mb-8">La página que buscas no existe.</p>
      <Link href="/"
        className="px-6 py-3 rounded-xl font-bold text-black text-sm hover:brightness-110 transition-all"
        style={{ background: '#f97316' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
