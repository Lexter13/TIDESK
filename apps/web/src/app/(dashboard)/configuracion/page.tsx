'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Network,
  Tag,
  Wrench,
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

type CatalogType = 'sede' | 'area' | 'categoria' | 'subcategoria' | 'servicio';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sedes' | 'areas' | 'categorias' | 'servicios'>('sedes');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const esAdminGeneral = user?.rol === 'Administrador';

  // Modal de Creación
  const [createModal, setCreateModal] = useState<{
    open: boolean;
    type: CatalogType;
    defaultCategoryId?: number;
  } | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formDireccion, setFormDireccion] = useState('');
  const [formIdCategoria, setFormIdCategoria] = useState<number | ''>('');
  const [formIdArea, setFormIdArea] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Modal de Eliminación con Confirmación de Contraseña
  const [deleteTarget, setDeleteTarget] = useState<{
    type: CatalogType;
    id: number;
    nombre: string;
    etiquetaTipo: string;
  } | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.catalogs.getAll();
      setCatalogs(data);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = (type: CatalogType, defaultCategoryId?: number) => {
    if (!esAdminGeneral) return;
    setFormNombre('');
    setFormDescripcion('');
    setFormDireccion('');
    setFormIdCategoria(defaultCategoryId || catalogs?.categorias?.[0]?.idCategoria || '');
    setFormIdArea(catalogs?.areas?.[0]?.idArea || '');
    setModalError(null);
    setCreateModal({ open: true, type, defaultCategoryId });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createModal || !esAdminGeneral) return;
    setModalError(null);

    try {
      setSaving(true);
      const nombreTrim = formNombre.trim();
      if (!nombreTrim) {
        setModalError('El nombre del registro es obligatorio.');
        return;
      }

      if (createModal.type === 'sede') {
        await api.catalogs.createSede({
          nombre: nombreTrim,
          direccion: formDireccion.trim() || undefined,
        });
        showToast('success', `Sede "${nombreTrim}" registrada exitosamente.`);
      } else if (createModal.type === 'area') {
        await api.catalogs.createArea({
          nombre: nombreTrim,
          descripcion: formDescripcion.trim() || undefined,
        });
        showToast('success', `Área de TI "${nombreTrim}" registrada exitosamente.`);
      } else if (createModal.type === 'categoria') {
        await api.catalogs.createCategoria({
          nombre: nombreTrim,
          descripcion: formDescripcion.trim() || undefined,
        });
        showToast('success', `Categoría "${nombreTrim}" registrada exitosamente.`);
      } else if (createModal.type === 'subcategoria') {
        if (!formIdCategoria) {
          setModalError('Debe seleccionar una categoría principal.');
          return;
        }
        await api.catalogs.createSubcategoria({
          idCategoria: Number(formIdCategoria),
          nombre: nombreTrim,
          descripcion: formDescripcion.trim() || undefined,
        });
        showToast('success', `Subcategoría "${nombreTrim}" agregada exitosamente.`);
      } else if (createModal.type === 'servicio') {
        if (!formIdArea) {
          setModalError('Debe seleccionar un área responsable de TI.');
          return;
        }
        await api.catalogs.createServicio({
          idArea: Number(formIdArea),
          nombre: nombreTrim,
          descripcion: formDescripcion.trim() || undefined,
        });
        showToast('success', `Servicio TI "${nombreTrim}" registrado exitosamente.`);
      }

      setCreateModal(null);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'Error al registrar en el catálogo.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (type: CatalogType, id: number, nombre: string, etiquetaTipo: string) => {
    if (!esAdminGeneral) return;
    setDeleteTarget({ type, id, nombre, etiquetaTipo });
    setAdminPassword('');
    setShowPassword(false);
    setDeleteError(null);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget || !esAdminGeneral) return;
    setDeleteError(null);

    if (!adminPassword.trim()) {
      setDeleteError('Debe ingresar su contraseña actual para confirmar la operación.');
      return;
    }

    try {
      setDeleting(true);
      let res: any;
      if (deleteTarget.type === 'sede') {
        res = await api.catalogs.deleteSede(deleteTarget.id, adminPassword);
      } else if (deleteTarget.type === 'area') {
        res = await api.catalogs.deleteArea(deleteTarget.id, adminPassword);
      } else if (deleteTarget.type === 'categoria') {
        res = await api.catalogs.deleteCategoria(deleteTarget.id, adminPassword);
      } else if (deleteTarget.type === 'subcategoria') {
        res = await api.catalogs.deleteSubcategoria(deleteTarget.id, adminPassword);
      } else if (deleteTarget.type === 'servicio') {
        res = await api.catalogs.deleteServicio(deleteTarget.id, adminPassword);
      }

      setDeleteTarget(null);
      setAdminPassword('');
      showToast('success', res?.message || `Registro "${deleteTarget.nombre}" eliminado correctamente.`);
      await loadData();
    } catch (err: any) {
      setDeleteError(err.message || 'Contraseña incorrecta o no se pudo completar la eliminación.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificación Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
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
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">Configuración de Catálogos Maestros</h1>
            <p className="text-sm text-gray-500">
              Parametrización institucional de Sedes, Áreas TI, Categorías, Subcategorías y Servicios – UNDC
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 bg-white rounded-t-2xl px-6 pt-3 shadow-sm">
        {[
          { id: 'sedes', label: 'Sedes Universitarias', icono: MapPin },
          { id: 'areas', label: 'Áreas de TI', icono: Network },
          { id: 'categorias', label: 'Categorías y Subcategorías', icono: Tag },
          { id: 'servicios', label: 'Servicios TI', icono: Wrench },
        ].map((tab) => {
          const Icon = tab.icono;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#06285C] text-[#06285C]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido de Tab */}
      <div className="bg-white rounded-b-2xl border border-gray-100 p-6 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">Cargando catálogos...</div>
        ) : (
          <div>
            {/* TAB SEDES */}
            {activeTab === 'sedes' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#06285C]" />
                    Sedes Académicas y Administrativas ({catalogs?.sedes?.length || 0})
                  </h3>
                  {esAdminGeneral && (
                    <button
                      onClick={() => openCreateModal('sede')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Plus className="w-4 h-4 text-[#FFD21E]" />
                      <span>Agregar Sede</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {catalogs?.sedes?.map((s: any) => (
                    <div
                      key={s.idSede}
                      className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-gray-900 text-sm">{s.nombre}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                            Activa
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{s.direccion || 'Cañete, Lima, Perú'}</p>
                      </div>

                      {esAdminGeneral && (
                        <div className="pt-2 border-t border-gray-200/60 flex justify-end">
                          <button
                            onClick={() => openDeleteModal('sede', s.idSede, s.nombre, 'Sede Universitaria')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar sede"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB ÁREAS TI */}
            {activeTab === 'areas' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Network className="w-4 h-4 text-[#06285C]" />
                    Estructura Organizacional de TI ({catalogs?.areas?.length || 0})
                  </h3>
                  {esAdminGeneral && (
                    <button
                      onClick={() => openCreateModal('area')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Plus className="w-4 h-4 text-[#FFD21E]" />
                      <span>Registrar Área de TI</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogs?.areas?.map((a: any) => (
                    <div
                      key={a.idArea}
                      className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{a.nombre}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {a.idArea}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {a.descripcion ||
                            'Área técnica encargada de tickets y escalamiento dentro de la Dirección de Tecnologías de la Información.'}
                        </p>
                      </div>

                      {esAdminGeneral && (
                        <div className="pt-2 border-t border-gray-200/60 flex justify-end">
                          <button
                            onClick={() => openDeleteModal('area', a.idArea, a.nombre, 'Área de TI')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar área de TI"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CATEGORÍAS Y SUBCATEGORÍAS */}
            {activeTab === 'categorias' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#06285C]" />
                    Árbol de Categorías y Subcategorías ({catalogs?.categorias?.length || 0})
                  </h3>
                  {esAdminGeneral && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openCreateModal('categoria')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-bold shadow-sm transition"
                      >
                        <Plus className="w-4 h-4 text-[#FFD21E]" />
                        <span>Agregar Categoría</span>
                      </button>
                      <button
                        onClick={() => openCreateModal('subcategoria')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#06285C] border border-blue-200 rounded-xl text-xs font-bold transition"
                      >
                        <Plus className="w-4 h-4 text-[#06285C]" />
                        <span>Agregar Subcategoría</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {catalogs?.categorias?.map((c: any) => (
                    <div
                      key={c.idCategoria}
                      className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 text-sm">{c.nombre}</span>
                          {c.descripcion && (
                            <p className="text-[11px] text-gray-500 mt-0.5">{c.descripcion}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {c.subcategorias?.length || 0} subcategorías
                          </span>
                          {esAdminGeneral && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openCreateModal('subcategoria', c.idCategoria)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#06285C] hover:bg-blue-50 rounded-lg transition"
                                title="Agregar subcategoría en esta categoría"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Subcategoría</span>
                              </button>
                              <button
                                onClick={() =>
                                  openDeleteModal('categoria', c.idCategoria, c.nombre, 'Categoría')
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {c.subcategorias?.length === 0 ? (
                          <span className="text-[11px] text-gray-400 italic">
                            Sin subcategorías registradas
                          </span>
                        ) : (
                          c.subcategorias?.map((sc: any) => (
                            <span
                              key={sc.idSubcategoria}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 shadow-2xs"
                            >
                              <span>{sc.nombre}</span>
                              {esAdminGeneral && (
                                <button
                                  onClick={() =>
                                    openDeleteModal(
                                      'subcategoria',
                                      sc.idSubcategoria,
                                      sc.nombre,
                                      'Subcategoría',
                                    )
                                  }
                                  className="text-gray-400 hover:text-red-600 transition ml-1"
                                  title={`Eliminar subcategoría ${sc.nombre}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB SERVICIOS */}
            {activeTab === 'servicios' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#06285C]" />
                    Catálogo de Servicios Tecnológicos Registrados ({catalogs?.servicios?.length || 0})
                  </h3>
                  {esAdminGeneral && (
                    <button
                      onClick={() => openCreateModal('servicio')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <Plus className="w-4 h-4 text-[#FFD21E]" />
                      <span>Agregar Servicio de TI</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catalogs?.servicios?.map((s: any) => (
                    <div
                      key={s.idServicio}
                      className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm text-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-gray-900 text-sm">{s.nombre}</div>
                        <p className="text-gray-500 leading-relaxed">
                          {s.descripcion || 'Servicio tecnológico institucional de la UNDC.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>Área asignada</span>
                          <span className="font-semibold text-gray-700">{s.area?.nombre}</span>
                        </div>

                        {esAdminGeneral && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() =>
                                openDeleteModal('servicio', s.idServicio, s.nombre, 'Servicio de TI')
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar servicio de TI"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL PARA AGREGAR REGISTRO EN CATÁLOGO */}
      {createModal?.open && esAdminGeneral && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-[#06285C] text-base">
                {createModal.type === 'sede' && 'Agregar Nueva Sede Universitaria'}
                {createModal.type === 'area' && 'Registrar Nueva Área de TI'}
                {createModal.type === 'categoria' && 'Agregar Nueva Categoría'}
                {createModal.type === 'subcategoria' && 'Agregar Nueva Subcategoría'}
                {createModal.type === 'servicio' && 'Agregar Nuevo Servicio de TI'}
              </h3>
              <button
                onClick={() => setCreateModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {createModal.type === 'subcategoria' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Categoría Principal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formIdCategoria}
                    onChange={(e) => setFormIdCategoria(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#06285C]"
                    required
                  >
                    <option value="">Seleccione una categoría...</option>
                    {catalogs?.categorias?.map((cat: any) => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {createModal.type === 'servicio' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Área de TI Responsable <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formIdArea}
                    onChange={(e) => setFormIdArea(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#06285C]"
                    required
                  >
                    <option value="">Seleccione un área...</option>
                    {catalogs?.areas?.map((area: any) => (
                      <option key={area.idArea} value={area.idArea}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ingrese el nombre oficial..."
                  maxLength={150}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#06285C]"
                  required
                />
              </div>

              {createModal.type === 'sede' ? (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Dirección Institucional
                  </label>
                  <input
                    type="text"
                    value={formDireccion}
                    onChange={(e) => setFormDireccion(e.target.value)}
                    placeholder="Ej. Av. Mariscal Benavides 1370, San Vicente de Cañete"
                    maxLength={250}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#06285C]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Descripción / Alcance Operativo
                  </label>
                  <textarea
                    rows={3}
                    value={formDescripcion}
                    onChange={(e) => setFormDescripcion(e.target.value)}
                    placeholder="Detalle brevemente el alcance de este registro..."
                    maxLength={250}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#06285C]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl font-bold shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CON CONTRASEÑA PARA ELIMINAR */}
      {deleteTarget && esAdminGeneral && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Confirmar Eliminación en Catálogo</span>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-semibold">
                Está a punto de eliminar el siguiente registro de {deleteTarget.etiquetaTipo}:
              </p>
              <p className="font-bold text-sm text-[#06285C] mt-1">
                &ldquo;{deleteTarget.nombre}&rdquo;
              </p>
              <p className="text-[11px] text-amber-800 pt-1">
                Por seguridad institucional, ingrese su contraseña actual de Administrador General. Si el registro posee historial asociado, se desactivará de forma segura sin borrar datos históricos.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDelete} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#06285C]" />
                  <span>Contraseña actual del Administrador</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Ingrese su contraseña de inicio de sesión..."
                    className="w-full p-2.5 pr-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deleting ? 'Verificando...' : 'Confirmar Eliminación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
