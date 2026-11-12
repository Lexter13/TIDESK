'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Ticket,
  AlertTriangle,
  FileCheck2,
  GitPullRequest,
  Clock,
  ShieldAlert,
  Info,
  CheckCircle2,
  Building2,
  Sparkles,
  Layers,
  HelpCircle,
  Activity,
  Zap,
  Paperclip,
  UploadCloud,
  FileText,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function NuevoTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get('tipo'); // REQ, INC, CRQ

  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [idTipoTicket, setIdTipoTicket] = useState<number>(
    tipoParam === 'INC' ? 2 : tipoParam === 'CRQ' ? 3 : 1
  );
  const [idArea, setIdArea] = useState<number | ''>('');
  const [idCategoria, setIdCategoria] = useState<number | ''>('');
  const [idSubcategoria, setIdSubcategoria] = useState<number | ''>('');
  const [idServicio, setIdServicio] = useState<number | ''>('');
  const [idPrioridad, setIdPrioridad] = useState<number>(3); // Default Media (idPrioridad 3 en seed)
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Matriz de Prioridad ITIL para Incidentes
  const [urgenciaInc, setUrgenciaInc] = useState<'ALTA' | 'MEDIA' | 'BAJA'>('MEDIA');
  const [impactoInc, setImpactoInc] = useState<'ALTO' | 'MEDIO' | 'BAJO'>('MEDIO');

  // CRQ State
  const [crqTipoTrabajo, setCrqTipoTrabajo] = useState('Mantenimiento Preventivo');
  const [crqMotivo, setCrqMotivo] = useState('');
  const [crqDescripcionTecnica, setCrqDescripcionTecnica] = useState('');
  const [crqFechaProgramada, setCrqFechaProgramada] = useState('');
  const [crqHoraInicio, setCrqHoraInicio] = useState('20:00');
  const [crqHoraFinEstimada, setCrqHoraFinEstimada] = useState('23:00');
  const [crqImpacto, setCrqImpacto] = useState('Medio');
  const [crqRiesgo, setCrqRiesgo] = useState('Bajo');
  const [crqUsuariosAfectados, setCrqUsuariosAfectados] = useState('20');
  const [crqPlanTrabajo, setCrqPlanTrabajo] = useState('');
  const [crqPlanPruebas, setCrqPlanPruebas] = useState('');
  const [crqPlanReversa, setCrqPlanReversa] = useState('');

  // Opciones dependientes
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<any[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<any[]>([]);

  const esStaffTI =
    user?.rol === 'Administrador' ||
    user?.rol === 'Coordinador TI' ||
    user?.rol === 'Técnico TI';

  useEffect(() => {
    async function loadCatalogs() {
      try {
        setLoading(true);
        const data = await api.catalogs.getAll();
        setCatalogs(data);

        // Preseleccionar área de Sistemas por defecto si existe
        if (data.areas?.length > 0) {
          setIdArea(data.areas[0].idArea);
        }
        if (data.categorias?.length > 0) {
          setIdCategoria(data.categorias[0].idCategoria);
        }
        // Asignar prioridad Media por defecto
        const mediaPrio = data.prioridades?.find((p: any) => p.nombre === 'Media');
        if (mediaPrio) {
          setIdPrioridad(mediaPrio.idPrioridad);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar catálogos institucionales.');
      } finally {
        setLoading(false);
      }
    }
    loadCatalogs();
  }, []);

  // Calcular prioridad ITIL cuando cambian urgencia o impacto en Incidentes
  useEffect(() => {
    if (idTipoTicket === 2 && catalogs?.prioridades) {
      let targetName = 'Media';
      if (urgenciaInc === 'ALTA' && impactoInc === 'ALTO') {
        targetName = 'Crítica';
      } else if (
        (urgenciaInc === 'ALTA' && impactoInc === 'MEDIO') ||
        (urgenciaInc === 'MEDIA' && impactoInc === 'ALTO')
      ) {
        targetName = 'Alta';
      } else if (
        (urgenciaInc === 'BAJA' && impactoInc === 'BAJO') ||
        (urgenciaInc === 'MEDIA' && impactoInc === 'BAJO')
      ) {
        targetName = 'Baja';
      } else {
        targetName = 'Media';
      }

      const match = catalogs.prioridades.find((p: any) => p.nombre === targetName);
      if (match) {
        setIdPrioridad(match.idPrioridad);
      }
    }
  }, [urgenciaInc, impactoInc, idTipoTicket, catalogs]);

  // Actualizar subcategorías dependientes
  useEffect(() => {
    if (catalogs && idCategoria) {
      const cat = catalogs.categorias.find((c: any) => c.idCategoria === Number(idCategoria));
      if (cat && cat.subcategorias) {
        setFilteredSubcategorias(cat.subcategorias);
        if (cat.subcategorias.length > 0) {
          setIdSubcategoria(cat.subcategorias[0].idSubcategoria);
        } else {
          setIdSubcategoria('');
        }
      } else {
        setFilteredSubcategorias([]);
        setIdSubcategoria('');
      }
    }
  }, [idCategoria, catalogs]);

  // Actualizar servicios dependientes
  useEffect(() => {
    if (catalogs && idArea) {
      const servs = catalogs.servicios?.filter((s: any) => s.idArea === Number(idArea)) || [];
      setFilteredServicios(servs);
      if (servs.length > 0) {
        setIdServicio(servs[0].idServicio);
      } else {
        setIdServicio('');
      }
    }
  }, [idArea, catalogs]);

  const esCRQ = idTipoTicket === 3;
  const esINC = idTipoTicket === 2;
  const esREQ = idTipoTicket === 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || !descripcion.trim()) {
      setError('Por favor complete el título descriptivo y la explicación detallada.');
      return;
    }

    if (!idArea) {
      setError('Por favor seleccione el área responsable de TI.');
      return;
    }

    if (esCRQ && !esStaffTI) {
      setError('Las Solicitudes de Cambio (CRQ) solo pueden ser originadas por personal técnico o coordinadores de TI.');
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        idTipoTicket,
        idArea: Number(idArea),
        idPrioridad: Number(idPrioridad),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
      };

      if (idCategoria) payload.idCategoria = Number(idCategoria);
      if (idSubcategoria) payload.idSubcategoria = Number(idSubcategoria);
      if (idServicio) payload.idServicio = Number(idServicio);

      if (esCRQ) {
        let parsedUsuariosAfectados: number | undefined = undefined;
        if (crqUsuariosAfectados !== '' && crqUsuariosAfectados !== null && crqUsuariosAfectados !== undefined) {
          const numVal = Number(crqUsuariosAfectados);
          if (Number.isNaN(numVal) || !Number.isInteger(numVal) || numVal < 0) {
            setError('La cantidad de usuarios afectados debe ser un número entero mayor o igual a 0.');
            setSubmitting(false);
            return;
          }
          parsedUsuariosAfectados = numVal;
        }

        payload.crqDetalle = {
          tipoTrabajo: crqTipoTrabajo,
          motivo: crqMotivo.trim() || titulo.trim(),
          descripcionTecnica: crqDescripcionTecnica.trim() || descripcion.trim(),
          fechaProgramada: crqFechaProgramada || new Date().toISOString().split('T')[0],
          horaInicio: crqHoraInicio,
          horaFinEstimada: crqHoraFinEstimada,
          impacto: crqImpacto,
          riesgo: crqRiesgo,
          usuariosAfectados: parsedUsuariosAfectados,
          planTrabajo: crqPlanTrabajo || 'Ejecución del procedimiento técnico conforme a la ventana programada.',
          planPruebas: crqPlanPruebas || 'Validación de servicios críticos y conectividad en campus.',
          planReversa: crqPlanReversa || 'Restauración del estado previo o rollback de configuración.',
        };
      }

      const res = await api.tickets.create(payload);

      // Subir evidencias adjuntas si fueron seleccionadas
      if (archivos.length > 0) {
        setUploadStatus(`Subiendo ${archivos.length} evidencias adjuntas...`);
        for (const file of archivos) {
          try {
            await api.tickets.uploadAttachment(res.idTicket, file);
          } catch (uploadErr) {
            console.error('Error subiendo evidencia:', uploadErr);
          }
        }
      }

      router.push(`/tickets/${res.idTicket}`);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el ticket.');
      setSubmitting(false);
      setUploadStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500">
        <Clock className="w-10 h-10 animate-spin mx-auto mb-3 text-[#06285C]" />
        <p className="text-sm">Cargando catálogo institucional de servicios...</p>
      </div>
    );
  }

  const selectedPriorityObj = catalogs?.prioridades?.find(
    (p: any) => p.idPrioridad === Number(idPrioridad)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Botón Volver y Encabezado */}
      <div className="flex items-center gap-4">
        <Link
          href="/tickets"
          className="p-2.5 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#06285C]">Crear Nueva Solicitud ITSM</h1>
          <p className="text-sm text-gray-500">
            Universidad Nacional de Cañete • Mesa de Ayuda TI
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selector de Tipo ITIL con Diseño Profesional */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-800">
            1. Seleccione el Tipo de Solicitud ITIL <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-gray-400">Estándar ISO 20000 / ITIL 4</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {catalogs?.tiposTicket?.map((tipo: any) => {
            const isSelected = idTipoTicket === tipo.idTipoTicket;
            const isCRQType = tipo.codigo === 'CRQ';
            const disabled = isCRQType && !esStaffTI;

            return (
              <button
                key={tipo.idTipoTicket}
                type="button"
                disabled={disabled}
                onClick={() => setIdTipoTicket(tipo.idTipoTicket)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                    : isSelected
                    ? 'border-[#06285C] bg-blue-50/60 ring-2 ring-[#06285C]/20 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`p-2 rounded-lg ${
                      tipo.codigo === 'REQ'
                        ? 'bg-blue-100 text-[#06285C]'
                        : tipo.codigo === 'INC'
                        ? 'bg-red-100 text-[#E51C3B]'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {tipo.codigo === 'REQ' && <FileCheck2 className="w-5 h-5" />}
                    {tipo.codigo === 'INC' && <AlertTriangle className="w-5 h-5" />}
                    {tipo.codigo === 'CRQ' && <GitPullRequest className="w-5 h-5" />}
                  </span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#06285C]" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{tipo.nombre}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {tipo.codigo === 'REQ'
                      ? 'Solicitud de equipamiento, nuevos accesos a sistemas o servicios estándar.'
                      : tipo.codigo === 'INC'
                      ? 'Fallo imprevisto, avería de equipo o degradación en el servicio habitual.'
                      : 'Mantenimiento preventivo, actualización o cambio en servidores y redes.'}
                  </p>
                  {isCRQType && !esStaffTI && (
                    <span className="text-[10px] text-amber-700 font-semibold block mt-1.5">
                      (Restringido a personal técnico TI)
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Matriz de Impacto/Urgencia para Incidentes (INC) */}
        {esINC && (
          <div className="bg-red-50/40 border border-red-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-red-200 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#E51C3B]" />
                <h2 className="text-sm font-bold text-red-950">
                  Evaluación de Criticidad (Matriz ITIL)
                </h2>
              </div>
              <span className="text-xs text-red-800 font-medium">
                Prioridad calculada automáticamente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nivel de Urgencia (¿Con qué premura se necesita la solución?)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ALTA', 'MEDIA', 'BAJA'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setUrgenciaInc(urg)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        urgenciaInc === urg
                          ? 'bg-[#E51C3B] text-white border-[#E51C3B] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nivel de Impacto (¿A cuántos usuarios o procesos afecta?)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ALTO', 'MEDIO', 'BAJO'] as const).map((imp) => (
                    <button
                      key={imp}
                      type="button"
                      onClick={() => setImpactoInc(imp)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        impactoInc === imp
                          ? 'bg-[#06285C] text-white border-[#06285C] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {imp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clasificación Institucional */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#06285C]" />
            2. Clasificación y Catálogo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Área TI */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Área Responsable TI <span className="text-red-500">*</span>
              </label>
              <select
                value={idArea}
                onChange={(e) => setIdArea(Number(e.target.value))}
                className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C] bg-white text-gray-800"
                required
              >
                {catalogs?.areas?.map((a: any) => (
                  <option key={a.idArea} value={a.idArea}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Servicio TI (Catálogo) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Servicio Institucional Asociado
              </label>
              <select
                value={idServicio}
                onChange={(e) => setIdServicio(e.target.value ? Number(e.target.value) : '')}
                className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C] bg-white text-gray-800"
              >
                <option value="">Seleccione un servicio del catálogo...</option>
                {filteredServicios.map((s: any) => (
                  <option key={s.idServicio} value={s.idServicio}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Categoría Técnica
              </label>
              <select
                value={idCategoria}
                onChange={(e) => setIdCategoria(Number(e.target.value))}
                className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C] bg-white text-gray-800"
              >
                {catalogs?.categorias?.map((c: any) => (
                  <option key={c.idCategoria} value={c.idCategoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Subcategoría
              </label>
              <select
                value={idSubcategoria}
                onChange={(e) => setIdSubcategoria(e.target.value ? Number(e.target.value) : '')}
                className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C] bg-white text-gray-800"
              >
                <option value="">Seleccione subcategoría...</option>
                {filteredSubcategorias.map((sc: any) => (
                  <option key={sc.idSubcategoria} value={sc.idSubcategoria}>
                    {sc.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Prioridad y Previsualización de SLA */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-600">
                Nivel de Prioridad del Ticket
              </label>
              <span className="text-xs text-gray-400">Compromiso de SLA institucional</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {catalogs?.prioridades?.map((p: any) => {
                const isSelected = idPrioridad === p.idPrioridad;
                const matchedSla =
                  catalogs?.politicasSla?.find(
                    (pol: any) =>
                      pol.idPrioridad === p.idPrioridad && pol.idTipoTicket === idTipoTicket,
                  ) ||
                  catalogs?.politicasSla?.find((pol: any) => pol.idPrioridad === p.idPrioridad);

                const formatMin = (m: number) =>
                  m >= 60 ? `${Number((m / 60).toFixed(1))}h` : `${m}m`;

                const slaText = matchedSla
                  ? `Resp: ${formatMin(matchedSla.tiempoPrimeraRespuestaMin)} • Res: ${formatMin(
                      matchedSla.tiempoResolucionMin,
                    )}`
                  : p.nombre === 'Crítica'
                  ? 'Resp: 15m • Res: 2h'
                  : p.nombre === 'Alta'
                  ? 'Resp: 30m • Res: 4h'
                  : p.nombre === 'Media'
                  ? 'Resp: 1h • Res: 8h'
                  : 'Resp: 2h • Res: 24h';

                return (
                  <button
                    key={p.idPrioridad}
                    type="button"
                    onClick={() => setIdPrioridad(p.idPrioridad)}
                    className={`p-3 rounded-xl border text-center transition ${
                      isSelected
                        ? 'border-[#06285C] bg-blue-50 ring-2 ring-[#06285C]/20 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-gray-800">{p.nombre}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{slaText}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detalles de la Solicitud */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#06285C]" />
            3. Descripción de la Solicitud
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Título Descriptivo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Avería de proyector aula 204 Pabellón A / Creación de cuenta institucional para docente"
              maxLength={150}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Detalle Completo <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explique detalladamente su solicitud o incidencia: equipo involucrado, ubicación en el campus, mensaje de error exacto y cualquier dato que ayude al especialista..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C]"
              required
            />
          </div>

          {/* Sección de Evidencias y Adjuntos */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#06285C]" />
                Evidencias y Documentos Adjuntos (Opcional)
              </label>
              <span className="text-[11px] text-gray-400">
                Máximo 5 archivos (10 MB c/u) • JPG, PNG, PDF, DOCX, XLSX
              </span>
            </div>

            <div className="border-2 border-dashed border-gray-200 hover:border-[#06285C] rounded-2xl p-4 text-center transition bg-gray-50/50">
              <input
                type="file"
                multiple
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    if (archivos.length + newFiles.length > 5) {
                      alert('Puede adjuntar un máximo de 5 archivos simultáneamente.');
                      return;
                    }
                    setArchivos((prev) => [...prev, ...newFiles]);
                  }
                }}
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <UploadCloud className="w-8 h-8 text-[#06285C]" />
                <span className="text-xs font-bold text-[#06285C]">
                  Haga clic para seleccionar o arrastre sus archivos aquí
                </span>
                <span className="text-[10px] text-gray-400">
                  Fotos de fallas, capturas de pantalla, oficios PDF, reportes en Excel o Word
                </span>
              </label>
            </div>

            {archivos.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {archivos.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-blue-700 flex-shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{file.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setArchivos((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploadStatus && (
              <div className="text-xs text-blue-700 font-medium animate-pulse">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>

        {/* Panel Especial CRQ (Gestión de Cambios) */}
        {esCRQ && (
          <div className="bg-purple-50/50 border border-purple-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-200 pb-2">
              <GitPullRequest className="w-5 h-5 text-purple-700" />
              <h2 className="text-sm font-bold text-purple-900">
                4. Planificación del Cambio Técnico (CRQ)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Tipo de Trabajo
                </label>
                <select
                  value={crqTipoTrabajo}
                  onChange={(e) => setCrqTipoTrabajo(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-purple-200 rounded-xl bg-white"
                >
                  <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                  <option value="Mantenimiento Correctivo">Mantenimiento Correctivo</option>
                  <option value="Actualización de Software">Actualización de Software</option>
                  <option value="Despliegue de Red/Servidor">Despliegue de Red/Servidor</option>
                  <option value="Cambio de Emergencia">Cambio de Emergencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Fecha Programada
                </label>
                <input
                  type="date"
                  value={crqFechaProgramada}
                  onChange={(e) => setCrqFechaProgramada(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-purple-200 rounded-xl bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-purple-900 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={crqHoraInicio}
                    onChange={(e) => setCrqHoraInicio(e.target.value)}
                    className="w-full py-2 px-2 text-xs border border-purple-200 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-900 mb-1">Hora Fin Estimada</label>
                  <input
                    type="time"
                    value={crqHoraFinEstimada}
                    onChange={(e) => setCrqHoraFinEstimada(e.target.value)}
                    className="w-full py-2 px-2 text-xs border border-purple-200 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">Nivel de Impacto</label>
                <select
                  value={crqImpacto}
                  onChange={(e) => setCrqImpacto(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-purple-200 rounded-xl bg-white"
                >
                  <option value="Bajo">Bajo (Sin corte de servicio)</option>
                  <option value="Medio">Medio (Degradación transitoria)</option>
                  <option value="Alto">Alto (Interrupción programada de servicio)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">Nivel de Riesgo</label>
                <select
                  value={crqRiesgo}
                  onChange={(e) => setCrqRiesgo(e.target.value)}
                  className="w-full py-2 px-3 text-xs border border-purple-200 rounded-xl bg-white"
                >
                  <option value="Bajo">Bajo (Procedimiento rutinario)</option>
                  <option value="Medio">Medio (Posible contingencia)</option>
                  <option value="Alto">Alto (Crítico para la operación)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Usuarios Afectados (Cantidad estimada)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={crqUsuariosAfectados}
                  onChange={(e) => setCrqUsuariosAfectados(e.target.value)}
                  placeholder="Ej. 20, 150, 500"
                  className="w-full py-2 px-3 text-xs border border-purple-200 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Plan de Trabajo (Procedimiento Técnico)
                </label>
                <textarea
                  rows={3}
                  value={crqPlanTrabajo}
                  onChange={(e) => setCrqPlanTrabajo(e.target.value)}
                  placeholder="Pasos específicos que ejecutará el personal..."
                  className="w-full p-2 text-xs border border-purple-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Plan de Pruebas (Validación Post-Cambio)
                </label>
                <textarea
                  rows={3}
                  value={crqPlanPruebas}
                  onChange={(e) => setCrqPlanPruebas(e.target.value)}
                  placeholder="Criterios para asegurar que todo quedó operativo..."
                  className="w-full p-2 text-xs border border-purple-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Plan de Reversa (Rollback de Contingencia)
                </label>
                <textarea
                  rows={3}
                  value={crqPlanReversa}
                  onChange={(e) => setCrqPlanReversa(e.target.value)}
                  placeholder="Acciones para restaurar el estado anterior ante fallos..."
                  className="w-full p-2 text-xs border border-purple-200 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botones de Envío */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/tickets"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-semibold transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-900/10 transition active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#FFD21E]" />
            <span>{submitting ? 'Registrando en BD...' : 'Registrar Solicitud'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NuevoTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-gray-500">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-[#06285C]" />
          <p className="text-sm">Iniciando formulario de solicitud...</p>
        </div>
      }
    >
      <NuevoTicketContent />
    </Suspense>
  );
}
