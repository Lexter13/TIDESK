'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Plus,
  RefreshCw,
  Activity,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function SlaContent() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de creación / edición de política
  const [modalPolicyOpen, setModalPolicyOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [nombrePolitica, setNombrePolitica] = useState('');
  const [idPrioridad, setIdPrioridad] = useState<number>(4);
  const [idTipoTicket, setIdTipoTicket] = useState<number | ''>('');
  const [tiempoRespuesta, setTiempoRespuesta] = useState<number>(120);
  const [tiempoResolucion, setTiempoResolucion] = useState<number>(1440);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const esAdmin = user?.rol === 'Administrador' || user?.rol === 'Coordinador TI';

  const loadData = async () => {
    try {
      setLoading(true);
      const [pol, met, tickRes, catRes] = await Promise.all([
        api.sla.getPolicies(),
        api.sla.getMetrics(),
        api.tickets.getAll({ limit: 10 }),
        api.catalogs.getAll(),
      ]);
      setPolicies(pol || []);
      setMetrics(met || null);
      setActiveTickets(tickRes.items || []);
      setCatalogs(catRes || null);
    } catch (err) {
      console.error('Error cargando SLA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    const bajaPrio = catalogs?.prioridades?.find((p: any) => p.nombre === 'Baja');
    setIdPrioridad(bajaPrio ? bajaPrio.idPrioridad : catalogs?.prioridades?.[0]?.idPrioridad || 4);
    setIdTipoTicket('');
    setNombrePolitica('');
    setTiempoRespuesta(120);
    setTiempoResolucion(1440);
    setModalPolicyOpen(true);
  };

  const handleEditClick = (p: any) => {
    setEditingPolicy(p);
    setNombrePolitica(p.nombre || '');
    setIdPrioridad(p.idPrioridad);
    setIdTipoTicket(p.idTipoTicket || '');
    setTiempoRespuesta(p.tiempoPrimeraRespuestaMin);
    setTiempoResolucion(p.tiempoResolucionMin);
    setModalPolicyOpen(true);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const payload = {
        nombre: nombrePolitica.trim(),
        idPrioridad: Number(idPrioridad),
        idTipoTicket: idTipoTicket ? Number(idTipoTicket) : null,
        tiempoPrimeraRespuestaMin: Number(tiempoRespuesta),
        tiempoResolucionMin: Number(tiempoResolucion),
      };

      if (editingPolicy) {
        await api.sla.updatePolicy(editingPolicy.idSla, payload);
        setFeedback({
          type: 'success',
          text: `Política SLA "${payload.nombre}" actualizada satisfactoriamente.`,
        });
      } else {
        await api.sla.createPolicy(payload);
        setFeedback({
          type: 'success',
          text: `Nueva política SLA "${payload.nombre}" registrada satisfactoriamente.`,
        });
      }

      setModalPolicyOpen(false);
      setEditingPolicy(null);
      await loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error al guardar la política SLA.',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#06285C] rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">
              Acuerdos de Nivel de Servicio (SLA)
            </h1>
            <p className="text-sm text-gray-500">
              Control riguroso de tiempos máximos de respuesta inicial y resolución técnica universitaria – UNDC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-gray-600 hover:text-[#06285C] bg-gray-50 hover:bg-gray-100 rounded-xl transition"
            title="Refrescar métricas de SLA"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-[#06285C]' : ''}`} />
          </button>
          {esAdmin && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4 text-[#FFD21E]" />
              <span>Nueva Política SLA</span>
            </button>
          )}
        </div>
      </div>

      {/* Métricas de Cumplimiento Global (Datos Reales de Base de Datos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Tasa de Cumplimiento Global</div>
          <div className="text-3xl font-extrabold text-[#009B60] mt-2">
            {metrics?.complianceRate ?? 100}%
          </div>
          <p className="text-[11px] text-gray-500 mt-1">De tickets evaluados en plazo legal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Tickets Resueltos en SLA</div>
          <div className="text-3xl font-extrabold text-[#06285C] mt-2">
            {metrics?.fulfilled ?? 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Conformidad antes del límite</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Tickets Fuera de SLA</div>
          <div className="text-3xl font-extrabold text-[#E51C3B] mt-2">
            {metrics?.breached ?? 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Superaron el tiempo máximo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400">Tickets en Seguimiento Activo</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {metrics?.inProgress ?? 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Abiertos dentro de ventana de plazo</p>
        </div>
      </div>

      {/* Marco de Gobierno SLA Institucional */}
      <div className="bg-gradient-to-r from-[#06285C] to-[#001C45] text-white p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#FFD21E]" />
          <h2 className="text-base font-bold">Marco Institucional de Tiempos y Gobernanza ITIL</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-100 pt-1">
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
            <span className="font-bold text-white block mb-1">Horario de Operación:</span>
            <span>Lunes a Viernes de 08:00 a 17:00 hrs. Los tickets fuera de horario se registran y procesan al inicio del siguiente día laboral.</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
            <span className="font-bold text-white block mb-1">Primera Respuesta:</span>
            <span>Contacto formal inicial del especialista o toma del ticket para diagnóstico y asignación de ruta técnica.</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
            <span className="font-bold text-white block mb-1">Resolución Final:</span>
            <span>Entrega de la solución, restauración del servicio y registro de informe técnico en el expediente.</span>
          </div>
        </div>
      </div>

      {/* Tabla de Políticas Configuradas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#06285C]" />
            Políticas SLA por Nivel de Prioridad ({policies.length})
          </h2>
          <span className="text-xs text-gray-400 font-medium">Normativa ITIL v4 / ISO 20000</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#06285C]" />
            Cargando políticas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b text-gray-600 font-semibold">
                  <th className="p-3.5">Prioridad</th>
                  <th className="p-3.5">Nombre de la Política</th>
                  <th className="p-3.5">Tipo Ticket</th>
                  <th className="p-3.5">Primera Respuesta Máx.</th>
                  <th className="p-3.5">Resolución Máx.</th>
                  <th className="p-3.5">Estado</th>
                  {esAdmin && <th className="p-3.5 text-center">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {policies.map((p) => (
                  <tr key={p.idSla} className="hover:bg-blue-50/20 transition">
                    <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs ${
                          p.prioridad?.nombre === 'Crítica'
                            ? 'bg-red-100 text-red-800'
                            : p.prioridad?.nombre === 'Alta'
                            ? 'bg-orange-100 text-orange-800'
                            : p.prioridad?.nombre === 'Media'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-[#06285C]'
                        }`}
                      >
                        {p.prioridad?.nombre || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-gray-800">{p.nombre}</td>
                    <td className="p-3.5 text-gray-600 whitespace-nowrap">
                      {p.tipoTicket ? `${p.tipoTicket.codigo} - ${p.tipoTicket.nombre}` : 'General (Todos)'}
                    </td>
                    <td className="p-3.5 text-gray-700 font-mono whitespace-nowrap">
                      {p.tiempoPrimeraRespuestaMin} min ({p.tiempoPrimeraRespuestaMin >= 60 ? `${(p.tiempoPrimeraRespuestaMin / 60).toFixed(1)} h` : `${p.tiempoPrimeraRespuestaMin} m`})
                    </td>
                    <td className="p-3.5 text-gray-700 font-mono font-bold text-[#06285C] whitespace-nowrap">
                      {p.tiempoResolucionMin} min ({p.tiempoResolucionMin >= 60 ? `${(p.tiempoResolucionMin / 60).toFixed(1)} h` : `${p.tiempoResolucionMin} m`})
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Vigente
                      </span>
                    </td>
                    {esAdmin && (
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-[#06285C] hover:text-white text-gray-700 rounded-lg font-semibold transition"
                        >
                          <Edit2 className="w-3 h-3" /> Modificar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monitor de Tickets en Seguimiento de SLA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Monitor en Vivo de Acuerdos de Nivel de Servicio
          </h2>
          <Link
            href="/tickets?vista=vencidos"
            className="text-xs font-semibold text-[#E51C3B] hover:underline"
          >
            Ver tickets desfasados &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b text-gray-600 font-semibold">
                <th className="p-3">Código</th>
                <th className="p-3">Título</th>
                <th className="p-3">Prioridad</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Especialista</th>
                <th className="p-3">Estado del SLA</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTickets.map((t) => (
                <tr key={t.idTicket} className="hover:bg-blue-50/20 transition">
                  <td className="p-3 font-mono font-bold text-[#06285C] whitespace-nowrap">
                    {t.codigo}
                  </td>
                  <td className="p-3 font-medium text-gray-900 max-w-xs truncate">{t.titulo}</td>
                  <td className="p-3 whitespace-nowrap">{t.prioridad?.nombre}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {t.estado?.nombre}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{t.especialistaAsignado}</td>
                  <td className="p-3 whitespace-nowrap">
                    {t.slaVencido ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                        SLA Vencido
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
                  <td className="p-3 text-center whitespace-nowrap">
                    <Link
                      href={`/tickets/${t.idTicket}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-[#06285C] hover:text-white text-gray-800 rounded-lg font-semibold transition"
                    >
                      <Eye className="w-3 h-3" /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN DE POLÍTICA SLA */}
      {modalPolicyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-[#06285C] text-sm">
                {editingPolicy
                  ? `Modificar Política SLA: ${editingPolicy.nombre}`
                  : 'Crear Nueva Política SLA'}
              </h3>
              <button
                onClick={() => setModalPolicyOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nombre de la Política <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombrePolitica}
                  onChange={(e) => setNombrePolitica(e.target.value)}
                  placeholder="Ej. Atención de Baja Prioridad"
                  maxLength={120}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Prioridad Vinculada <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={idPrioridad}
                    onChange={(e) => setIdPrioridad(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                    required
                  >
                    {catalogs?.prioridades?.map((prio: any) => (
                      <option key={prio.idPrioridad} value={prio.idPrioridad}>
                        {prio.nombre} (Nivel {prio.nivel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tipo de Ticket (Opcional)
                  </label>
                  <select
                    value={idTipoTicket}
                    onChange={(e) => setIdTipoTicket(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">General (Todos)</option>
                    {catalogs?.tiposTicket?.map((tipo: any) => (
                      <option key={tipo.idTipoTicket} value={tipo.idTipoTicket}>
                        {tipo.codigo} - {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tiempo de Primera Respuesta (minutos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={tiempoRespuesta}
                  onChange={(e) => setTiempoRespuesta(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Equivale a {(tiempoRespuesta / 60).toFixed(1)} horas
                </span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tiempo de Resolución Máxima (minutos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="10080"
                  value={tiempoResolucion}
                  onChange={(e) => setTiempoResolucion(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Equivale a {(tiempoResolucion / 60).toFixed(1)} horas
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalPolicyOpen(false)}
                  className="px-4 py-2 border rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#06285C] text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#FFD21E]" />
                  <span>{saving ? 'Guardando...' : 'Guardar Política'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SlaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#06285C]" />
          <p className="text-sm">Iniciando módulo de políticas SLA...</p>
        </div>
      }
    >
      <SlaContent />
    </Suspense>
  );
}
