'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Plus,
  Search,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  Activity,
  Layers,
  RefreshCw,
  UserCheck,
  Check,
  Filter,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function IncidentesContent() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [takingId, setTakingId] = useState<number | null>(null);

  const esStaffTI =
    user?.rol === 'Administrador' ||
    user?.rol === 'Coordinador TI' ||
    user?.rol === 'Técnico TI';

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, catData] = await Promise.all([
        api.tickets.getAll({
          idTipoTicket: 2, // INC
          limit: 30,
          search: search.trim() || undefined,
          idPrioridad: filtroPrioridad ? Number(filtroPrioridad) : undefined,
          idEstado: filtroEstado ? Number(filtroEstado) : undefined,
        }),
        catalogs ? Promise.resolve(catalogs) : api.catalogs.getAll(),
      ]);
      setTickets(ticketsRes.items || []);
      if (!catalogs) setCatalogs(catData);
    } catch (err) {
      console.error('Error al cargar incidentes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filtroPrioridad, filtroEstado]);

  const handleTakeTicket = async (id: number) => {
    try {
      setTakingId(id);
      await api.tickets.take(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo tomar el incidente.');
    } finally {
      setTakingId(null);
    }
  };

  const criticos = tickets.filter(
    (t) => t.prioridad?.nombre === 'Crítica' && [1, 2, 3, 4].includes(t.idEstado)
  );
  const altos = tickets.filter(
    (t) => t.prioridad?.nombre === 'Alta' && [1, 2, 3, 4].includes(t.idEstado)
  );
  const enAtencion = tickets.filter((t) => t.idEstado === 3);
  const resueltos = tickets.filter((t) => [5, 6].includes(t.idEstado));

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#E51C3B] rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">Gestión de Incidentes TI (INC)</h1>
            <p className="text-sm text-gray-500">
              Protocolo ITIL para restaurar la operatividad de servicios institucionales en el menor tiempo posible
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-gray-600 hover:text-[#06285C] bg-gray-50 hover:bg-gray-100 rounded-xl transition"
            title="Refrescar incidentes"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-[#06285C]' : ''}`} />
          </button>
          <Link
            href="/tickets/nuevo?tipo=INC"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E51C3B] hover:bg-red-700 text-white rounded-xl font-medium shadow-md shadow-red-600/20 transition active:scale-95 text-sm"
          >
            <Flame className="w-4 h-4 text-[#FFD21E]" />
            <span>Reportar Incidencia Urgente</span>
          </Link>
        </div>
      </div>

      {/* Alerta de Incidentes Críticos Activos */}
      {criticos.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 rounded-2xl shadow-lg shadow-red-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShieldAlert className="w-6 h-6 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                ¡Atención prioritaria!: {criticos.length} Incidente(s) Crítico(s) en curso
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Afectan servicios centrales de la UNDC. Requieren intervención inmediata (SLA Máximo: 2 horas).
              </p>
            </div>
          </div>
          <Link
            href={`/tickets/${criticos[0].idTicket}`}
            className="px-4 py-2 bg-white text-red-700 hover:bg-yellow-100 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-sm"
          >
            Atender Crítico #{criticos[0].codigo}
          </Link>
        </div>
      )}

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Críticos Activos (P1)</div>
          <div className="text-3xl font-extrabold text-[#E51C3B] mt-1">{criticos.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Interrupción de servicio esencial</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Alta Prioridad (P2)</div>
          <div className="text-3xl font-extrabold text-orange-600 mt-1">{altos.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Degradación significativa</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">En Diagnóstico / Atención</div>
          <div className="text-3xl font-extrabold text-[#06285C] mt-1">{enAtencion.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Con técnico asignado trabajando</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Resueltos / Cerrados</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{resueltos.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Servicio restaurado con éxito</p>
        </div>
      </div>

      {/* Matriz ITIL de Priorización Operativa */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2 border-b pb-2">
          <Layers className="w-4 h-4 text-[#06285C]" />
          Matriz ITIL v4 de Priorización de Fallas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
            <div className="font-bold text-red-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Crítica (P1)
            </div>
            <div className="text-gray-600 mt-1">Impacto Alto × Urgencia Alta</div>
            <div className="text-red-700 font-semibold mt-1">Resp: 15 min • Res: 2 h</div>
          </div>

          <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl">
            <div className="font-bold text-orange-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Alta (P2)
            </div>
            <div className="text-gray-600 mt-1">Impacto Medio × Urgencia Alta</div>
            <div className="text-orange-700 font-semibold mt-1">Resp: 30 min • Res: 4 h</div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Media (P3)
            </div>
            <div className="text-gray-600 mt-1">Impacto Medio × Urgencia Media</div>
            <div className="text-amber-700 font-semibold mt-1">Resp: 1 h • Res: 8 h</div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Baja (P4)
            </div>
            <div className="text-gray-600 mt-1">Impacto Bajo × Urgencia Baja</div>
            <div className="text-blue-700 font-semibold mt-1">Resp: 2 h • Res: 24 h</div>
          </div>
        </div>
      </div>

      {/* Lista y Filtros de Incidentes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#E51C3B]" />
            Listado de Incidentes Registrados ({tickets.length})
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
            >
              <option value="">Todas las prioridades</option>
              {catalogs?.prioridades?.map((p: any) => (
                <option key={p.idPrioridad} value={p.idPrioridad}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
            >
              <option value="">Todos los estados</option>
              {catalogs?.estados?.map((est: any) => (
                <option key={est.idEstado} value={est.idEstado}>
                  {est.nombre}
                </option>
              ))}
            </select>

            <div className="relative w-48 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar falla o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E51C3B]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E51C3B]" />
            Consultando incidentes...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No se registran incidentes con los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b text-gray-600 font-semibold">
                  <th className="p-3.5">Código</th>
                  <th className="p-3.5">Título de la Falla</th>
                  <th className="p-3.5">Prioridad</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Área Afectada</th>
                  <th className="p-3.5">Especialista</th>
                  <th className="p-3.5">SLA</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t) => {
                  const canTake =
                    esStaffTI &&
                    (t.idEstado === 1 || t.especialistaAsignado === 'Sin asignar') &&
                    t.idEspecialistaAsignado !== user?.idUsuario;

                  return (
                    <tr key={t.idTicket} className="hover:bg-red-50/20 transition">
                      <td className="p-3.5 font-mono font-bold text-[#E51C3B] whitespace-nowrap">
                        <Link href={`/tickets/${t.idTicket}`} className="hover:underline">
                          {t.codigo}
                        </Link>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-medium text-gray-900 truncate" title={t.titulo}>
                          {t.titulo}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {t.categoria?.nombre || 'General'}
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            t.prioridad?.nombre === 'Crítica'
                              ? 'bg-red-600 text-white animate-pulse'
                              : t.prioridad?.nombre === 'Alta'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.prioridad?.nombre}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                          {t.estado?.nombre}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600 whitespace-nowrap">{t.area?.nombre}</td>
                      <td className="p-3.5 text-gray-600 whitespace-nowrap">
                        {t.especialistaAsignado === 'Sin asignar' ? (
                          <span className="italic text-gray-400">Sin asignar</span>
                        ) : (
                          <span className="font-semibold text-[#06285C]">{t.especialistaAsignado}</span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {t.slaVencido ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Vencido
                          </span>
                        ) : [5, 6].includes(t.idEstado) ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Cumplido
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            En plazo
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(t.fechaCreacion).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {canTake && (
                            <button
                              onClick={() => handleTakeTicket(t.idTicket)}
                              disabled={takingId === t.idTicket}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition text-[11px]"
                              title="Tomar este incidente"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>{takingId === t.idTicket ? '...' : 'Tomar'}</span>
                            </button>
                          )}
                          <Link
                            href={`/tickets/${t.idTicket}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-[#E51C3B] hover:text-white text-gray-800 rounded-lg font-semibold transition"
                          >
                            <Eye className="w-3 h-3" /> Ver
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
      </div>
    </div>
  );
}

export default function IncidentesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#E51C3B]" />
          <p className="text-sm">Iniciando módulo de incidentes...</p>
        </div>
      }
    >
      <IncidentesContent />
    </Suspense>
  );
}
