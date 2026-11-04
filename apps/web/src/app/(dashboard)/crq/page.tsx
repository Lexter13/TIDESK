'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  GitPullRequest,
  Plus,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Vote,
  Users,
  Settings2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function CrqContent() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const esAdminOCoord =
    user?.rol === 'Administrador' ||
    user?.rol === 'Coordinador TI' ||
    user?.rol === 'Técnico TI';

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.tickets.getAll({
        idTipoTicket: 3, // CRQ
        limit: 30,
        search: search.trim() || undefined,
        idEstado: filtroEstado ? Number(filtroEstado) : undefined,
      });
      setTickets(res.items || []);
    } catch (err) {
      console.error('Error al cargar CRQ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filtroEstado]);

  const enCab = tickets.filter((t) => [1, 2].includes(t.idEstado));
  const aprobadosProgramados = tickets.filter((t) => [3, 4].includes(t.idEstado));
  const ejecutadosExitosos = tickets.filter((t) => [5, 6].includes(t.idEstado));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">Gestión de Cambios de Infraestructura (CRQ)</h1>
            <p className="text-sm text-gray-500">
              Control estructurado ITIL para ventanas de mantenimiento y comités CAB en la Universidad Nacional de Cañete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-gray-600 hover:text-purple-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
            title="Refrescar cambios"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-purple-700' : ''}`} />
          </button>
          {esAdminOCoord && (
            <Link
              href="/tickets/nuevo?tipo=CRQ"
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-medium shadow-md shadow-purple-900/10 transition active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4 text-[#FFD21E]" />
              <span>Programar Cambio / CRQ</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tarjetas de Resumen CAB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Total Cambios CRQ</div>
          <div className="text-3xl font-extrabold text-[#06285C] mt-1">{tickets.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Registrados en la plataforma</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">En Evaluación CAB</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{enCab.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Pendientes de dictamen colegiado</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Aprobados / En Ventana</div>
          <div className="text-3xl font-extrabold text-purple-700 mt-1">{aprobadosProgramados.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Listos para ejecución técnica</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Ejecutados con Éxito</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{ejecutadosExitosos.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Con pruebas satisfactorias</p>
        </div>
      </div>

      {/* Protocolo ITIL y Comité CAB */}
      <div className="bg-gradient-to-r from-purple-900 to-[#06285C] text-white p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Vote className="w-5 h-5 text-[#FFD21E]" />
          <h2 className="text-base font-bold">Comité Consultivo de Cambios (CAB – UNDC)</h2>
        </div>
        <p className="text-xs text-purple-100 leading-relaxed max-w-4xl">
          Toda modificación en servidores centrales, redes perimetrales o bases de datos de la universidad exige un expediente técnico riguroso compuesto por tres planes ITIL: <strong>Plan de Trabajo detallado</strong>, <strong>Plan de Pruebas de Validación</strong> y <strong>Plan de Reversa (Rollback)</strong> ante contingencias. La ejecución requiere la aprobación explícita de los coordinadores y administradores del CAB.
        </p>
      </div>

      {/* Listado de Solicitudes de Cambio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-700" />
            Ventanas de Mantenimiento y Cambios ({tickets.length})
          </h2>

          <div className="flex items-center gap-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
            >
              <option value="">Todos los estados</option>
              <option value="1">Pendiente (En revisión)</option>
              <option value="2">Asignado</option>
              <option value="3">En atención (En ventana)</option>
              <option value="5">Resuelto</option>
              <option value="6">Cerrado</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código o título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-700"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-700" />
            Consultando solicitudes de cambio...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No hay solicitudes de cambio registradas con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b text-gray-600 font-semibold">
                  <th className="p-3.5">Código</th>
                  <th className="p-3.5">Título del Cambio</th>
                  <th className="p-3.5">Solicitante</th>
                  <th className="p-3.5">Área TI</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Prioridad</th>
                  <th className="p-3.5">Fecha de Registro</th>
                  <th className="p-3.5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t) => (
                  <tr key={t.idTicket} className="hover:bg-purple-50/30 transition">
                    <td className="p-3.5 font-mono font-bold text-purple-900 whitespace-nowrap">
                      <Link href={`/tickets/${t.idTicket}`} className="hover:underline">
                        {t.codigo}
                      </Link>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-medium text-gray-900 truncate" title={t.titulo}>
                        {t.titulo}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {t.categoria?.nombre || 'Infraestructura TI'}
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-700 whitespace-nowrap">
                      {t.solicitante ? `${t.solicitante.nombres} ${t.solicitante.apellidos}` : '-'}
                    </td>
                    <td className="p-3.5 text-gray-600 whitespace-nowrap">{t.area?.nombre}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                        {t.estado?.nombre}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-700 font-semibold whitespace-nowrap">
                      {t.prioridad?.nombre}
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
                      <Link
                        href={`/tickets/${t.idTicket}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 hover:bg-purple-700 hover:text-white text-purple-800 rounded-lg font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Plan y Voto</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CrqPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-700" />
          <p className="text-sm">Iniciando módulo de cambios CRQ...</p>
        </div>
      }
    >
      <CrqContent />
    </Suspense>
  );
}
