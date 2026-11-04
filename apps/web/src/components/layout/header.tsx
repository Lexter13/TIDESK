'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bell, User, LogOut, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeaderProps {
  onAbrirMenuMovil: () => void;
}

export function Header({ onAbrirMenuMovil }: HeaderProps) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  // Consulta de notificaciones en tiempo real
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.getAll(),
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifData?.unreadCount || 0;
  const notificaciones = notifData?.items || [];

  const iniciales = user?.nombres && user?.apellidos
    ? `${user.nombres[0]}${user.apellidos[0]}`.toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      {/* Franja superior tricolor institucional */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#06285C] via-[#FFD21E] to-[#009B60]" />

      <div className="px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Lado izquierdo: Botón móvil y Título institucional */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAbrirMenuMovil}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
              <Image
                src="/escudo-undc.png"
                alt="UNDC"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-[#06285C] tracking-tight">TIDESK</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-[#176BDA] border border-blue-200">
                  Mesa de Ayuda Universitaria
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Universidad Nacional de Cañete • Dirección de Tecnologías de Información
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho: Notificaciones y Perfil */}
        <div className="flex items-center gap-3">
          {/* Campana de Notificaciones */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifAbierto(!notifAbierto);
                setPerfilAbierto(false);
              }}
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E51C3B] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificaciones */}
            {notifAbierto && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifAbierto(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Notificaciones</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-[#E51C3B] text-xs font-semibold">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-xs text-[#176BDA] hover:underline font-medium"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                  {notificaciones.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No tienes notificaciones pendientes
                    </div>
                  ) : (
                    notificaciones.map((n: any) => (
                      <div
                        key={n.idNotificacion}
                        onClick={() => {
                          if (!n.leida) markReadMutation.mutate(n.idNotificacion);
                        }}
                        className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                          n.leida ? 'opacity-70 hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-[#071B49]">{n.titulo}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.mensaje}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Menú de Perfil de Usuario */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setPerfilAbierto(!perfilAbierto);
              setNotifAbierto(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06285C] to-[#176BDA] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {iniciales}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-[#071B49] truncate max-w-[140px]">
                {user?.nombres} {user?.apellidos}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded w-fit">
                {user?.rol || 'Usuario'}
              </span>
            </div>
          </button>

          {/* Dropdown de Perfil */}
          {perfilAbierto && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPerfilAbierto(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-3 z-50 animate-in fade-in duration-150">
                <div className="p-2 border-b border-slate-100">
                  <p className="font-bold text-sm text-[#071B49]">{user?.nombreCompleto}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.correo}</p>
                  <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                    <p><span className="font-semibold">Rol:</span> {user?.rol}</p>
                    {user?.area && <p><span className="font-semibold">Área:</span> {user?.area}</p>}
                    {user?.sede && <p><span className="font-semibold">Sede:</span> {user?.sede}</p>}
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <Link
                    href="/perfil"
                    onClick={() => setPerfilAbierto(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <User size={16} />
                    Mi Perfil Institucional
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setPerfilAbierto(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
