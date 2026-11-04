"use client";

import { Menu } from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  nombreEmpresa: string;
  logoEmpresaUrl: string | null;
  nombreUsuario: string;
  rol: string;
  accesoTotal: boolean;
  codigosModulos: string[];
  nombres: string;
  apellidos: string;
  correo: string;
};

export default function DashboardShell({
  children,
  nombreEmpresa,
  logoEmpresaUrl,
  nombreUsuario,
  rol,
  accesoTotal,
  codigosModulos,
  nombres,
  apellidos,
  correo,
}: DashboardShellProps) {
  const [
    menuAbierto,
    setMenuAbierto,
  ] = useState(false);

  useEffect(() => {
    document.body.style.overflow =
      menuAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  return (
    <div className="min-h-dvh bg-slate-100 lg:flex">
      <Sidebar
        nombreEmpresa={nombreEmpresa}
        logoEmpresaUrl={logoEmpresaUrl}
        nombreUsuario={nombreUsuario}
        rol={rol}
        accesoTotal={accesoTotal}
        codigosModulos={codigosModulos}
      />

      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() =>
            setMenuAbierto(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <Sidebar
        movil
        abierto={menuAbierto}
        onCerrar={() =>
          setMenuAbierto(false)
        }
        nombreEmpresa={nombreEmpresa}
        logoEmpresaUrl={logoEmpresaUrl}
        nombreUsuario={nombreUsuario}
        rol={rol}
        accesoTotal={accesoTotal}
        codigosModulos={codigosModulos}
      />

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={() =>
                setMenuAbierto(true)
              }
              aria-label="Abrir menú"
              className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1">
              <Header
                nombres={nombres}
                apellidos={apellidos}
                correo={correo}
              />
            </div>
          </div>
        </div>

        <main className="min-w-0 overflow-x-hidden px-3 py-4 sm:px-4 md:px-5 md:py-5 xl:px-6 xl:py-6 2xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
