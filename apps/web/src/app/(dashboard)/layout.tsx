'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4F7FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#06285C] border-t-[#FFD21E] rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#06285C]">Cargando TIDESK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      {/* Sidebar Escritorio */}
      <Sidebar />

      {/* Sidebar Móvil */}
      <Sidebar
        movil
        abierto={menuMovilAbierto}
        onCerrar={() => setMenuMovilAbierto(false)}
      />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onAbrirMenuMovil={() => setMenuMovilAbierto(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
