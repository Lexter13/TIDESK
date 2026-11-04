'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingrese un correo institucional válido (@undc.edu.pe)'),
  password: z
    .string()
    .min(6, 'La contraseña debe contener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [mostrarPruebasLocal, setMostrarPruebasLocal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await login(data.correo.trim().toLowerCase(), data.password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarCredencialLocal = (correo: string, pass: string) => {
    setValue('correo', correo, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F7FB] selection:bg-[#06285C] selection:text-white">
      {/* ============================================================== */}
      {/* PANEL IZQUIERDO: Identidad Institucional UNDC                   */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#06285C] via-[#001C45] to-[#041B3E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Elementos decorativos sutiles y elegantes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFD21E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#176BDA]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

        {/* Cabecera institucional con Escudo Oficial */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-center">
              <Image
                src="/escudo-undc.png"
                alt="Escudo Oficial Universidad Nacional de Cañete"
                width={72}
                height={72}
                className="w-full h-full object-contain filter drop-shadow"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-wider text-white">
                  TIDESK
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD21E] text-[#06285C] tracking-wide uppercase">
                  v2.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wide">
                Mesa de Ayuda Universitaria
              </p>
              <p className="text-[11px] text-[#FFD21E] font-bold uppercase tracking-widest mt-0.5">
                Universidad Nacional de Cañete
              </p>
            </div>
          </div>

          {/* Mensaje principal */}
          <div className="mt-12 lg:mt-16 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-amber-300 border border-white/15 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-amber-400" />
              Plataforma Oficial de Servicios TI
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white mt-4 leading-tight tracking-tight">
              Tu mesa de ayuda universitaria, en un solo lugar.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed font-normal">
              Gestiona tus requerimientos, reporta incidentes y realiza el seguimiento de los servicios tecnológicos de manera rápida, segura y organizada.
            </p>
          </div>
        </div>

        {/* Pie del panel con Lema Oficial */}
        <div className="relative z-10 pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              Principio Activo Innovador y Humanista
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dirección de Tecnologías de la Información • UNDC
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Servicios Operativos</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PANEL DERECHO: Tarjeta de Inicio de Sesión                      */}
      {/* ============================================================== */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80">
          <div>
            <h2 className="text-2xl font-black text-[#071B49] tracking-tight">
              Bienvenido a TIDESK
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Ingresa con tus credenciales institucionales.
            </p>
          </div>

          {/* Mensaje de Error Accesible */}
          {errorMsg && (
            <div
              role="alert"
              className="mt-5 p-4 rounded-2xl bg-red-50/90 border border-red-200 text-xs text-[#E51C3B] flex items-start gap-3 animate-in fade-in duration-200"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#E51C3B]" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold block mb-0.5">Acceso Denegado</span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="correo"
                className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
              >
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  {...register('correo')}
                  placeholder="usuario@undc.edu.pe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176BDA] focus:border-transparent transition-all ${
                    errors.correo ? 'border-[#E51C3B] bg-red-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.correo && (
                <p className="text-xs text-[#E51C3B] font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.correo.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setModalRecuperar(true)}
                  className="text-xs text-[#176BDA] font-semibold hover:underline cursor-pointer"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#176BDA] focus:border-transparent transition-all ${
                    errors.password ? 'border-[#E51C3B] bg-red-50/30' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#E51C3B] font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-[#06285C] hover:bg-[#001C45] text-white shadow-lg shadow-[#06285C]/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Herramientas de Prueba Local (Colapsadas por defecto, solo desarrollo) */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMostrarPruebasLocal(!mostrarPruebasLocal)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 py-1 font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
                <HelpCircle size={14} />
                Accesos de desarrollo local
              </span>
              {mostrarPruebasLocal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {mostrarPruebasLocal && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-500 mb-2 font-medium">
                  Selecciona una cuenta sembrada en la base de datos local:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => cargarCredencialLocal('admin@undc.edu.pe', 'Admin2026!')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-[#06285C] hover:bg-blue-50/50 text-left transition-all"
                  >
                    <p className="font-bold text-[#06285C]">Administrador</p>
                    <p className="text-[10px] text-slate-500 truncate">admin@undc.edu.pe</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => cargarCredencialLocal('coordinador.ti@undc.edu.pe', 'Coord2026!')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-[#06285C] hover:bg-blue-50/50 text-left transition-all"
                  >
                    <p className="font-bold text-indigo-700">Coordinador TI</p>
                    <p className="text-[10px] text-slate-500 truncate">coordinador.ti@...</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => cargarCredencialLocal('tecnico.sistemas@undc.edu.pe', 'Tecnico2026!')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-[#06285C] hover:bg-blue-50/50 text-left transition-all"
                  >
                    <p className="font-bold text-emerald-700">Técnico Soporte</p>
                    <p className="text-[10px] text-slate-500 truncate">tecnico.sistemas@...</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => cargarCredencialLocal('docente.ciencias@undc.edu.pe', 'Usuario2026!')}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-[#06285C] hover:bg-blue-50/50 text-left transition-all"
                  >
                    <p className="font-bold text-amber-700">Docente Solicitante</p>
                    <p className="text-[10px] text-slate-500 truncate">docente.ciencias@...</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: Recuperación de Contraseña Institucional                */}
      {/* ============================================================== */}
      {modalRecuperar && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setModalRecuperar(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#06285C] flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>

            <h3 className="text-xl font-bold text-[#06285C]">
              Recuperación de Contraseña
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Por políticas de seguridad de la Universidad Nacional de Cañete, el restablecimiento de contraseñas de cuentas institucionales (@undc.edu.pe) es gestionado por la Dirección de Tecnologías de la Información.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold">Soporte Técnico TI:</span>
                <span className="text-[#06285C] font-bold">soporte@undc.edu.pe</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold">Horario de Atención:</span>
                <span>Lun - Vie, 8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold">Sede Principal:</span>
                <span>Av. Mariscal Benavides 1370</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalRecuperar(false)}
              className="w-full mt-6 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#06285C] text-white hover:bg-[#001C45] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
