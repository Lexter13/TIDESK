'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Plus,
  Search,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Laptop,
  Wifi,
  Mail,
  GraduationCap,
  KeyRound,
  Printer,
  ChevronRight,
  Eye,
  RefreshCw,
  Building2,
  CheckCircle2,
  Layers,
  Server,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function RequerimientosContent() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, catRes] = await Promise.all([
        api.tickets.getAll({
          idTipoTicket: 1, // REQ
          limit: 30,
          search: search.trim() || undefined,
          idEstado: filtroEstado ? Number(filtroEstado) : undefined,
        }),
        catalogs ? Promise.resolve(catalogs) : api.catalogs.getAll(),
      ]);
      setTickets(ticketsRes.items || []);
      if (!catalogs) setCatalogs(catRes);
    } catch (err) {
      console.error('Error al cargar requerimientos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filtroEstado]);

  // Catálogo Oficial de Servicios TI de la Universidad Nacional de Cañete
  const catalogoServicios = [
    {
      titulo: 'Cuentas y Accesos Institucionales',
      descripcion: 'Creación y restablecimiento de credenciales de correo @undc.edu.pe, aula virtual y sistemas universitarios.',
      icono: KeyRound,
      color: 'bg-blue-50 text-[#06285C]',
      sla: 'SLA: 4 horas',
      categoria: 'Cuentas y Accesos',
    },
    {
      titulo: 'Plataforma Académica y Moodle',
      descripcion: 'Soporte en matrícula virtual, asignación de aulas en línea, sincronización de cursos y capacitación docente.',
      icono: GraduationCap,
      color: 'bg-emerald-50 text-emerald-700',
      sla: 'SLA: 6 horas',
      categoria: 'Sistemas Académicos',
    },
    {
      titulo: 'Soporte a Equipos y Microinformática',
      descripcion: 'Mantenimiento preventivo, software ofimático y configuración de computadoras en laboratorios y oficinas.',
      icono: Laptop,
      color: 'bg-indigo-50 text-indigo-700',
      sla: 'SLA: 8 horas',
      categoria: 'Hardware y Equipos',
    },
    {
      titulo: 'Conectividad WiFi y Red Universitaria',
      descripcion: 'Habilitación de señal WiFi para la comunidad universitaria y configuración de puntos de red ethernet en sedes.',
      icono: Wifi,
      color: 'bg-cyan-50 text-cyan-700',
      sla: 'SLA: 4 horas',
      categoria: 'Redes y Telecomunicaciones',
    },
    {
      titulo: 'Impresoras y Recursos Compartidos',
      descripcion: 'Mapeo de periféricos multifuncionales de red y configuración de carpetas compartidas departamentales.',
      icono: Printer,
      color: 'bg-amber-50 text-amber-700',
      sla: 'SLA: 6 horas',
      categoria: 'Hardware y Periféricos',
    },
    {
      titulo: 'Seguridad y Antivirus Endpoint',
      descripcion: 'Instalación de antivirus corporativo, escaneo de malware y configuración de firmas electrónicas.',
      icono: ShieldCheck,
      color: 'bg-rose-50 text-[#E51C3B]',
      sla: 'SLA: 2 horas',
      categoria: 'Ciberseguridad',
    },
  ];

  const enAtencion = tickets.filter((t) => t.idEstado === 3);
  const pendientes = tickets.filter((t) => [1, 2].includes(t.idEstado));
  const atendidos = tickets.filter((t) => [5, 6].includes(t.idEstado));

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#06285C] rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">Catálogo y Solicitudes de Servicio (REQ)</h1>
            <p className="text-sm text-gray-500">
              Gestione y solicite prestaciones informáticas estándar para la comunidad de la Universidad Nacional de Cañete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-gray-600 hover:text-[#06285C] bg-gray-50 hover:bg-gray-100 rounded-xl transition"
            title="Refrescar requerimientos"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-[#06285C]' : ''}`} />
          </button>
          <Link
            href="/tickets/nuevo?tipo=REQ"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl font-medium shadow-md shadow-blue-900/10 transition active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 text-[#FFD21E]" />
            <span>Nueva Solicitud REQ</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas de Requerimientos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Total Solicitudes REQ</div>
          <div className="text-3xl font-extrabold text-[#06285C] mt-1">{tickets.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Registradas en el sistema</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">En Cola / Asignadas</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{pendientes.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Pendientes de inicio de atención</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">En Atención Activa</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{enAtencion.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">En proceso por técnicos TI</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Completadas / Resueltas</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{atendidos.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Servicio entregado a satisfacción</p>
        </div>
      </div>

      {/* Catálogo Oficial de Servicios TI de la Universidad */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD21E]" />
            Catálogo Oficial de Servicios TI – UNDC
          </h2>
          <span className="text-xs text-gray-400 font-medium">Estándar ITIL Service Catalog</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogoServicios.map((serv, idx) => {
            const Icon = serv.icono;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group hover:border-blue-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`p-3 rounded-xl ${serv.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      {serv.sla}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#06285C] transition">
                    {serv.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {serv.descripcion}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">{serv.categoria}</span>
                  <Link
                    href="/tickets/nuevo?tipo=REQ"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#06285C] group-hover:text-[#176BDA] transition"
                  >
                    <span>Solicitar</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Requerimientos en Trámite */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#06285C]" />
            Requerimientos Registrados ({tickets.length})
          </h2>

          <div className="flex items-center gap-3">
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

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar requerimiento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#06285C]" />
            Consultando requerimientos...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No hay requerimientos activos que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b text-gray-600 font-semibold">
                  <th className="p-3.5">Código</th>
                  <th className="p-3.5">Título del Requerimiento</th>
                  <th className="p-3.5">Solicitante</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Especialista</th>
                  <th className="p-3.5">SLA</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t) => (
                  <tr key={t.idTicket} className="hover:bg-blue-50/30 transition">
                    <td className="p-3.5 font-mono font-bold text-[#06285C] whitespace-nowrap">
                      <Link href={`/tickets/${t.idTicket}`} className="hover:underline">
                        {t.codigo}
                      </Link>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-medium text-gray-900 truncate" title={t.titulo}>
                        {t.titulo}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {t.area?.nombre} • {t.servicio?.nombre || 'General'}
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-700 whitespace-nowrap">
                      {t.solicitante ? `${t.solicitante.nombres} ${t.solicitante.apellidos}` : '-'}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {t.estado?.nombre}
                      </span>
                    </td>
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
                      <Link
                        href={`/tickets/${t.idTicket}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-[#06285C] hover:text-white text-[#06285C] rounded-lg font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
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

export default function RequerimientosPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#06285C]" />
          <p className="text-sm">Iniciando catálogo de requerimientos...</p>
        </div>
      }
    >
      <RequerimientosContent />
    </Suspense>
  );
}
