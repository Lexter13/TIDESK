'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setToken, removeToken, getToken } from '@/lib/api';

export interface UserProfile {
  idUsuario: number;
  codigo: string | null;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  estado?: boolean;
  createdAt?: string;
  rol: string;
  idRol: number;
  rolDetalle?: {
    idRol: number;
    nombre: string;
    descripcion?: string;
  };
  idSede?: number;
  sede?: string;
  sedeDetalle?: {
    idSede: number;
    nombre: string;
    direccion?: string;
  };
  idArea?: number;
  area?: string;
  areaDetalle?: {
    idArea: number;
    nombre: string;
    descripcion?: string;
  };
  idFacultad?: number;
  facultad?: string;
  facultadDetalle?: {
    idFacultad: number;
    nombre: string;
  };
  idCarrera?: number;
  carrera?: string;
  carreraDetalle?: {
    idCarrera: number;
    nombre: string;
  };
  ultimoAcceso?: string;
  actividad?: {
    tipoRol: 'ADMINISTRADOR' | 'COORDINADOR' | 'TECNICO' | 'SOLICITANTE';
    metricas: Record<string, any>;
    ultimosTickets: Array<{
      idTicket: number;
      codigo: string;
      titulo: string;
      fechaCreacion: string;
      idEstado: number;
      estado: { idEstado: number; nombre: string };
      tipoTicket: { codigo: string; nombre: string };
      prioridad: { nombre: string; nivel: number };
    }>;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (correo: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function AuthRouteProtection({ user, isLoading }: { user: UserProfile | null; isLoading: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/recuperar');
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  return null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.auth.me();
      setUser(profile);
    } catch {
      setUser(null);
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (correo: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(correo, pass);
      setToken(res.accessToken);
      setUser(res.user);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignorar fallo de red en logout
    } finally {
      removeToken();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshProfile }}>
      <Suspense fallback={null}>
        <AuthRouteProtection user={user} isLoading={isLoading} />
      </Suspense>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
