'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Ticket,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  ArrowRight,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth, UserProfile } from '@/context/auth-context';

export default function MiPerfilPage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Usar endpoint REST /users/me o /auth/me
      const data = await api.users.getMe().catch(() => api.auth.me());
      setProfile(data);
    } catch (err: any) {
      console.error('Error cargando perfil:', err);
      setError('No pudimos cargar tu información de perfil institucional.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Si aún está cargando la llamada inicial
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Cabecera */}
        <div className="h-24 bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-72 bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>

        {/* Skeleton Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-24 h-24 bg-slate-200 rounded-2xl mx-auto" />
            <div className="h-5 w-40 bg-slate-200 rounded mx-auto" />
            <div className="h-4 w-48 bg-slate-100 rounded mx-auto" />
            <div className="h-8 w-28 bg-slate-100 rounded-full mx-auto" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-white rounded-2xl border border-slate-100 p-6" />
            <div className="h-64 bg-white rounded-2xl border border-slate-100 p-6" />
          </div>
        </div>
      </div>
    );
  }

  // Estado de error controlado
  if (error || !profile) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#06285C] mb-2">Error de Conexión</h2>
        <p className="text-sm text-slate-600 mb-6">
          {error || 'No fue posible recuperar tus datos del servidor institucional.'}
        </p>
        <button
          type="button"
          onClick={() => fetchProfile(false)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06285C] hover:bg-[#176BDA] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar Carga
        </button>
      </div>
    );
  }

  // Derivación segura de datos y roles
  const datosUsuario = profile;
  const rolNombre = datosUsuario.rol || 'Usuario';
  const idRol = datosUsuario.idRol || 0;
  const actividad = datosUsuario.actividad;
  const tipoRol = actividad?.tipoRol || 'SOLICITANTE';
  const metricas = actividad?.metricas || {};
  const ultimosTickets = actividad?.ultimosTickets || [];

  // Iniciales del usuario
  const iniciales = `${datosUsuario.nombres?.[0] || ''}${datosUsuario.apellidos?.[0] || ''}`.toUpperCase() || 'U';

  // Formato de fechas amigable
  const formatearFecha = (fechaStr?: string | null) => {
    if (!fechaStr) return 'No registrado';
    try {
      const d = new Date(fechaStr);
      if (isNaN(d.getTime())) return 'No registrado';
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return 'No registrado';
    }
  };

  // Color e insignia del rol institucional
  const obtenerBadgeRol = () => {
    if (idRol === 1 || rolNombre.toLowerCase().includes('admin')) {
      return {
        estilo: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-100',
        icono: ShieldCheck,
        texto: 'Administrador General',
      };
    }
    if (idRol === 2 || rolNombre.toLowerCase().includes('coord')) {
      return {
        estilo: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100',
        icono: Layers,
        texto: 'Coordinador TI',
      };
    }
    if (idRol === 3 || rolNombre.toLowerCase().includes('técnico') || rolNombre.toLowerCase().includes('tecnico')) {
      return {
        estilo: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100',
        icono: Sparkles,
        texto: 'Técnico de Soporte',
      };
    }
    if (idRol === 4 || rolNombre.toLowerCase().includes('docente')) {
      return {
        estilo: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
        icono: GraduationCap,
        texto: 'Docente Solicitante',
      };
    }
    if (idRol === 5 || rolNombre.toLowerCase().includes('estudiante')) {
      return {
        estilo: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
        icono: BookOpen,
        texto: 'Estudiante Solicitante',
      };
    }
    if (idRol === 6 || rolNombre.toLowerCase().includes('adminis')) {
      return {
        estilo: 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-100',
        icono: Building2,
        texto: 'Personal Administrativo',
      };
    }
    return {
      estilo: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-100',
      icono: User,
      texto: rolNombre,
    };
  };

  const badgeRol = obtenerBadgeRol();
  const IconoRol = badgeRol.icono;

  // Estado del ticket badge
  const badgeEstadoTicket = (estadoNombre: string) => {
    switch (estadoNombre) {
      case 'Pendiente':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Asignado':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'En atención':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'En espera':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Resuelto':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cerrado':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Cabecera y Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          {/* Breadcrumb discreto */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <Link href="/dashboard" className="hover:text-[#06285C] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-[#06285C] font-semibold">Mi Perfil Institucional</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#06285C] tracking-tight">Mi Perfil Institucional</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Información de tu cuenta, vinculación universitaria y actividad en TIDESK.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchProfile(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-[#06285C] text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
            title="Sincronizar información con el servidor"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#176BDA]' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
          </button>
        </div>
      </div>

      {/* 2. Cuerpo Principal en Dos Columnas (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Tarjeta de Identidad (4 de 12 columnas) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center relative overflow-hidden">
            {/* Adorno visual superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#06285C] via-[#176BDA] to-[#FFD21E]" />

            {/* Avatar Institucional */}
            <div className="mt-2 relative inline-block">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#06285C] to-[#176BDA] text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white">
                {iniciales}
              </div>
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                  datosUsuario.estado ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                title={datosUsuario.estado ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            </div>

            {/* Nombres y Correo */}
            <h2 className="mt-4 text-lg font-bold text-[#06285C] tracking-tight">
              {datosUsuario.nombreCompleto}
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[240px] mx-auto mt-0.5">
              {datosUsuario.correo}
            </p>

            {/* Badge de Rol */}
            <div className="mt-3 flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeRol.estilo}`}
              >
                <IconoRol className="w-3.5 h-3.5" />
                {badgeRol.texto}
              </span>
            </div>

            {/* Estado de Cuenta */}
            <div className="mt-2 flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  datosUsuario.estado
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    datosUsuario.estado ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                {datosUsuario.estado ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              </span>
            </div>

            {/* Código Institucional */}
            {datosUsuario.codigo && (
              <div className="mt-3 inline-block bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono font-bold text-[#06285C]">
                {datosUsuario.codigo}
              </div>
            )}

            {/* Resumen Rápido con Iconos */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-[#176BDA] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block">Sede Universitaria:</span>
                  <span className="text-slate-600">{datosUsuario.sede || 'No asignada'}</span>
                </div>
              </div>

              {datosUsuario.area && (
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Building2 className="w-4 h-4 text-[#176BDA] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Área / Dependencia:</span>
                    <span className="text-slate-600">{datosUsuario.area}</span>
                  </div>
                </div>
              )}

              {datosUsuario.facultad && (
                <div className="flex items-start gap-2.5 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-[#176BDA] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Facultad:</span>
                    <span className="text-slate-600">{datosUsuario.facultad}</span>
                  </div>
                </div>
              )}

              {datosUsuario.carrera && (
                <div className="flex items-start gap-2.5 text-slate-600">
                  <BookOpen className="w-4 h-4 text-[#176BDA] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Escuela Profesional:</span>
                    <span className="text-slate-600">{datosUsuario.carrera}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 text-slate-600">
                <Calendar className="w-4 h-4 text-[#176BDA] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block">Fecha de Registro:</span>
                  <span className="text-slate-600">{formatearFecha(datosUsuario.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600">
                <Clock className="w-4 h-4 text-[#176BDA] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block">Último Acceso:</span>
                  <span className="text-slate-600">
                    {datosUsuario.ultimoAcceso ? formatearFecha(datosUsuario.ultimoAcceso) : 'Sesión actual'}
                  </span>
                </div>
              </div>
            </div>

            {/* Aviso Institucional de Solo Lectura */}
            <div className="mt-5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-left flex items-start gap-2 text-[11px] text-blue-900">
              <Info className="w-4 h-4 text-[#176BDA] shrink-0 mt-0.5" />
              <span>
                Datos institucionales verificados. Para solicitudes de actualización, comunícate con la{' '}
                <strong>Oficina de Tecnologías de la Información (OTI)</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjetas de Información Detallada y Actividad (8 de 12 columnas) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tarjeta 1: Información Personal */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
              <div className="p-2.5 bg-blue-50 text-[#06285C] rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#06285C]">Información Personal</h3>
                <p className="text-xs text-slate-500">Datos personales de identificación en el campus</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Nombres</span>
                <span className="text-sm font-semibold text-slate-800">{datosUsuario.nombres || 'No registrado'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Apellidos</span>
                <span className="text-sm font-semibold text-slate-800">{datosUsuario.apellidos || 'No registrado'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Correo Electrónico Institucional</span>
                <span className="text-sm font-semibold text-slate-800 truncate block" title={datosUsuario.correo}>
                  {datosUsuario.correo}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Código Universitario</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {datosUsuario.codigo || 'No registrado'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Teléfono de Contacto</span>
                <span className="text-sm font-semibold text-slate-800">{datosUsuario.telefono || 'No registrado'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Estado de Vinculación</span>
                <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Miembro Activo UNDC
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Información Institucional */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
              <div className="p-2.5 bg-blue-50 text-[#06285C] rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#06285C]">Información Institucional</h3>
                <p className="text-xs text-slate-500">Adscripción y asignación en la estructura universitaria</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Rol Asignado</span>
                <span className="text-sm font-bold text-[#06285C]">{datosUsuario.rol}</span>
                {datosUsuario.rolDetalle?.descripcion && (
                  <span className="text-[11px] text-slate-500 block mt-1">
                    {datosUsuario.rolDetalle.descripcion}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Sede Principal</span>
                <span className="text-sm font-semibold text-slate-800">
                  {datosUsuario.sede || 'No asignada'}
                </span>
                {datosUsuario.sedeDetalle?.direccion && (
                  <span className="text-[11px] text-slate-500 block mt-1 truncate" title={datosUsuario.sedeDetalle.direccion}>
                    {datosUsuario.sedeDetalle.direccion}
                  </span>
                )}
              </div>

              {datosUsuario.area && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-1 font-medium">Área / Unidad Orgánica</span>
                  <span className="text-sm font-semibold text-slate-800">{datosUsuario.area}</span>
                  {datosUsuario.areaDetalle?.descripcion && (
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {datosUsuario.areaDetalle.descripcion}
                    </span>
                  )}
                </div>
              )}

              {datosUsuario.facultad && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-1 font-medium">Facultad</span>
                  <span className="text-sm font-semibold text-slate-800">{datosUsuario.facultad}</span>
                </div>
              )}

              {datosUsuario.carrera && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-1 font-medium">Carrera / Escuela Profesional</span>
                  <span className="text-sm font-semibold text-slate-800">{datosUsuario.carrera}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-1 font-medium">Entidad Universitaria</span>
                <span className="text-sm font-semibold text-slate-800">
                  Universidad Nacional de Cañete (UNDC)
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Mi Actividad en TIDESK (Contextual según Rol) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-[#06285C] rounded-xl">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#06285C]">Mi Actividad en TIDESK</h3>
                  <p className="text-xs text-slate-500">
                    {tipoRol === 'ADMINISTRADOR' && 'Registro de gestión y auditoría personal en la plataforma'}
                    {tipoRol === 'COORDINADOR' && 'Supervisión de asignaciones y solicitudes de cambio'}
                    {tipoRol === 'TECNICO' && 'Gestión de tickets y cumplimiento de acuerdos SLA'}
                    {tipoRol === 'SOLICITANTE' && 'Estado y trazabilidad de tus solicitudes de servicio'}
                  </p>
                </div>
              </div>
            </div>

            {/* Panel de Métricas Reales Dinámicas por Rol */}
            <div className="space-y-6">
              {/* CASO A: ADMINISTRADOR GENERAL */}
              {tipoRol === 'ADMINISTRADOR' && (
                <div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#176BDA] shrink-0" />
                    <span>
                      Estas métricas reflejan tu <strong>actividad personal</strong> como administrador. Para la
                      estadística global del campus, consulta el{' '}
                      <Link href="/dashboard" className="text-[#176BDA] font-semibold hover:underline">
                        Dashboard principal
                      </Link>
                      .
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                      <span className="text-2xl font-black text-[#06285C] block">
                        {metricas.ticketsCreados ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Tickets Registrados
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <span className="text-2xl font-black text-indigo-700 block">
                        {metricas.intervencionesComentarios ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Comentarios / Intervenciones
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <span className="text-2xl font-black text-purple-700 block">
                        {metricas.accionesRegistradas ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Acciones de Auditoría
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-2xl font-black text-emerald-700 block">
                        {metricas.asignacionesGestionadas ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Asignaciones Directas
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CASO B: COORDINADOR TI */}
              {tipoRol === 'COORDINADOR' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <span className="text-2xl font-black text-[#06285C] block">
                      {metricas.asignacionesRealizadas ?? 0}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                      Tickets Asignados
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-700 block">
                      {metricas.cambiosCrqSupervisados ?? 0}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                      Cambios CRQ Supervisados
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <span className="text-2xl font-black text-indigo-700 block">
                      {metricas.intervencionesComentarios ?? 0}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                      Comentarios Registrados
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                    <span className="text-2xl font-black text-amber-700 block">
                      {metricas.ticketsCreados ?? 0}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                      Mis Tickets Creados
                    </span>
                  </div>
                </div>
              )}

              {/* CASO C: TÉCNICO TI */}
              {tipoRol === 'TECNICO' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <span className="text-2xl font-black text-indigo-700 block">
                        {metricas.asignadosActivos ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Asignados Activos
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                      <span className="text-2xl font-black text-amber-700 block">
                        {metricas.enAtencion ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        En Atención
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <span className="text-2xl font-black text-purple-700 block">
                        {metricas.enEspera ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        En Espera
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-2xl font-black text-emerald-700 block">
                        {metricas.resueltos ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Resueltos por Mí
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                      <span className="text-2xl font-black text-slate-700 block">
                        {metricas.cerrados ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Cerrados Atendidos
                      </span>
                    </div>
                  </div>

                  {/* Alertas de Cumplimiento SLA para Técnicos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        (metricas.slaVencidos || 0) > 0
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold">SLA Vencidos bajo mi cargo:</span>
                      </div>
                      <span className="font-bold text-sm">{metricas.slaVencidos ?? 0}</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        (metricas.slaProximosVencer || 0) > 0
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">Próximos a vencer (&lt;24h):</span>
                      </div>
                      <span className="font-bold text-sm">{metricas.slaProximosVencer ?? 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CASO D: SOLICITANTES (DOCENTE, ESTUDIANTE, ADMINISTRATIVO O FALLBACK) */}
              {tipoRol === 'SOLICITANTE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                      <span className="text-2xl font-black text-[#06285C] block">
                        {metricas.totalTickets ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Total Solicitudes
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-100">
                      <span className="text-2xl font-black text-red-600 block">
                        {metricas.pendientes ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Pendientes
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                      <span className="text-2xl font-black text-amber-600 block">
                        {metricas.enAtencion ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        En Atención
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-2xl font-black text-emerald-600 block">
                        {metricas.resueltos ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Resueltos
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                      <span className="text-2xl font-black text-slate-700 block">
                        {metricas.cerrados ?? 0}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 mt-1 block">
                        Cerrados
                      </span>
                    </div>
                  </div>

                  {/* Desglose por tipo de requerimiento si aplica */}
                  {metricas.porTipo && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Desglose por tipo:</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        <Tag className="w-3 h-3" />
                        Requerimientos: <strong>{metricas.porTipo.requerimientos ?? 0}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-100">
                        <AlertCircle className="w-3 h-3" />
                        Incidentes: <strong>{metricas.porTipo.incidentes ?? 0}</strong>
                      </span>
                      {metricas.porTipo.cambios > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Layers className="w-3 h-3" />
                          Cambios: <strong>{metricas.porTipo.cambios}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Últimos Tickets Relacionados */}
              <div className="pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {tipoRol === 'TECNICO'
                      ? 'Últimos Tickets Asignados o Atendidos'
                      : 'Últimas Solicitudes Registradas'}
                  </h4>
                  <Link
                    href="/tickets"
                    className="text-xs font-semibold text-[#176BDA] hover:text-[#06285C] flex items-center gap-1"
                  >
                    Ver todos
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {ultimosTickets.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">
                      No hay registros recientes de tickets asociados a tu cuenta institucional.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Tipo</th>
                          <th className="py-2.5 px-3">Título</th>
                          <th className="py-2.5 px-3">Prioridad</th>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3 text-right">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ultimosTickets.map((t: any) => (
                          <tr key={t.idTicket} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#06285C]">
                              <Link
                                href={`/tickets/${t.idTicket}`}
                                className="hover:text-[#176BDA] hover:underline flex items-center gap-1"
                              >
                                {t.codigo}
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </Link>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-700">
                                {t.tipoTicket?.codigo || 'REQ'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-[200px] truncate" title={t.titulo}>
                              {t.titulo}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-slate-600">{t.prioridad?.nombre || 'Media'}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full font-medium text-[11px] border ${badgeEstadoTicket(
                                  t.estado?.nombre
                                )}`}
                              >
                                {t.estado?.nombre}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-500">
                              {formatearFecha(t.fechaCreacion)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

