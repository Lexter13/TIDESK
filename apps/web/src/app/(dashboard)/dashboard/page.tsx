'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  Award,
  AlertTriangle,
  UserCheck,
  GitPullRequest,
  BarChart3,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

const COLORES_TIPO: Record<string, string> = {
  REQ: '#176BDA', // Azul de requerimiento
  INC: '#E51C3B', // Rojo de incidente
  CRQ: '#009B60', // Verde de cambio CAB
};

const COLORES_ESTADO: Record<string, string> = {
  Pendiente: '#E51C3B',
  Asignado: '#6366F1',
  'En atención': '#F59E0B',
  'En espera': '#8B5CF6',
  Resuelto: '#009B60',
  Cerrado: '#10B981',
  Rechazado: '#64748B',
  Cancelado: '#94A3B8',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtros interactivos
  const [periodo, setPeriodo] = useState('este_mes');
  const [idTipoTicket, setIdTipoTicket] = useState('');
  const [idPrioridad, setIdPrioridad] = useState('');
  const [idSede, setIdSede] = useState('');
  const [search, setSearch] = useState('');

  const esAdmin = user?.rol === 'Administrador';
  const esCoord = user?.rol === 'Coordinador TI';
  const esTecnico = user?.rol === 'Técnico TI';
  const esSolicitante = ['Docente', 'Estudiante', 'Administrativo'].includes(user?.rol || '');

  // Catálogos para filtros
  const { data: catalogos } = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => api.catalogs.getAll(),
  });

  // Métricas del Dashboard desde backend real
  const {
    data: stats,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboard-stats', periodo, idTipoTicket, idPrioridad, idSede],
    queryFn: () =>
      api.dashboard.getStats({
        periodo,
        idTipoTicket: idTipoTicket || undefined,
        idPrioridad: idPrioridad || undefined,
        idSede: idSede || undefined,
      }),
    refetchInterval: 30000,
  });

  const kpis = stats?.kpis || {
    totalTickets: { valor: 0, variacion: '—', tendencia: 'neutral' },
    resueltos: { valor: 0, variacion: '—', tendencia: 'neutral' },
    enAtencion: { valor: 0, variacion: '—', tendencia: 'neutral' },
    pendientes: { valor: 0, variacion: '—', tendencia: 'neutral' },
    ticketsVencidos: { valor: 0, descripcion: 'SLA de resolución excedido' },
    cumplimientoSla: { valor: '100%', evaluados: 0, cumplidos: 0 },
    ticketsCriticos: { valor: 0, descripcion: 'Prioridad 1 en curso' },
    tiempoPromedioResolucion: { valor: 'N/D', descripcion: 'Media de resolución efectiva' },
    ticketsSinAsignar: { valor: 0, descripcion: 'Por asignar' },
    crqPendientes: { valor: 0, descripcion: 'Cambios en evaluación' },
  };

  const graficos = stats?.graficos || {
    ticketsPorTipo: [],
    ticketsPorEstado: [],
    categoriasMasSolicitadas: [],
    ticketsPorMes: [],
  };

  const cargaEspecialistas = stats?.cargaEspecialistas || [];

  const ticketsRecientes = (stats?.ticketsRecientes || []).filter((t: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.codigo.toLowerCase().includes(q) ||
      t.asunto.toLowerCase().includes(q) ||
      t.solicitante.toLowerCase().includes(q) ||
      t.categoria.toLowerCase().includes(q) ||
      (t.especialista && t.especialista.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. BANNER INSTITUCIONAL & ENCABEZADO DE BIENVENIDA             */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-[#06285C] via-[#001C45] to-[#041B3E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD21E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#176BDA]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 p-2 flex items-center justify-center shrink-0 border border-white/15 backdrop-blur-md shadow-lg">
              <Image
                src="/escudo-undc.png"
                alt="Escudo Oficial UNDC"
                width={56}
                height={56}
                className="w-full h-full object-contain filter drop-shadow"
                priority
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Hola, {user?.nombres || 'Usuario'}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FFD21E] text-[#06285C] shadow-sm">
                  {user?.rol || 'Usuario Institucional'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {esSolicitante
                  ? 'Consulta el estado de tus requerimientos tecnológicos y reporta incidentes de TI en tiempo real.'
                  : esTecnico
                  ? 'Gestiona tus tickets asignados, registra diagnósticos y da cumplimiento a los tiempos de SLA.'
                  : 'Panel ejecutivo de supervisión, control de tickets ITIL y auditoría de servicios TI de la UNDC.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refrescar métricas"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <Link
              href="/tickets/nuevo"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFD21E] hover:bg-amber-400 text-[#06285C] text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Nuevo Ticket</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BARRA DE FILTROS INTERACTIVOS CON CONSULTA REAL              */}
      {/* ============================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
          <Filter size={15} className="text-[#06285C]" />
          <span>Filtros Operativos:</span>
        </div>

        {/* Selector de Periodo */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'hoy', label: 'Hoy' },
            { id: '7dias', label: '7 Días' },
            { id: 'este_mes', label: 'Este Mes' },
            { id: 'mes_anterior', label: 'Mes Anterior' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriodo(item.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodo === item.id
                  ? 'bg-white text-[#06285C] font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tipo de Ticket */}
        <select
          value={idTipoTicket}
          onChange={(e) => setIdTipoTicket(e.target.value)}
          className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176BDA] text-slate-700"
        >
          <option value="">Todos los Tipos (REQ, INC, CRQ)</option>
          {catalogos?.tiposTicket?.map((t: any) => (
            <option key={t.idTipoTicket} value={t.idTipoTicket}>
              {t.codigo} - {t.nombre}
            </option>
          ))}
        </select>

        {/* Prioridad */}
        <select
          value={idPrioridad}
          onChange={(e) => setIdPrioridad(e.target.value)}
          className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176BDA] text-slate-700"
        >
          <option value="">Todas las Prioridades</option>
          {catalogos?.prioridades?.map((p: any) => (
            <option key={p.idPrioridad} value={p.idPrioridad}>
              {p.nombre}
            </option>
          ))}
        </select>

        {/* Sede */}
        <select
          value={idSede}
          onChange={(e) => setIdSede(e.target.value)}
          className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176BDA] text-slate-700"
        >
          <option value="">Todas las Sedes UNDC</option>
          {catalogos?.sedes?.map((s: any) => (
            <option key={s.idSede} value={s.idSede}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* ============================================================== */}
      {/* 3. INDICADORES PRINCIPALES (KPIS)                               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de Tickets
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#176BDA] flex items-center justify-center font-bold">
              <Ticket size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#071B49]">{kpis.totalTickets.valor}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span
                className={`font-bold flex items-center ${
                  kpis.totalTickets.tendencia === 'up'
                    ? 'text-blue-600'
                    : kpis.totalTickets.tendencia === 'down'
                    ? 'text-slate-600'
                    : 'text-slate-500'
                }`}
              >
                {kpis.totalTickets.tendencia === 'up' && <TrendingUp size={12} className="mr-0.5" />}
                {kpis.totalTickets.tendencia === 'down' && <TrendingDown size={12} className="mr-0.5" />}
                {kpis.totalTickets.tendencia === 'neutral' && <Minus size={12} className="mr-0.5" />}
                {kpis.totalTickets.variacion}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#176BDA]" />
        </div>

        {/* Resueltos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resueltos / Cerrados
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009B60] flex items-center justify-center font-bold">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#009B60]">{kpis.resueltos.valor}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span
                className={`font-bold flex items-center ${
                  kpis.resueltos.tendencia === 'up'
                    ? 'text-emerald-600'
                    : kpis.resueltos.tendencia === 'down'
                    ? 'text-amber-600'
                    : 'text-slate-500'
                }`}
              >
                {kpis.resueltos.tendencia === 'up' && <TrendingUp size={12} className="mr-0.5" />}
                {kpis.resueltos.tendencia === 'down' && <TrendingDown size={12} className="mr-0.5" />}
                {kpis.resueltos.tendencia === 'neutral' && <Minus size={12} className="mr-0.5" />}
                {kpis.resueltos.variacion}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#009B60]" />
        </div>

        {/* En Atención */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              En Atención Activa
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-500">{kpis.enAtencion.valor}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span className="font-bold text-amber-600 flex items-center">
                {kpis.enAtencion.tendencia === 'up' && <TrendingUp size={12} className="mr-0.5" />}
                {kpis.enAtencion.tendencia === 'down' && <TrendingDown size={12} className="mr-0.5" />}
                {kpis.enAtencion.tendencia === 'neutral' && <Minus size={12} className="mr-0.5" />}
                {kpis.enAtencion.variacion}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFD21E]" />
        </div>

        {/* Pendientes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pendientes de Asignar
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E51C3B] flex items-center justify-center font-bold">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#E51C3B]">{kpis.pendientes.valor}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <span className="font-bold text-red-600 flex items-center">
                {kpis.pendientes.tendencia === 'up' && <TrendingUp size={12} className="mr-0.5" />}
                {kpis.pendientes.tendencia === 'down' && <TrendingDown size={12} className="mr-0.5" />}
                {kpis.pendientes.tendencia === 'neutral' && <Minus size={12} className="mr-0.5" />}
                {kpis.pendientes.variacion}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E51C3B]" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SEGUNDA FILA: MÉTRICAS OPERATIVAS DE SLA Y CALIDAD          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumplimiento SLA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#009B60] flex items-center justify-center shrink-0">
            <Award size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cumplimiento SLA</p>
            <p className="text-xl font-black text-[#071B49]">{kpis.cumplimientoSla.valor}</p>
            <p className="text-[10px] text-slate-500">{kpis.cumplimientoSla.cumplidos} de {kpis.cumplimientoSla.evaluados} evaluados</p>
          </div>
        </div>

        {/* Tickets Vencidos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            kpis.ticketsVencidos.valor > 0 ? 'bg-red-50 text-[#E51C3B]' : 'bg-slate-50 text-slate-400'
          }`}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tickets Vencidos</p>
            <p className={`text-xl font-black ${kpis.ticketsVencidos.valor > 0 ? 'text-[#E51C3B]' : 'text-slate-800'}`}>
              {kpis.ticketsVencidos.valor}
            </p>
            <p className="text-[10px] text-slate-500">{kpis.ticketsVencidos.descripcion}</p>
          </div>
        </div>

        {/* Tickets Críticos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            kpis.ticketsCriticos.valor > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Incidentes Críticos</p>
            <p className={`text-xl font-black ${kpis.ticketsCriticos.valor > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {kpis.ticketsCriticos.valor}
            </p>
            <p className="text-[10px] text-slate-500">{kpis.ticketsCriticos.descripcion}</p>
          </div>
        </div>

        {/* Tiempo Promedio de Resolución */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#06285C] flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiempo Promedio</p>
            <p className="text-xl font-black text-[#071B49]">{kpis.tiempoPromedioResolucion.valor}</p>
            <p className="text-[10px] text-slate-500">{kpis.tiempoPromedioResolucion.descripcion}</p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. VISTA ADAPTADA AL ROL: Carga Operativa & Supervisión         */}
      {/* ============================================================== */}
      {(esAdmin || esCoord) && cargaEspecialistas.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#06285C]" />
              <h2 className="text-sm font-bold text-[#071B49]">Carga Operativa de Especialistas TI</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Asignaciones en curso</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cargaEspecialistas.map((esp: any) => (
              <div
                key={esp.idUsuario}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#06285C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {esp.nombre[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{esp.nombre}</p>
                    <p className="text-[10px] text-slate-500">Técnico TI</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  esp.ticketsActivos > 3
                    ? 'bg-red-100 text-[#E51C3B]'
                    : esp.ticketsActivos > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {esp.ticketsActivos} {esp.ticketsActivos === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. GRÁFICOS ANALÍTICOS ITSM                                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Tickets por Tipo (Dona) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#071B49]">Tickets por Tipo</h2>
            <p className="text-[11px] text-slate-500">Distribución de REQ, INC y CRQ</p>
          </div>

          <div className="h-56 mt-2 relative flex items-center justify-center">
            {!mounted || graficos.ticketsPorTipo.every((t: any) => t.cantidad === 0) ? (
              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Layers size={32} className="mb-2 opacity-50 text-[#06285C]" />
                <p className="text-xs font-medium">Sin tickets registrados en el periodo</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graficos.ticketsPorTipo}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="cantidad"
                    nameKey="codigo"
                  >
                    {graficos.ticketsPorTipo.map((entry: any) => (
                      <Cell
                        key={`cell-${entry.codigo}`}
                        fill={COLORES_TIPO[entry.codigo] || '#64748B'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} tickets (${item.payload.porcentaje}%)`,
                      item.payload.nombre,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            {graficos.ticketsPorTipo.map((t: any) => (
              <div key={t.codigo} className="flex flex-col items-center">
                <span className="flex items-center gap-1 font-bold text-[#071B49]">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORES_TIPO[t.codigo] || '#64748B' }}
                  />
                  {t.codigo}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {t.cantidad} ({t.porcentaje}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Tickets por Estado (Barras Verticales) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#071B49]">Tickets por Estado</h2>
            <p className="text-[11px] text-slate-500">Volumen actual por fase de atención</p>
          </div>

          <div className="h-64 mt-2">
            {!mounted || graficos.ticketsPorEstado.every((e: any) => e.cantidad === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <BarChart3 size={32} className="mb-2 opacity-50 text-[#06285C]" />
                <p className="text-xs font-medium">Sin datos de estados para mostrar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={graficos.ticketsPorEstado}
                  margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" name="Tickets" radius={[6, 6, 0, 0]}>
                    {graficos.ticketsPorEstado.map((entry: any) => (
                      <Cell
                        key={`bar-${entry.idEstado}`}
                        fill={COLORES_ESTADO[entry.nombre] || '#176BDA'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 3: Categorías Más Solicitadas (Barras Horizontales) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#071B49]">Categorías Más Solicitadas</h2>
            <p className="text-[11px] text-slate-500">Demanda de servicios institucionales</p>
          </div>

          <div className="h-64 mt-2">
            {!mounted || graficos.categoriasMasSolicitadas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Layers size={32} className="mb-2 opacity-50 text-[#06285C]" />
                <p className="text-xs font-medium">Sin solicitudes categorizadas</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={graficos.categoriasMasSolicitadas}
                  margin={{ top: 10, right: 15, left: 35, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    tick={{ fontSize: 9, fill: '#071B49' }}
                    width={90}
                  />
                  <Tooltip />
                  <Bar dataKey="cantidad" name="Tickets" fill="#06285C" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. EVOLUCIÓN HISTÓRICA MENSUAL (ÁREA / TENDENCIA)               */}
      {/* ============================================================== */}
      {graficos.ticketsPorMes && graficos.ticketsPorMes.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-[#071B49]">Evolución Mensual de Servicios</h2>
              <p className="text-[11px] text-slate-500">Volumen histórico de tickets atendidos en los últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#176BDA]" /> REQ
              </span>
              <span className="flex items-center gap-1.5 text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E51C3B]" /> INC
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#009B60]" /> CRQ
              </span>
            </div>
          </div>

          <div className="h-56 mt-4">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graficos.ticketsPorMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06285C" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06285C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Tickets"
                    stroke="#06285C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. TABLA DE TICKETS RECIENTES (DETALLADA CON ASIGNACIÓN)        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#071B49]">Bandeja de Tickets Recientes</h2>
            <p className="text-xs text-slate-500">Últimas solicitudes ingresadas a la plataforma</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código, asunto, técnico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#176BDA] w-56 sm:w-64"
              />
            </div>

            <Link
              href="/tickets"
              className="text-xs font-bold text-[#176BDA] hover:underline flex items-center gap-1 shrink-0"
            >
              Ver bandeja completa <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Tabla Responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-2">Tipo</th>
                <th className="py-3 px-3">Asunto</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Solicitante</th>
                <th className="py-3 px-3">Especialista</th>
                <th className="py-3 px-2">Prioridad</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ticketsRecientes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-xs text-slate-400">
                    No se encontraron tickets con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                ticketsRecientes.map((ticket: any) => {
                  const esReq = ticket.tipo === 'REQ';
                  const esInc = ticket.tipo === 'INC';

                  return (
                    <tr key={ticket.idTicket} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#06285C]">
                        {ticket.codigo}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            esReq
                              ? 'bg-blue-100 text-blue-800'
                              : esInc
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ticket.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-slate-900 font-semibold">
                        {ticket.asunto}
                      </td>
                      <td className="py-3 px-3 text-slate-500 truncate max-w-[130px]">
                        {ticket.categoria}
                      </td>
                      <td className="py-3 px-3 text-slate-700 truncate max-w-[120px]">
                        {ticket.solicitante}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[120px]">
                        <span className={`inline-flex items-center gap-1 ${
                          ticket.especialista === 'Sin asignar' ? 'text-amber-600 font-semibold' : ''
                        }`}>
                          <UserCheck size={13} className="shrink-0 text-slate-400" />
                          {ticket.especialista}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ticket.prioridad === 'Crítica'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : ticket.prioridad === 'Alta'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : ticket.prioridad === 'Media'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {ticket.prioridad}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                            ticket.idEstado === 5 || ticket.idEstado === 6
                              ? 'bg-emerald-100 text-emerald-800'
                              : ticket.idEstado === 3
                              ? 'bg-amber-100 text-amber-800'
                              : ticket.idEstado === 1
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: COLORES_ESTADO[ticket.estado] || '#64748B' }}
                          />
                          {ticket.estado}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(ticket.fechaCreacion).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/tickets/${ticket.idTicket}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#06285C] hover:text-white text-slate-700 text-xs font-semibold transition-all"
                        >
                          Ver <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
