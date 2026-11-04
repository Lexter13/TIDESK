'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck2,
  GitPullRequest,
  Calendar,
  X,
  UserCheck,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function TicketsContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('tipo');
  const initialVista = searchParams.get('vista');

  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any>(null);
  const [especialistas, setEspecialistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Paginación y conteo
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Vistas rápidas (GLPI / ServiceDesk Plus)
  const [vista, setVista] = useState<string>(initialVista || 'todas');

  // Tipo ITIL
  const [tabTipo, setTabTipo] = useState<string>(initialType || 'TODOS');

  // Filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [estadoId, setEstadoId] = useState<string>('');
  const [prioridadId, setPrioridadId] = useState<string>('');
  const [areaId, setAreaId] = useState<string>('');
  const [especialistaId, setEspecialistaId] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  // Ordenamiento
  const [sortBy, setSortBy] = useState<string>('fechaCreacion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const esStaffTI =
    user?.rol === 'Administrador' ||
    user?.rol === 'Coordinador TI' ||
    user?.rol === 'Técnico TI';

  const loadData = async () => {
    try {
      setLoading(true);

      const [catData, espData, ticketsRes] = await Promise.all([
        catalogs ? Promise.resolve(catalogs) : api.catalogs.getAll(),
        especialistas.length > 0 ? Promise.resolve(especialistas) : api.catalogs.getEspecialistas(),
        api.tickets.getAll({
          page,
          limit,
          vista: vista !== 'todas' ? vista : undefined,
          search: search.trim() || undefined,
          idEstado: estadoId ? Number(estadoId) : undefined,
          idPrioridad: prioridadId ? Number(prioridadId) : undefined,
          idArea: areaId ? Number(areaId) : undefined,
          idEspecialista: especialistaId ? Number(especialistaId) : undefined,
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
          sortBy,
          sortOrder,
          idTipoTicket:
            tabTipo === 'REQ'
              ? 1
              : tabTipo === 'INC'
              ? 2
              : tabTipo === 'CRQ'
              ? 3
              : undefined,
        }),
      ]);

      if (!catalogs) setCatalogs(catData);
      if (especialistas.length === 0) setEspecialistas(espData || []);
      setTickets(ticketsRes.items || []);
      setTotal(ticketsRes.total || 0);
      setTotalPages(ticketsRes.totalPages || 1);
    } catch (err: any) {
      console.error('Error al cargar tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    page,
    limit,
    vista,
    tabTipo,
    estadoId,
    prioridadId,
    areaId,
    especialistaId,
    fechaDesde,
    fechaHasta,
    sortBy,
    sortOrder,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleClearFilters = () => {
    setSearch('');
    setEstadoId('');
    setPrioridadId('');
    setAreaId('');
    setEspecialistaId('');
    setFechaDesde('');
    setFechaHasta('');
    setTabTipo('TODOS');
    setVista('todas');
    setSortBy('fechaCreacion');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleTakeTicket = async (id: number, codigo: string) => {
    try {
      setTakingId(id);
      await api.tickets.take(id);
      setActionMessage({
        type: 'success',
        text: `Has tomado el ticket ${codigo}. El estado ha cambiado a "En atención".`,
      });
      await loadData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || `No se pudo tomar el ticket ${codigo}.`,
      });
    } finally {
      setTakingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const getTipoBadge = (codigo: string) => {
    switch (codigo) {
      case 'REQ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#06285C] border border-blue-200">
            <FileCheck2 className="w-3 h-3" />
            REQ
          </span>
        );
      case 'INC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-[#E51C3B] border border-red-200">
            <AlertTriangle className="w-3 h-3" />
            INC
          </span>
        );
      case 'CRQ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <GitPullRequest className="w-3 h-3" />
            CRQ
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
            {codigo}
          </span>
        );
    }
  };

  const getEstadoBadge = (nombre: string) => {
    switch (nombre) {
      case 'Pendiente':
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'Asignado':
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">
            <User className="w-3 h-3" /> Asignado
          </span>
        );
      case 'En atención':
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> En atención
          </span>
        );
      case 'En espera':
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> En espera
          </span>
        );
      case 'Resuelto':
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resuelto
          </span>
        );
      case 'Cerrado':
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300 inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> Cerrado
          </span>
        );
      case 'Cancelado':
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200">
            {nombre}
          </span>
        );
    }
  };

  const getPrioridadBadge = (nombre: string) => {
    switch (nombre) {
      case 'Crítica':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-600 text-white animate-pulse">
            Crítica
          </span>
        );
      case 'Alta':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-100 text-orange-800 border border-orange-200">
            Alta
          </span>
        );
      case 'Media':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-800 border border-amber-200">
            Media
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-normal rounded bg-gray-100 text-gray-700">
            Baja
          </span>
        );
    }
  };

  const renderSlaIndicator = (ticket: any) => {
    const isClosed = [5, 6].includes(ticket.idEstado); // Resuelto o Cerrado
    if (isClosed) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Cumplido
        </span>
      );
    }

    if (ticket.slaVencido) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          SLA Vencido
        </span>
      );
    }

    if (ticket.fechaLimiteResolucion) {
      const diffMs = new Date(ticket.fechaLimiteResolucion).getTime() - new Date().getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 2 && diffHours > 0) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Por vencer (&lt;2h)
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          En plazo
        </span>
      );
    }

    return <span className="text-[11px] text-gray-400">Sin SLA</span>;
  };

  return (
    <div className="space-y-6">
      {/* Toast de acción */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado Principal y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-[#06285C] rounded-lg">
              <Ticket className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-[#06285C]">Mesa de Servicios TI (ITSM)</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Universidad Nacional de Cañete • Bandeja de Gestión de Requerimientos, Incidentes y Cambios
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-gray-600 hover:text-[#06285C] bg-gray-50 hover:bg-gray-100 rounded-xl transition"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-[#06285C]' : ''}`} />
          </button>
          <Link
            href="/tickets/nuevo"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl font-medium shadow-md shadow-blue-900/10 transition active:scale-95"
          >
            <Plus className="w-5 h-5 text-[#FFD21E]" />
            <span>Crear Ticket</span>
          </Link>
        </div>
      </div>

      {/* Vistas Rápidas GLPI / ManageEngine */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'todas', label: 'Todos los Tickets', icon: Ticket },
          { id: 'mis_tickets', label: 'Mis Tickets', icon: User },
          { id: 'sin_asignar', label: 'Cola Sin Asignar', icon: Clock },
          { id: 'urgentes', label: 'Urgentes / Críticos', icon: AlertTriangle },
          { id: 'vencidos', label: 'Fuera de SLA (Vencidos)', icon: AlertCircle },
        ].map((v) => {
          const Icon = v.icon;
          const isActive = vista === v.id;
          return (
            <button
              key={v.id}
              onClick={() => {
                setVista(v.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#06285C] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? 'text-[#FFD21E]'
                    : v.id === 'vencidos'
                    ? 'text-red-500'
                    : v.id === 'urgentes'
                    ? 'text-orange-500'
                    : 'text-gray-400'
                }`}
              />
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pestañas de Tipo ITIL */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-6 pt-3 shadow-sm">
        {[
          { id: 'TODOS', label: 'Todos los Tipos' },
          { id: 'REQ', label: 'Requerimientos (REQ)' },
          { id: 'INC', label: 'Incidentes (INC)' },
          { id: 'CRQ', label: 'Gestión de Cambios (CRQ)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setTabTipo(tab.id);
              setPage(1);
            }}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              tabTipo === tab.id
                ? 'border-[#06285C] text-[#06285C]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-b-2xl border-x border-b border-gray-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar código, título, solicitante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06285C]"
            />
          </div>

          <div>
            <select
              value={estadoId}
              onChange={(e) => {
                setEstadoId(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06285C] bg-white text-gray-700"
            >
              <option value="">Todos los Estados</option>
              {catalogs?.estados?.map((est: any) => (
                <option key={est.idEstado} value={est.idEstado}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={prioridadId}
              onChange={(e) => {
                setPrioridadId(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06285C] bg-white text-gray-700"
            >
              <option value="">Todas las Prioridades</option>
              {catalogs?.prioridades?.map((p: any) => (
                <option key={p.idPrioridad} value={p.idPrioridad}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={areaId}
              onChange={(e) => {
                setAreaId(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06285C] bg-white text-gray-700"
            >
              <option value="">Todas las Áreas TI</option>
              {catalogs?.areas?.map((a: any) => (
                <option key={a.idArea} value={a.idArea}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                showFilters
                  ? 'bg-blue-50 border-blue-200 text-[#06285C]'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showFilters ? 'Menos filtros' : 'Más filtros'}</span>
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition"
              title="Limpiar todos los filtros"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Panel Desplegable de Filtros Avanzados */}
        {showFilters && (
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Especialista Asignado
              </label>
              <select
                value={especialistaId}
                onChange={(e) => {
                  setEspecialistaId(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
              >
                <option value="">Todos los especialistas</option>
                {especialistas.map((esp: any) => (
                  <option key={esp.idUsuario} value={esp.idUsuario}>
                    {esp.nombres} {esp.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabla Interactiva de Tickets */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#06285C]" />
            <p className="text-sm">Consultando registros en el servidor...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-700">No se encontraron tickets con los criterios actuales</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
              Prueba cambiando la vista rápida, limpiando los filtros o creando una nueva solicitud institucional.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-600 font-semibold text-xs">
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('codigo')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Código</span>
                      {sortBy === 'codigo' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('titulo')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Título y Clasificación</span>
                      {sortBy === 'titulo' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Solicitante</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('idPrioridad')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Prioridad</span>
                      {sortBy === 'idPrioridad' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('idEstado')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Estado</span>
                      {sortBy === 'idEstado' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">SLA</th>
                  <th className="py-3.5 px-4">Especialista</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('fechaCreacion')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Fecha</span>
                      {sortBy === 'fechaCreacion' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t) => {
                  const canTake =
                    esStaffTI &&
                    (t.idEstado === 1 || t.especialistaAsignado === 'Sin asignar') &&
                    t.idEspecialistaAsignado !== user?.idUsuario;

                  return (
                    <tr key={t.idTicket} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#06285C] whitespace-nowrap">
                        <Link
                          href={`/tickets/${t.idTicket}`}
                          className="hover:underline text-[#06285C]"
                        >
                          {t.codigo}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getTipoBadge(t.tipoTicket?.codigo)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/tickets/${t.idTicket}`}
                          className="font-medium text-gray-900 hover:text-[#06285C] truncate block"
                          title={t.titulo}
                        >
                          {t.titulo}
                        </Link>
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span>{t.area?.nombre}</span>
                          {t.categoria && (
                            <>
                              <span>•</span>
                              <span>{t.categoria?.nombre}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">
                          {t.solicitante
                            ? `${t.solicitante.nombres} ${t.solicitante.apellidos}`
                            : 'Anónimo'}
                        </div>
                        <div className="text-xs text-gray-400">{t.solicitante?.correo}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getPrioridadBadge(t.prioridad?.nombre)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getEstadoBadge(t.estado?.nombre)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderSlaIndicator(t)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                        {t.especialistaAsignado === 'Sin asignar' ? (
                          <span className="text-xs text-gray-400 italic">Sin asignar</span>
                        ) : (
                          <span className="text-xs font-medium text-[#06285C] bg-blue-50 px-2 py-1 rounded">
                            {t.especialistaAsignado}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(t.fechaCreacion).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {canTake && (
                            <button
                              onClick={() => handleTakeTicket(t.idTicket, t.codigo)}
                              disabled={takingId === t.idTicket}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                              title="Tomar y autoasignarme este ticket"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{takingId === t.idTicket ? 'Tomando...' : 'Tomar'}</span>
                            </button>
                          )}
                          <Link
                            href={`/tickets/${t.idTicket}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-[#06285C] hover:text-white text-[#06285C] rounded-lg text-xs font-semibold transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación y Selector de Límite */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div>
              Total registrados: <span className="font-semibold text-gray-800">{total}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span>Por página:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="py-1 px-2 border border-gray-200 rounded-lg bg-white text-gray-700"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#06285C]" />
          <p className="text-sm">Iniciando mesa de servicios...</p>
        </div>
      }
    >
      <TicketsContent />
    </Suspense>
  );
}
