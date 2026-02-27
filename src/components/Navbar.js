'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-md border-b border-white/8' : ''
    }`}
    style={{ background: scrolled ? 'rgba(8,10,15,0.9)' : 'transparent' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-2xl tracking-widest text-white">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#f97316"/>
            <path d="M8 22 L16 8 L24 22" stroke="#080a0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 18 L21 18" stroke="#080a0f" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          REVESSHOP
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/products" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            Catálogo
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                  style={{ background: '#f97316' }}>
                  {user.nombre?.[0]?.toUpperCase() || 'U'}
                </div>
                {user.nombre}
              </Link>
              <button onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login"
                className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg border border-white/10 hover:border-white/20">
                Entrar
              </Link>
              <Link href="/auth/register"
                className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                style={{ background: '#f97316', color: '#080a0f' }}>
                Registro
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/8 px-6 py-4 flex flex-col gap-4"
          style={{ background: 'rgba(8,10,15,0.98)' }}>
          <Link href="/products" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
            Catálogo
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                Perfil — {user.nombre}
              </Link>
              <button onClick={handleLogout} className="text-left text-red-400 py-2">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                Entrar
              </Link>
              <Link href="/auth/register" className="text-gray-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
