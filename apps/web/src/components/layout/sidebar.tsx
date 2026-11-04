'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  FileCheck2,
  AlertTriangle,
  GitPullRequest,
  Users,
  BarChart3,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface SidebarProps {
  movil?: boolean;
  abierto?: boolean;
  onCerrar?: () => void;
}

export function Sidebar({ movil = false, abierto = false, onCerrar }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [colapsado, setColapsado] = useState(false);

  const esAdminOCoord = user?.rol === 'Administrador' || user?.rol === 'Coordinador TI';

  const menuItems = [
    {
      nombre: 'Dashboard',
      href: '/dashboard',
      icono: LayoutDashboard,
      mostrar: true,
    },
    {
      nombre: 'Tickets',
      href: '/tickets',
      icono: Ticket,
      mostrar: true,
    },
    {
      nombre: 'Requerimientos',
      href: '/requerimientos',
      icono: FileCheck2,
      mostrar: true,
    },
    {
      nombre: 'Incidentes',
      href: '/incidentes',
      icono: AlertTriangle,
      mostrar: true,
    },
    {
      nombre: 'Gestión de Cambios',
      href: '/crq',
      icono: GitPullRequest,
      mostrar: true,
    },
    {
      nombre: 'Usuarios',
      href: '/usuarios',
      icono: Users,
      mostrar: esAdminOCoord,
    },
    {
      nombre: 'Reportes',
      href: '/reportes',
      icono: BarChart3,
      mostrar: esAdminOCoord || user?.rol === 'Técnico TI',
    },
    {
      nombre: 'SLA',
      href: '/sla',
      icono: Clock,
      mostrar: esAdminOCoord,
    },
    {
      nombre: 'Configuración',
      href: '/configuracion',
      icono: Settings,
      mostrar: user?.rol === 'Administrador',
    },
  ];

  const sidebarContent = (
    <div
      className={`h-full flex flex-col bg-[#06285C] text-white shadow-2xl transition-all duration-300 ${
        movil ? 'w-72' : colapsado ? 'w-20' : 'w-64'
      }`}
    >
      {/* Encabezado del menú */}
      <div className="flex items-center justify-between p-4 border-b border-blue-900/60 bg-[#001C45]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center shadow-md shrink-0 border border-white/10 backdrop-blur-sm">
            <Image
              src="/escudo-undc.png"
              alt="UNDC"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          {(!colapsado || movil) && (
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider text-white">TIDESK</span>
              <span className="text-[10px] text-[#FFD21E] font-bold tracking-wide uppercase">UNDC Cañete</span>
            </div>
          )}
        </Link>

        {movil ? (
          <button
            onClick={onCerrar}
            className="p-1 rounded-lg hover:bg-white/10 text-white"
            aria-label="Cerrar menú lateral"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            onClick={() => setColapsado(!colapsado)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
          >
            {colapsado ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Franja decorativa institucional */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FFD21E] via-[#009B60] to-[#176BDA]" />

      {/* Navegación */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => item.mostrar)
          .map((item) => {
            const Icono = item.icono;
            const activo = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={movil ? onCerrar : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                  activo
                    ? 'bg-[#FFD21E] text-[#071B49] shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
                title={colapsado && !movil ? item.nombre : undefined}
              >
                <Icono
                  size={20}
                  className={`shrink-0 ${
                    activo ? 'text-[#071B49]' : 'text-slate-300 group-hover:text-white'
                  }`}
                />
                {(!colapsado || movil) && <span className="truncate">{item.nombre}</span>}
              </Link>
            );
          })}
      </nav>

      {/* Pie institucional */}
      {(!colapsado || movil) && (
        <div className="p-4 border-t border-blue-900/60 bg-[#001C45]/80 text-[11px] text-slate-400 text-center">
          <p className="font-semibold text-slate-300">Universidad Nacional de Cañete</p>
          <p>© 2026 Soporte Tecnológico TI</p>
        </div>
      )}
    </div>
  );

  if (movil) {
    if (!abierto) return null;
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden">
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onCerrar} />
        <div className="relative z-10">{sidebarContent}</div>
      </div>
    );
  }

  return <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">{sidebarContent}</aside>;
}
