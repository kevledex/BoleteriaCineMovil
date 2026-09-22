import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { auth, PerfilUsuario } from '../services/api';

interface AuthContextValue {
  perfil: PerfilUsuario | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<PerfilUsuario>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    auth
      .perfil()
      .then(setPerfil)
      .catch(() => setPerfil(null))
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const perfilNuevo = await auth.login(email, password);
    setPerfil(perfilNuevo);
    return perfilNuevo;
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setPerfil(null);
    }
  }, []);

  const value = useMemo(
    () => ({ perfil, cargando, iniciarSesion, cerrarSesion }),
    [perfil, cargando, iniciarSesion, cerrarSesion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
