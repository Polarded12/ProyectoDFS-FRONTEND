// src/lib/api.js
// Centraliza todas las llamadas al backend.
// Usa NEXT_PUBLIC_API_URL – nunca hardcodea localhost.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  console.warn('[API] NEXT_PUBLIC_API_URL no está definida');
}

/**
 * Wrapper genérico de fetch con manejo de errores
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Añadir token JWT si existe (sólo en cliente)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rs_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });

  // 204 No Content
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error || data?.errores?.[0]?.msg || `Error ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  registro: (body) =>
    apiFetch('/auth/registro', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  perfil: () => apiFetch('/auth/perfil'),
};

// ── Productos ─────────────────────────────────────────────────
export const productosApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return apiFetch(`/productos${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => apiFetch(`/productos/${id}`),

  crear: (body) =>
    apiFetch('/productos', { method: 'POST', body: JSON.stringify(body) }),

  actualizar: (id, body) =>
    apiFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  eliminar: (id) => apiFetch(`/productos/${id}`, { method: 'DELETE' }),
};

// ── Divisas ───────────────────────────────────────────────────
export const divisasApi = {
  getTasas: () => apiFetch('/divisas/tasas'),

  convertir: (monto, de = 'MXN', a = 'USD') =>
    apiFetch(`/divisas/convertir?monto=${monto}&de=${de}&a=${a}`),
};
