const API_HOST = '192.168.137.1';
export const API_URL = `http://${API_HOST}:8080/api`;
// Endpoint crudo de WebSocket (sin SockJS: react-native-web-socket ya lo soporta nativo).
export const WS_URL = `ws://${API_HOST}:8080/ws/websocket`;

async function apiFetch(path: string, options: RequestInit = {}) {
  const respuesta = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const mensaje = datos?.error ?? datos?.mensaje ?? 'Ocurrió un error inesperado';
    throw new Error(mensaje);
  }

  return datos;
}

export interface PerfilUsuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: 'ADMIN' | 'CLIENTE';
  roles: string[];
}

export const auth = {
  login: (email: string, password: string): Promise<PerfilUsuario> =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  logout: (): Promise<unknown> => apiFetch('/auth/logout', { method: 'POST' }),

  perfil: (): Promise<PerfilUsuario> => apiFetch('/auth/perfil')
};

export interface SalaApi {
  id: number;
  nombre: string;
  filas: number;
  columnas: number;
  tipoSala: string;
}

export interface FuncionApi {
  id: number;
  peliculaId: number;
  tituloPelicula: string;
  sala: SalaApi;
  fecha: string;
  hora: string;
  formato: string;
  idioma: string;
  precioBase: number;
  duracionMinutos: number | null;
}

export interface AsientoApi {
  id: string;
  asientoId: number;
  estado: 'LIBRE' | 'RESERVADO' | 'OCUPADO';
  precio: number;
  clienteId: string | null;
}

export const funciones = {
  obtenerPorPelicula: (peliculaId: number): Promise<FuncionApi[]> =>
    apiFetch(`/funciones?peliculaId=${peliculaId}`),

  obtenerAsientos: (funcionId: number | string): Promise<AsientoApi[]> =>
    apiFetch(`/funciones/${funcionId}/asientos`),

  obtenerTodo: (): Promise<FuncionApi[]> => apiFetch('/funciones'),

  crear: (datos: DatosFuncion): Promise<FuncionApi> =>
    apiFetch('/funciones', { method: 'POST', body: JSON.stringify(datos) }),

  editar: (id: number, datos: DatosFuncion): Promise<FuncionApi> =>
    apiFetch(`/funciones/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),

  eliminar: (id: number): Promise<unknown> =>
    apiFetch(`/funciones/${id}`, { method: 'DELETE' })
};

export type DatosSala = Omit<SalaApi, 'id'>;

export type DatosFuncion = Omit<FuncionApi, 'id' | 'sala'> & {
  sala: { id: number };
};

export const salas = {
  obtenerTodo: (): Promise<SalaApi[]> => apiFetch('/salas'),

  crear: (datos: DatosSala): Promise<SalaApi> =>
    apiFetch('/salas', { method: 'POST', body: JSON.stringify(datos) }),

  editar: (id: number, datos: DatosSala): Promise<SalaApi> =>
    apiFetch(`/salas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),

  eliminar: (id: number): Promise<unknown> =>
    apiFetch(`/salas/${id}`, { method: 'DELETE' })
};

export interface SnackPedido {
  id: number;
  cantidad: number;
}

export interface CompraSolicitud {
  funcionId: number;
  asientoIds: number[];
  snacks: SnackPedido[];
}

export interface RespuestaCompra {
  id: number;
  total: number;
  estado: string;
}

export interface SnackEntrada {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface EntradaUsuario {
  id: number;
  codigo: string;
  fechaCompra: string;
  total: number;
  estado: string;
  pelicula: string;
  fechaFuncion: string;
  hora: string;
  formato: string;
  idioma: string;
  sala: string;
  asientos: string[];
  snacks: SnackEntrada[];
}

export const compras = {
  registrar: (solicitud: CompraSolicitud): Promise<RespuestaCompra> =>
    apiFetch('/compras/registrar', {
      method: 'POST',
      body: JSON.stringify(solicitud)
    }),

  mias: (): Promise<EntradaUsuario[]> => apiFetch('/compras/mias')
};
