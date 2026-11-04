'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Ticket,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  History,
  Send,
  Lock,
  Star,
  GitPullRequest,
  AlertTriangle,
  FileCheck2,
  Building2,
  Calendar,
  ShieldAlert,
  UserCheck,
  RotateCcw,
  Sparkles,
  Check,
  CheckCheck,
  X,
  FileText,
  HelpCircle,
  Layers,
  Paperclip,
  Download,
  UploadCloud,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

function TicketDetalleContent() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Number(params.id);

  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [catalogs, setCatalogs] = useState<any>(null);
  const [especialistas, setEspecialistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab activo principal: 'detalle' | 'comunicacion' | 'adjuntos' | 'historial'
  const [activeTab, setActiveTab] = useState<'detalle' | 'comunicacion' | 'adjuntos' | 'historial'>('detalle');

  // Subida de adjunto en detalle
  const [subiendoAdjunto, setSubiendoAdjunto] = useState(false);
  const [adjuntoError, setAdjuntoError] = useState<string | null>(null);

  // Comentario
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [esInterno, setEsInterno] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Modales ITIL
  const [modalAsignar, setModalAsignar] = useState(false);
  const [idEspecialistaSeleccionado, setIdEspecialistaSeleccionado] = useState<number | ''>('');
  const [motivoReasignacion, setMotivoReasignacion] = useState('');

  const [modalEstado, setModalEstado] = useState(false);
  const [idEstadoNuevo, setIdEstadoNuevo] = useState<number | ''>('');
  const [motivoEstado, setMotivoEstado] = useState('');

  const [modalResolver, setModalResolver] = useState(false);
  const [solucionTexto, setSolucionTexto] = useState('');

  const [modalCerrar, setModalCerrar] = useState(false);
  const [motivoCierre, setMotivoCierre] = useState('');

  const [modalEncuesta, setModalEncuesta] = useState(false);
  const [calificacionEstrellas, setCalificacionEstrellas] = useState(5);
  const [comentarioEncuesta, setComentarioEncuesta] = useState('');

  const [modalCab, setModalCab] = useState(false);
  const [votoCab, setVotoCab] = useState<'APROBADO' | 'RECHAZADO'>('APROBADO');
  const [comentarioCab, setComentarioCab] = useState('');

  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tData, catData, espData] = await Promise.all([
        api.tickets.getById(ticketId),
        catalogs ? Promise.resolve(catalogs) : api.catalogs.getAll(),
        especialistas.length > 0 ? Promise.resolve(especialistas) : api.catalogs.getEspecialistas(),
      ]);
      setTicket(tData);
      if (!catalogs) setCatalogs(catData);
      if (especialistas.length === 0) setEspecialistas(espData || []);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar la información del ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) loadTicket();
  }, [ticketId]);

  const esStaffTI =
    user?.rol === 'Administrador' ||
    user?.rol === 'Coordinador TI' ||
    user?.rol === 'Técnico TI';

  const esAdminOCoord =
    user?.rol === 'Administrador' || user?.rol === 'Coordinador TI';

  const esSolicitante = user?.idUsuario === ticket?.idUsuarioSolicitante;

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleEnviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    try {
      setEnviandoComentario(true);
      await api.tickets.addComment(ticketId, {
        comentario: nuevoComentario.trim(),
        comentarioInterno: esInterno,
      });
      setNuevoComentario('');
      setEsInterno(false);
      await loadTicket();
      showFeedback('success', 'Comentario publicado satisfactoriamente.');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al enviar comentario.');
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEspecialistaSeleccionado) return;
    try {
      setProcesandoAccion(true);
      await api.tickets.assign(ticketId, {
        idEspecialista: Number(idEspecialistaSeleccionado),
        motivoReasignacion: motivoReasignacion.trim() || 'Asignación desde panel de gestión',
      });
      setModalAsignar(false);
      setMotivoReasignacion('');
      await loadTicket();
      showFeedback('success', 'Especialista asignado correctamente al ticket.');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al asignar especialista.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleTomarTicket = async () => {
    if (!user) return;
    try {
      setProcesandoAccion(true);
      await api.tickets.take(ticketId);
      await loadTicket();
      showFeedback('success', 'Has tomado el ticket exitosamente. Se ha establecido en "En atención".');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al tomar el ticket.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleSubirAdjunto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAdjuntoError(null);
    try {
      setSubiendoAdjunto(true);
      await api.tickets.uploadAttachment(ticketId, file);
      showFeedback('success', `Archivo "${file.name}" adjuntado como evidencia.`);
      await loadTicket();
    } catch (err: any) {
      setAdjuntoError(err.message || 'Error al subir evidencia.');
    } finally {
      setSubiendoAdjunto(false);
      e.target.value = '';
    }
  };

  const handleCambiarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEstadoNuevo) return;
    try {
      setProcesandoAccion(true);
      await api.tickets.updateStatus(ticketId, {
        idEstado: Number(idEstadoNuevo),
        motivo: motivoEstado.trim() || undefined,
      });
      setModalEstado(false);
      setMotivoEstado('');
      await loadTicket();
      showFeedback('success', 'Estado del ticket actualizado conforme a ITIL.');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al actualizar estado.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleResolver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solucionTexto.trim()) return;
    try {
      setProcesandoAccion(true);
      await api.tickets.resolve(ticketId, { solucion: solucionTexto.trim() });
      setModalResolver(false);
      setSolucionTexto('');
      await loadTicket();
      showFeedback('success', 'Ticket marcado como Resuelto con informe técnico registrado.');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al registrar la solución.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleCerrarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcesandoAccion(true);
      await api.tickets.close(ticketId, { motivo: motivoCierre.trim() || undefined });
      setModalCerrar(false);
      setMotivoCierre('');
      await loadTicket();
      showFeedback('success', 'Ticket cerrado formalmente.');
      // Si el usuario es el solicitante y aún no calificó, abrir modal de CSAT automáticamente
      if (esSolicitante && !ticket.encuesta) {
        setModalEncuesta(true);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al cerrar el ticket.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleEnviarEncuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcesandoAccion(true);
      await api.tickets.submitSurvey(ticketId, {
        calificacion: calificacionEstrellas,
        comentario: comentarioEncuesta.trim() || undefined,
      });
      setModalEncuesta(false);
      await loadTicket();
      showFeedback('success', '¡Gracias por su calificación! Su encuesta CSAT ha sido guardada.');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al registrar la encuesta CSAT.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const handleVotoCab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcesandoAccion(true);
      await api.tickets.approveCrq(ticketId, {
        estadoAprobacion: votoCab,
        comentario: comentarioCab.trim() || undefined,
      });
      setModalCab(false);
      setComentarioCab('');
      await loadTicket();
      showFeedback('success', `Dictamen CAB registrado como ${votoCab}.`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al registrar voto CAB.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500">
        <Clock className="w-10 h-10 animate-spin mx-auto mb-3 text-[#06285C]" />
        <p className="text-sm">Cargando expediente integral del ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-red-200 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">No se pudo cargar el ticket</h2>
        <p className="text-sm text-gray-500">{error || 'El ticket no existe o no cuentas con los permisos requeridos.'}</p>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06285C] text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a tickets
        </Link>
      </div>
    );
  }

  const activeAsignacion = ticket.asignaciones?.find((a: any) => a.activo);
  const esCRQ = ticket.tipoTicket?.codigo === 'CRQ';
  const estaResuelto = ticket.idEstado === 5;
  const estaCerrado = ticket.idEstado === 6;
  const estaPendiente = ticket.idEstado === 1;

  // Cálculo de SLA
  const activeSla = ticket.ticketSla;
  let slaRemainingText = '';
  let slaBadgeClass = 'bg-blue-50 text-[#06285C] border-blue-200';
  let slaStatusLabel = 'En plazo';

  if (estaResuelto || estaCerrado) {
    slaStatusLabel = activeSla?.cumplioResolucion === false ? 'Resuelto fuera de SLA' : 'Resuelto en SLA';
    slaBadgeClass =
      activeSla?.cumplioResolucion === false
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (activeSla?.fechaLimiteResolucion) {
    const diffMs = new Date(activeSla.fechaLimiteResolucion).getTime() - new Date().getTime();
    if (diffMs < 0) {
      const hoursAgo = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
      slaStatusLabel = 'SLA Vencido';
      slaRemainingText = `Vencido hace ${hoursAgo} hora(s)`;
      slaBadgeClass = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
    } else {
      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      slaRemainingText = `Quedan ${hoursLeft}h ${minsLeft}m`;
      if (hoursLeft < 2) {
        slaStatusLabel = 'Próximo a vencer';
        slaBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
      } else {
        slaStatusLabel = 'En tiempo y forma';
        slaBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Institucional ITSM */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <Link
            href="/tickets"
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition flex-shrink-0"
            title="Volver a la bandeja de tickets"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="font-mono text-2xl font-black text-[#06285C] tracking-tight">
                {ticket.codigo}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  ticket.tipoTicket?.codigo === 'REQ'
                    ? 'bg-blue-50 text-[#06285C] border-blue-200'
                    : ticket.tipoTicket?.codigo === 'INC'
                    ? 'bg-red-50 text-[#E51C3B] border-red-200'
                    : 'bg-purple-50 text-purple-800 border-purple-200'
                }`}
              >
                {ticket.tipoTicket?.nombre}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  estaResuelto
                    ? 'bg-emerald-100 text-emerald-800'
                    : estaCerrado
                    ? 'bg-gray-100 text-gray-800'
                    : ticket.estado?.nombre === 'En atención'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {ticket.estado?.nombre}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded ${
                  ticket.prioridad?.nombre === 'Crítica'
                    ? 'bg-red-600 text-white font-bold'
                    : ticket.prioridad?.nombre === 'Alta'
                    ? 'bg-orange-100 text-orange-800'
                    : ticket.prioridad?.nombre === 'Media'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Prioridad: {ticket.prioridad?.nombre}
              </span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 leading-snug">{ticket.titulo}</h1>
          </div>
        </div>

        {/* Acciones Rápidas ITIL (Según Rol) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
          {/* Tomar Ticket (Especialistas TI cuando está pendiente o sin asignar) */}
          {esStaffTI && (estaPendiente || !activeAsignacion) && activeAsignacion?.idEspecialista !== user?.idUsuario && (
            <button
              onClick={handleTomarTicket}
              disabled={procesandoAccion}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{procesandoAccion ? 'Tomando...' : 'Tomar Ticket'}</span>
            </button>
          )}

          {/* Asignar Especialista (Admin / Coordinador) */}
          {esAdminOCoord && (
            <button
              onClick={() => {
                setIdEspecialistaSeleccionado(activeAsignacion?.idEspecialista || '');
                setModalAsignar(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
            >
              <User className="w-4 h-4" />
              <span>{activeAsignacion ? 'Reasignar Especialista' : 'Asignar Especialista'}</span>
            </button>
          )}

          {/* Cambiar Estado (Staff TI) */}
          {esStaffTI && !estaCerrado && (
            <button
              onClick={() => setModalEstado(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cambiar Estado</span>
            </button>
          )}

          {/* Resolver Ticket (Staff TI) */}
          {esStaffTI && !estaResuelto && !estaCerrado && ticket.idEstado !== 7 && (
            <button
              onClick={() => setModalResolver(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FFD21E]" />
              <span>Resolver Ticket</span>
            </button>
          )}

          {/* Cerrar Ticket (Solicitante o Coordinador cuando ya está Resuelto) */}
          {estaResuelto && (esSolicitante || esAdminOCoord) && (
            <button
              onClick={() => setModalCerrar(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Cerrar Ticket Definitivo</span>
            </button>
          )}

          {/* Calificar Atención CSAT (Solicitante) */}
          {esSolicitante && (estaResuelto || estaCerrado) && !ticket.encuesta && (
            <button
              onClick={() => setModalEncuesta(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFD21E] hover:bg-yellow-400 text-[#06285C] rounded-xl text-xs font-bold shadow-sm transition animate-pulse"
            >
              <Star className="w-4 h-4 fill-current" />
              <span>Calificar Atención (CSAT)</span>
            </button>
          )}

          {/* Voto CAB para CRQ (Coordinador / Admin) */}
          {esCRQ && esAdminOCoord && !estaCerrado && (
            <button
              onClick={() => setModalCab(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Voto CAB</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Principal: 2 Columnas Estilo ServiceDesk Plus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda / Principal con Pestañas */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barra de Pestañas */}
          <div className="flex border-b border-gray-200 bg-white rounded-2xl px-4 pt-2 shadow-sm">
            <button
              onClick={() => setActiveTab('detalle')}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === 'detalle'
                  ? 'border-[#06285C] text-[#06285C]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Información &amp; Detalle</span>
            </button>

            <button
              onClick={() => setActiveTab('comunicacion')}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === 'comunicacion'
                  ? 'border-[#06285C] text-[#06285C]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comunicación ({ticket.comentarios?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('adjuntos')}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === 'adjuntos'
                  ? 'border-[#06285C] text-[#06285C]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Paperclip className="w-4 h-4" />
              <span>Evidencias &amp; Adjuntos ({ticket.adjuntos?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
                activeTab === 'historial'
                  ? 'border-[#06285C] text-[#06285C]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial &amp; Auditoría ({ticket.historial?.length || 0})</span>
            </button>
          </div>

          {/* CONTENIDO TAB 1: DETALLE & INFORMACIÓN */}
          {activeTab === 'detalle' && (
            <div className="space-y-4">
              {/* Solución Registrada (si existe) */}
              {ticket.solucion && (
                <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Diagnóstico Técnico y Solución Aplicada</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {ticket.solucion}
                  </p>
                  {ticket.fechaResolucion && (
                    <div className="text-xs text-emerald-700 pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                      <span>
                        Resuelto el {new Date(ticket.fechaResolucion).toLocaleString('es-PE')}
                      </span>
                      {ticket.ticketSla?.cumplioResolucion !== null && (
                        <span className="font-semibold">
                          SLA: {ticket.ticketSla.cumplioResolucion ? 'Dentro del plazo' : 'Fuera del plazo'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Descripción Principal del Ticket */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#06285C]" />
                  Descripción de la Solicitud
                </h2>
                <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                  {ticket.descripcion}
                </p>
              </div>

              {/* Detalle de Cambio CRQ (si aplica) */}
              {esCRQ && ticket.crqDetalle && (
                <div className="bg-purple-50/40 p-6 rounded-2xl border border-purple-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="w-5 h-5 text-purple-700" />
                      <h3 className="font-bold text-purple-900 text-sm">
                        Plan de Gestión del Cambio (CRQ ITIL)
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {ticket.crqDetalle.tipoTrabajo}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Fecha Programada:</span>
                      <span className="font-semibold text-gray-800">
                        {ticket.crqDetalle.fechaProgramada
                          ? new Date(ticket.crqDetalle.fechaProgramada).toLocaleDateString('es-PE')
                          : 'Por definir'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Ventana Horaria:</span>
                      <span className="font-semibold text-gray-800">
                        {ticket.crqDetalle.horaInicio} - {ticket.crqDetalle.horaFinEstimada}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Impacto:</span>
                      <span className="font-semibold text-gray-800">{ticket.crqDetalle.impacto}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Riesgo:</span>
                      <span className="font-semibold text-gray-800">{ticket.crqDetalle.riesgo}</span>
                    </div>
                  </div>

                  {ticket.crqDetalle.planTrabajo && (
                    <div className="text-xs pt-1">
                      <span className="font-bold text-gray-700 block mb-1">Plan de Trabajo Técnico:</span>
                      <p className="text-gray-700 bg-white p-3 rounded-xl border border-purple-100 whitespace-pre-line leading-relaxed">
                        {ticket.crqDetalle.planTrabajo}
                      </p>
                    </div>
                  )}

                  {ticket.crqDetalle.planPruebas && (
                    <div className="text-xs">
                      <span className="font-bold text-gray-700 block mb-1">Plan de Pruebas y Validación:</span>
                      <p className="text-gray-700 bg-white p-3 rounded-xl border border-purple-100 whitespace-pre-line leading-relaxed">
                        {ticket.crqDetalle.planPruebas}
                      </p>
                    </div>
                  )}

                  {ticket.crqDetalle.planReversa && (
                    <div className="text-xs">
                      <span className="font-bold text-gray-700 block mb-1">Plan de Reversa (Rollback ante contingencia):</span>
                      <p className="text-gray-700 bg-white p-3 rounded-xl border border-purple-100 whitespace-pre-line leading-relaxed">
                        {ticket.crqDetalle.planReversa}
                      </p>
                    </div>
                  )}

                  {/* Votos del Comité de Cambios (CAB) */}
                  <div className="pt-2">
                    <span className="font-bold text-purple-900 text-xs block mb-2">
                      Votación y Dictamen del Comité de Cambios (CAB):
                    </span>
                    <div className="space-y-2">
                      {ticket.crqDetalle.aprobaciones?.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No hay votaciones registradas en el comité.</p>
                      ) : (
                        ticket.crqDetalle.aprobaciones?.map((ap: any) => (
                          <div
                            key={ap.idAprobacion}
                            className="p-3 bg-white rounded-xl border border-purple-100 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-gray-800">
                                {ap.aprobador?.nombres} {ap.aprobador?.apellidos}
                              </div>
                              {ap.comentario && (
                                <div className="text-gray-500 italic mt-0.5">"{ap.comentario}"</div>
                              )}
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                ap.estadoAprobacion === 'APROBADO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ap.estadoAprobacion === 'RECHAZADO'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ap.estadoAprobacion}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTENIDO TAB 2: COMUNICACIÓN & MURO */}
          {activeTab === 'comunicacion' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#06285C]" />
                Muro de Comunicación y Seguimiento
              </h2>

              {/* Lista de comentarios */}
              <div className="space-y-3">
                {ticket.comentarios?.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No se han registrado comentarios aún. Sé el primero en escribir una actualización.
                  </div>
                ) : (
                  ticket.comentarios?.map((c: any) => (
                    <div
                      key={c.idComentario}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        c.comentarioInterno
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-gray-50/80 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">
                            {c.usuario?.nombres} {c.usuario?.apellidos}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            ({c.usuario?.rol?.nombre})
                          </span>
                          {c.comentarioInterno && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" /> Nota Interna TI
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 text-[10px]">
                          {new Date(c.createdAt).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {c.comentario}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Caja de nuevo comentario */}
              <form onSubmit={handleEnviarComentario} className="pt-2 space-y-3 border-t">
                <textarea
                  rows={3}
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Escriba una actualización o mensaje para este ticket..."
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C]"
                  required
                />

                <div className="flex items-center justify-between">
                  {esStaffTI ? (
                    <label className="flex items-center gap-2 text-xs text-amber-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={esInterno}
                        onChange={(e) => setEsInterno(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <Lock className="w-3.5 h-3.5" />
                      <span>Nota técnica interna (oculta para solicitantes)</span>
                    </label>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={enviandoComentario}
                    className="flex items-center gap-2 px-4 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-[#FFD21E]" />
                    <span>{enviandoComentario ? 'Enviando...' : 'Publicar Comentario'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONTENIDO TAB: EVIDENCIAS & ARCHIVOS ADJUNTOS */}
          {activeTab === 'adjuntos' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#06285C]" />
                    Evidencias y Archivos Adjuntos ({ticket.adjuntos?.length || 0})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Capturas de pantalla, oficios de sustento, diagnósticos técnicos y documentos Excel/Word.
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    id="ticket-detail-upload"
                    onChange={handleSubirAdjunto}
                    disabled={subiendoAdjunto || estaCerrado}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  />
                  <label
                    htmlFor="ticket-detail-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition active:scale-95 ${
                      subiendoAdjunto || estaCerrado ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 text-[#FFD21E]" />
                    <span>{subiendoAdjunto ? 'Subiendo archivo...' : 'Adjuntar Nueva Evidencia'}</span>
                  </label>
                </div>
              </div>

              {adjuntoError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {adjuntoError}
                </div>
              )}

              {ticket.adjuntos?.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Paperclip className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs">No hay evidencias o archivos adjuntos en este ticket.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ticket.adjuntos?.map((a: any) => (
                    <div
                      key={a.idAdjunto}
                      className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-blue-50/20 transition"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 bg-blue-100 text-[#06285C] rounded-xl flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-gray-900 text-xs truncate" title={a.nombreArchivo}>
                            {a.nombreArchivo}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-2">
                            <span>
                              {a.tamanio ? `${(Number(a.tamanio) / 1024).toFixed(1)} KB` : 'Archivo'}
                            </span>
                            <span>•</span>
                            <span>Subido por {a.usuario?.nombres}</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={api.tickets.downloadAttachmentUrl(a.idAdjunto)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-[#06285C] hover:bg-blue-100 rounded-xl transition flex-shrink-0"
                        title="Descargar evidencia"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTENIDO TAB 3: HISTORIAL & AUDITORÍA ITIL */}
          {activeTab === 'historial' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
                <History className="w-4 h-4 text-[#06285C]" />
                Trazabilidad y Auditoría (Línea de Tiempo ITIL)
              </h2>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200">
                {ticket.historial?.length === 0 ? (
                  <p className="text-xs text-gray-400 pl-8">Sin eventos registrados.</p>
                ) : (
                  ticket.historial?.map((h: any) => (
                    <div key={h.idHistorial} className="relative flex items-start gap-3 pl-1">
                      <div className="w-6 h-6 rounded-full bg-[#06285C] text-white flex items-center justify-center flex-shrink-0 z-10 text-[10px]">
                        •
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-full text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">{h.accion}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(h.fecha).toLocaleString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-gray-600 mt-1">
                          Por: <span className="font-medium text-gray-800">{h.usuario?.nombres} {h.usuario?.apellidos}</span>
                          {h.valorNuevo && (
                            <span> • Nuevo valor: <span className="font-semibold text-[#06285C]">{h.valorNuevo}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Sidebar ITSM (SLA, Solicitante, Técnico, Metadatos) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tarjeta de SLA */}
          {activeSla && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#06285C]" />
                  Acuerdo de SLA
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${slaBadgeClass}`}>
                  {slaStatusLabel}
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                {slaRemainingText && (
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 font-mono font-bold text-gray-800">
                    {slaRemainingText}
                  </div>
                )}
                {activeSla.fechaLimiteResolucion && (
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-gray-500">Límite Resolución:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(activeSla.fechaLimiteResolucion).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {activeSla.sla && (
                  <div className="flex justify-between text-gray-500">
                    <span>Compromiso Política:</span>
                    <span>{activeSla.sla.tiempoResolucionMin} min ({Math.round(activeSla.sla.tiempoResolucionMin / 60)}h)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tarjeta de Especialista Asignado */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#06285C]" />
              Especialista Asignado
            </h3>
            {activeAsignacion ? (
              <div className="text-xs space-y-1">
                <div className="font-bold text-gray-900 text-sm">
                  {activeAsignacion.especialista.nombres} {activeAsignacion.especialista.apellidos}
                </div>
                <div className="text-gray-500">{activeAsignacion.especialista.correo}</div>
                <div className="text-gray-400 text-[10px] pt-1">
                  Asignado el {new Date(activeAsignacion.fechaAsignacion).toLocaleString('es-PE')}
                </div>
              </div>
            ) : (
              <div className="text-xs space-y-2">
                <span className="italic text-gray-400 block">Sin especialista asignado</span>
                {esStaffTI && (
                  <button
                    onClick={handleTomarTicket}
                    className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg border border-emerald-200 transition"
                  >
                    Tomar este ticket
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tarjeta del Solicitante */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#06285C]" />
              Datos del Solicitante
            </h3>
            <div className="text-xs space-y-1.5">
              <div className="font-bold text-gray-900 text-sm">
                {ticket.solicitante?.nombres} {ticket.solicitante?.apellidos}
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Rol Institucional:</span>
                <span className="font-semibold text-gray-800">{ticket.solicitante?.rol?.nombre}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Correo:</span>
                <span className="font-mono text-gray-700">{ticket.solicitante?.correo}</span>
              </div>
              {ticket.solicitante?.telefono && (
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="text-gray-800">{ticket.solicitante.telefono}</span>
                </div>
              )}
              {ticket.solicitante?.sede && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Sede:</span>
                  <span className="text-gray-800">{ticket.solicitante.sede.nombre}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta Clasificación Institucional */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#06285C]" />
              Clasificación TI
            </h3>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Área:</span>
                <span className="font-semibold text-gray-800">{ticket.area?.nombre}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Servicio:</span>
                <span className="font-semibold text-gray-800">{ticket.servicio?.nombre || 'General'}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Categoría:</span>
                <span className="font-semibold text-gray-800">{ticket.categoria?.nombre || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subcategoría:</span>
                <span className="font-semibold text-gray-800">{ticket.subcategoria?.nombre || '-'}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta CSAT Calificada (si existe) */}
          {ticket.encuesta && (
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                Satisfacción del Solicitante (CSAT)
              </h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= ticket.encuesta.calificacion
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 font-bold text-gray-800 text-sm">
                  {ticket.encuesta.calificacion} / 5
                </span>
              </div>
              {ticket.encuesta.comentario && (
                <p className="text-xs text-gray-600 italic mt-2">
                  "{ticket.encuesta.comentario}"
                </p>
              )}
            </div>
          )}

          {/* Fechas Clave ITIL */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 text-xs">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#06285C]" />
              Línea de Fechas Clave
            </h3>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between border-b pb-1">
                <span>Creación:</span>
                <span className="font-semibold">{new Date(ticket.fechaCreacion).toLocaleString('es-PE')}</span>
              </div>
              {ticket.fechaInicioAtencion && (
                <div className="flex justify-between border-b pb-1">
                  <span>Inicio Atención:</span>
                  <span className="font-semibold">{new Date(ticket.fechaInicioAtencion).toLocaleString('es-PE')}</span>
                </div>
              )}
              {ticket.fechaResolucion && (
                <div className="flex justify-between border-b pb-1">
                  <span>Resolución:</span>
                  <span className="font-semibold text-emerald-700">{new Date(ticket.fechaResolucion).toLocaleString('es-PE')}</span>
                </div>
              )}
              {ticket.fechaCierre && (
                <div className="flex justify-between">
                  <span>Cierre Definitivo:</span>
                  <span className="font-semibold text-gray-800">{new Date(ticket.fechaCierre).toLocaleString('es-PE')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ASIGNAR / REASIGNAR ESPECIALISTA */}
      {modalAsignar && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#06285C]">Asignar Especialista Técnico</h3>
            <form onSubmit={handleAsignar} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Especialista TI <span className="text-red-500">*</span>
                </label>
                <select
                  value={idEspecialistaSeleccionado}
                  onChange={(e) => setIdEspecialistaSeleccionado(Number(e.target.value))}
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-white"
                  required
                >
                  <option value="">Seleccione técnico...</option>
                  {especialistas.map((esp: any) => (
                    <option key={esp.idUsuario} value={esp.idUsuario}>
                      {esp.nombres} {esp.apellidos} ({esp.area?.nombre || 'Soporte TI'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Motivo o Nota de Asignación
                </label>
                <input
                  type="text"
                  value={motivoReasignacion}
                  onChange={(e) => setMotivoReasignacion(e.target.value)}
                  placeholder="Ej. Derivado por especialidad en infraestructura de red"
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAsignar(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAccion}
                  className="px-4 py-2 bg-[#06285C] text-white rounded-xl text-xs font-bold"
                >
                  {procesandoAccion ? 'Guardando...' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CAMBIAR ESTADO ITIL */}
      {modalEstado && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#06285C]">Transición de Estado ITIL</h3>
            <form onSubmit={handleCambiarEstado} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nuevo Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={idEstadoNuevo}
                  onChange={(e) => setIdEstadoNuevo(Number(e.target.value))}
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-white"
                  required
                >
                  <option value="">Seleccione estado...</option>
                  {catalogs?.estados
                    ?.filter((est: any) => est.idEstado !== ticket.idEstado && est.idEstado !== 5) // 5 es Resuelto (usa modal resolver)
                    .map((est: any) => (
                      <option key={est.idEstado} value={est.idEstado}>
                        {est.nombre}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Motivo de la Transición
                </label>
                <textarea
                  rows={2}
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  placeholder="Detalle la justificación operativa o causa de espera..."
                  className="w-full p-2 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEstado(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAccion}
                  className="px-4 py-2 bg-[#06285C] text-white rounded-xl text-xs font-bold"
                >
                  {procesandoAccion ? 'Actualizando...' : 'Actualizar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVER TICKET */}
      {modalResolver && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#06285C] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Registrar Diagnóstico y Resolver Ticket</span>
            </h3>
            <p className="text-xs text-gray-500">
              Conforme a la norma ITIL, especifique las labores técnicas realizadas para solucionar la incidencia.
            </p>
            <form onSubmit={handleResolver} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Informe de Solución Aplicada <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={solucionTexto}
                  onChange={(e) => setSolucionTexto(e.target.value)}
                  placeholder="Describa el procedimiento ejecutado, configuraciones cambiadas o solución definitiva..."
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalResolver(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAccion}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {procesandoAccion ? 'Resolviendo...' : 'Confirmar Resolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CERRAR FORMALMENTE EL TICKET */}
      {modalCerrar && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
              <span>Cierre Definitivo del Ticket</span>
            </h3>
            <p className="text-xs text-gray-500">
              ¿Confirma que la solicitud o incidencia ha sido atendida a satisfacción y procede al cierre definitivo?
            </p>
            <form onSubmit={handleCerrarTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nota u observación de conformidad (opcional)
                </label>
                <textarea
                  rows={2}
                  value={motivoCierre}
                  onChange={(e) => setMotivoCierre(e.target.value)}
                  placeholder="Ej. Servicio verificado y validado en aula/oficina."
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCerrar(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAccion}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {procesandoAccion ? 'Cerrando...' : 'Confirmar Cierre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENCUESTA CSAT */}
      {modalEncuesta && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="p-3 bg-yellow-50 text-[#06285C] rounded-2xl w-fit mx-auto">
              <Star className="w-8 h-8 fill-[#FFD21E] text-[#FFD21E]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#06285C]">
                Encuesta de Satisfacción (CSAT)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                ¿Qué tan satisfecho(a) se encuentra con la atención brindada por el equipo TI de la UNDC?
              </p>
            </div>

            <form onSubmit={handleEnviarEncuesta} className="space-y-4">
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCalificacionEstrellas(star)}
                    className="p-1 hover:scale-125 transition"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= calificacionEstrellas
                          ? 'fill-[#FFD21E] text-[#FFD21E]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={3}
                  value={comentarioEncuesta}
                  onChange={(e) => setComentarioEncuesta(e.target.value)}
                  placeholder="Comentarios adicionales o sugerencias de mejora..."
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEncuesta(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAccion}
                  className="px-5 py-2 bg-[#06285C] text-white rounded-xl text-xs font-bold"
                >
                  {procesandoAccion ? 'Enviando...' : 'Enviar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VOTO CAB CRQ */}
      {modalCab && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-purple-900 flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-purple-700" />
              <span>Comité Asesor de Cambios (CAB)</span>
            </h3>
            <p className="text-xs text-gray-500">
              Emita su dictamen técnico respecto a la autorización de este cambio institucional.
            </p>

            <form onSubmit={handleVotoCab} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Dictamen
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVotoCab('APROBADO')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      votoCab === 'APROBADO'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    APROBADO
                  </button>
                  <button
                    type="button"
                    onClick={() => setVotoCab('RECHAZADO')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      votoCab === 'RECHAZADO'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-300'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    RECHAZADO
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Observaciones o Condiciones del CAB
                </label>
                <textarea
                  rows={3}
                  value={comentarioCab}
                  onChange={(e) => setComentarioCab(e.target.value)}
                  placeholder="Detalle observaciones de seguridad o ventana técnica..."
                  className="w-full p-2 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCab(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoAccion}
                  className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  {procesandoAccion ? 'Registrando...' : 'Registrar Dictamen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketDetallePage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-gray-500">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-[#06285C]" />
          <p className="text-sm">Iniciando expediente del ticket...</p>
        </div>
      }
    >
      <TicketDetalleContent />
    </Suspense>
  );
}
