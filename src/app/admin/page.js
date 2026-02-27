'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productosApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Alert, EmptyState } from '@/components/UIHelpers';

const BLANK = { nombre: '', marca: '', precio: '', stock: '', categoria: '', descripcion: '', imagen_url: '' };
const CATS  = ['palas', 'pelotas', 'ropa', 'calzado', 'accesorios'];

function AdminPanel() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [productos, setProductos] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(BLANK);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const limit = 10;

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/');
  }, [user, isAdmin, authLoading, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productosApi.getAll({ page, limit });
      setProductos(data?.productos || []);
      setTotal(data?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Handle ?edit=id
  useEffect(() => {
    const eid = searchParams.get('edit');
    if (eid && productos.length) {
      const p = productos.find(p => p._id === eid);
      if (p) {
        setEditId(eid);
        setForm({ nombre: p.nombre || '', marca: p.marca || '', precio: p.precio || '', stock: p.stock || '', categoria: p.categoria || '', descripcion: p.descripcion || '', imagen_url: p.imagen_url || '' });
        setShowForm(true);
      }
    }
  }, [searchParams, productos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const body = { ...form, precio: Number(form.precio), stock: Number(form.stock) };
      if (editId) await productosApi.actualizar(editId, body);
      else        await productosApi.crear(body);
      setMsg({ type: 'success', text: editId ? 'Producto actualizado ✓' : 'Producto creado ✓' });
      setForm(BLANK); setEditId(null); setShowForm(false);
      router.replace('/admin');
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await productosApi.eliminar(id);
      setMsg({ type: 'success', text: 'Producto eliminado' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const openNew = () => { setForm(BLANK); setEditId(null); setShowForm(true); router.replace('/admin'); };

  if (authLoading) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-6xl text-white" style={{ fontFamily: 'var(--font-display)' }}>ADMIN</h1>
            <p className="text-sm text-gray-500 mt-1">{total} productos en inventario</p>
          </div>
          <button onClick={openNew}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-black hover:brightness-110 transition-all"
            style={{ background: '#f97316' }}>
            + Nuevo producto
          </button>
        </div>

        {msg && <div className="mb-5"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-7 mb-8" style={{ background: '#111620', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {editId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditId(null); router.replace('/admin'); }}
                className="text-gray-600 hover:text-gray-300 transition-colors text-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: 'nombre',     label: 'Nombre',     type: 'text',   required: true },
                { key: 'marca',      label: 'Marca',      type: 'text',   required: false },
                { key: 'precio',     label: 'Precio USD', type: 'number', required: true },
                { key: 'stock',      label: 'Stock',      type: 'number', required: true },
                { key: 'imagen_url', label: 'URL Imagen', type: 'url',    required: false },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">{f.label}</label>
                  <input type={f.type} required={f.required} value={form[f.key]}
                    onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                    className="px-4 py-3 rounded-xl text-white text-sm border border-white/10 focus:border-white/20"
                    style={{ background: '#0d1017' }} />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Categoría</label>
                <select value={form.categoria} onChange={e => setForm(v => ({ ...v, categoria: e.target.value }))} required
                  className="px-4 py-3 rounded-xl text-gray-300 text-sm border border-white/10 bg-transparent"
                  style={{ background: '#0d1017' }}>
                  <option value="">Seleccionar...</option>
                  {CATS.map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Descripción</label>
                <textarea rows={3} value={form.descripcion}
                  onChange={e => setForm(v => ({ ...v, descripcion: e.target.value }))}
                  className="px-4 py-3 rounded-xl text-white text-sm border border-white/10 focus:border-white/20 resize-none"
                  style={{ background: '#0d1017' }} />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving}
                  className="px-8 py-3 rounded-xl font-bold text-black text-sm disabled:opacity-50 hover:brightness-110 transition-all"
                  style={{ background: '#f97316' }}>
                  {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear producto'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); router.replace('/admin'); }}
                  className="px-6 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
        ) : productos.length === 0 ? (
          <EmptyState icon="📦" message="No hay productos" subtitle="Crea el primero" />
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="w-full text-sm">
              <thead style={{ background: '#111620', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <tr>
                  {['Producto', 'Marca', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.map((p, i) => (
                  <tr key={p._id}
                    className="border-t transition-colors hover:bg-white/2"
                    style={{ borderColor: 'rgba(255,255,255,0.04)', background: i % 2 === 0 ? '#0d1017' : '#111620' }}>
                    <td className="px-5 py-4 font-medium text-white truncate max-w-xs">{p.nombre}</td>
                    <td className="px-5 py-4 text-gray-400">{p.marca || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{ background: 'rgba(198,241,53,0.1)', color: '#f97316' }}>
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold" style={{ color: '#f97316' }}>
                      ${Number(p.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.stock > 10 ? 'bg-green-500/15 text-green-400' :
                        p.stock > 0  ? 'bg-yellow-500/15 text-yellow-400' :
                                       'bg-red-500/15 text-red-400'
                      }`}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditId(p._id); setForm({ nombre: p.nombre||'', marca: p.marca||'', precio: p.precio||'', stock: p.stock||'', categoria: p.categoria||'', descripcion: p.descripcion||'', imagen_url: p.imagen_url||'' }); setShowForm(true); }}
                          className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          className="px-3 py-1.5 rounded-lg text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4" style={{ background: '#111620', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:text-white disabled:opacity-30">
                    ← Anterior
                  </button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:text-white disabled:opacity-30">
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>}>
      <AdminPanel />
    </Suspense>
  );
}
