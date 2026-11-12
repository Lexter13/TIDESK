'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  GraduationCap,
  Briefcase,
  UserPlus,
  Edit2,
  X,
  Key,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function UsuariosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('');

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal de Eliminación con Contraseña
  const [deleteUserTarget, setDeleteUserTarget] = useState<any | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState<string | null>(null);

  const esAdminGeneral = user?.rol === 'Administrador';

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Campos de formulario
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIdRol, setFormIdRol] = useState<number>(5); // default Estudiante
  const [formIdSede, setFormIdSede] = useState<number>(1);
  const [formIdFacultad, setFormIdFacultad] = useState<number | ''>('');
  const [formIdCarrera, setFormIdCarrera] = useState<number | ''>('');
  const [formIdArea, setFormIdArea] = useState<number | ''>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, catRes] = await Promise.all([
        api.users.getAll({
          page,
          limit: 15,
          search: search.trim() || undefined,
          rol: rolFilter || undefined,
        }),
        catalogs ? Promise.resolve(catalogs) : api.catalogs.getAll(),
      ]);
      setUsers(uRes.items || []);
      setTotal(uRes.total || 0);
      if (!catalogs) setCatalogs(catRes);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, rolFilter]);

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await api.users.toggleStatus(id);
      showToast('success', res?.message || 'Estado de la cuenta actualizado.');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Error al cambiar estado del usuario');
    }
  };

  const openDeleteUserModal = (u: any) => {
    if (!esAdminGeneral) return;
    setDeleteUserTarget(u);
    setAdminPassword('');
    setShowAdminPassword(false);
    setDeleteUserError(null);
  };

  const handleConfirmDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteUserTarget || !esAdminGeneral) return;
    setDeleteUserError(null);

    if (!adminPassword.trim()) {
      setDeleteUserError('Debe ingresar su contraseña actual para confirmar la eliminación.');
      return;
    }

    try {
      setDeletingUser(true);
      const res = await api.users.delete(deleteUserTarget.idUsuario, adminPassword);
      setDeleteUserTarget(null);
      setAdminPassword('');
      showToast(
        'success',
        res?.message ||
          `Usuario ${deleteUserTarget.nombres} ${deleteUserTarget.apellidos} procesado correctamente.`,
      );
      await loadData();
    } catch (err: any) {
      setDeleteUserError(err.message || 'Contraseña incorrecta o no se pudo eliminar el usuario.');
    } finally {
      setDeletingUser(false);
    }
  };

  const openCrear = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormCodigo('');
    setFormNombres('');
    setFormApellidos('');
    setFormCorreo('');
    setFormTelefono('');
    setFormPassword('');
    setFormIdRol(5);
    setFormIdSede(1);
    setFormIdFacultad('');
    setFormIdCarrera('');
    setFormIdArea('');
    setErrorModal(null);
    setModalOpen(true);
  };

  const openEditar = (u: any) => {
    setIsEditing(true);
    setSelectedUserId(u.idUsuario);
    setFormCodigo(u.codigo || '');
    setFormNombres(u.nombres || '');
    setFormApellidos(u.apellidos || '');
    setFormCorreo(u.correo || '');
    setFormTelefono(u.telefono || '');
    setFormPassword('');
    setFormIdRol(u.idRol || 5);
    setFormIdSede(u.idSede || 1);
    setFormIdFacultad(u.idFacultad || '');
    setFormIdCarrera(u.idCarrera || '');
    setFormIdArea(u.idArea || '');
    setErrorModal(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);
    try {
      setGuardando(true);
      if (isEditing && selectedUserId) {
        const payload: any = {
          nombres: formNombres.trim(),
          apellidos: formApellidos.trim(),
          telefono: formTelefono.trim() || undefined,
          idRol: Number(formIdRol),
          idSede: Number(formIdSede),
          idFacultad: formIdFacultad ? Number(formIdFacultad) : null,
          idCarrera: formIdCarrera ? Number(formIdCarrera) : null,
          idArea: formIdArea ? Number(formIdArea) : null,
        };
        if (formPassword) {
          payload.password = formPassword;
        }
        await api.users.update(selectedUserId, payload);
      } else {
        await api.users.create({
          codigo: formCodigo.trim(),
          nombres: formNombres.trim(),
          apellidos: formApellidos.trim(),
          correo: formCorreo.trim().toLowerCase(),
          telefono: formTelefono.trim() || undefined,
          password: formPassword,
          idRol: Number(formIdRol),
          idSede: Number(formIdSede),
          idFacultad: formIdFacultad ? Number(formIdFacultad) : undefined,
          idCarrera: formIdCarrera ? Number(formIdCarrera) : undefined,
          idArea: formIdArea ? Number(formIdArea) : undefined,
        });
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorModal(err.message || 'Error al guardar usuario');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado de carreras por facultad seleccionada
  const carrerasFiltradas = catalogs?.carreras?.filter((c: any) =>
    formIdFacultad ? c.idFacultad === Number(formIdFacultad) : true,
  );

  // Rol helper: ¿es rol académico (estudiante/docente) o administrativo/técnico?
  // 1: Admin, 2: Coord TI, 3: Técnico TI, 4: Docente, 5: Estudiante, 6: Administrativo
  const esAcademico = formIdRol === 4 || formIdRol === 5;
  const esAdministrativoOTecnico = formIdRol === 1 || formIdRol === 2 || formIdRol === 3 || formIdRol === 6;

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

      {/* Encabezado Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#06285C] rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">Directorio de Usuarios y Gestión RBAC</h1>
            <p className="text-sm text-gray-500">
              Administración institucional de credenciales, roles y dependencias – Universidad Nacional de Cañete
            </p>
          </div>
        </div>

        {esAdminGeneral && (
          <button
            onClick={openCrear}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/10 transition active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-[#FFD21E]" />
            <span>+ Registrar Usuario</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#06285C] outline-none"
          />
        </div>

        <select
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value)}
          className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
        >
          <option value="">Todos los Roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Coordinador TI">Coordinador TI</option>
          <option value="Técnico TI">Técnico TI</option>
          <option value="Docente">Docente</option>
          <option value="Estudiante">Estudiante</option>
          <option value="Administrativo">Administrativo</option>
        </select>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Total de cuentas registradas: <strong className="text-gray-800">{total}</strong>
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-xs">Cargando directorio de usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b text-gray-600 font-semibold">
                  <th className="p-3">Código</th>
                  <th className="p-3">Nombre Completo</th>
                  <th className="p-3">Correo Institucional</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Sede / Dependencia</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.idUsuario} className="hover:bg-blue-50/20 transition">
                    <td className="p-3 font-mono font-bold text-[#06285C]">{u.codigo}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {u.nombres} {u.apellidos}
                    </td>
                    <td className="p-3 font-mono text-gray-600">{u.correo}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${u.rol?.nombre === 'Administrador'
                            ? 'bg-purple-100 text-purple-800'
                            : u.rol?.nombre === 'Coordinador TI'
                              ? 'bg-blue-100 text-[#06285C]'
                              : u.rol?.nombre === 'Técnico TI'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {u.rol?.nombre || 'Sin rol asignado'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      <div>{u.sede?.nombre || 'Sede General'}</div>
                      {(u.carrera || u.facultad) && (
                        <div className="text-[10px] text-gray-400">
                          {u.carrera?.nombre || u.facultad?.nombre}
                        </div>
                      )}
                      {u.area && (
                        <div className="text-[10px] text-blue-600 font-medium">
                          {u.area?.nombre}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.estado
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                      >
                        {u.estado ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {esAdminGeneral ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditar(u)}
                            title="Editar cuenta"
                            className="p-1 text-gray-500 hover:text-[#06285C] hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u.idUsuario)}
                            className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] transition ${
                              u.estado
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {u.estado ? 'Desactivar' : 'Activar'}
                          </button>
                          {u.idUsuario !== user?.idUsuario && (
                            <button
                              onClick={() => openDeleteUserModal(u)}
                              title="Eliminar usuario con confirmación de contraseña"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded-lg font-semibold text-[10px] transition"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Eliminar</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Solo consulta</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: REGISTRAR / EDITAR USUARIO DINÁMICO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-[#06285C] text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FFD21E]" />
                {isEditing ? 'Editar Cuenta de Usuario' : 'Registrar Usuario Institucional'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorModal && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorModal}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Rol e Identificación */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Rol Institucional <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formIdRol}
                    onChange={(e) => setFormIdRol(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#06285C]"
                    required
                  >
                    {catalogs?.roles?.map((r: any) => (
                      <option key={r.idRol} value={r.idRol}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Código Institucional <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="Ej. 2026-SIS-010"
                    disabled={isEditing}
                    className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#06285C] disabled:bg-gray-100"
                    required
                  />
                </div>
              </div>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNombres}
                    onChange={(e) => setFormNombres(e.target.value)}
                    placeholder="Ej. Roberto Carlos"
                    className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#06285C]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formApellidos}
                    onChange={(e) => setFormApellidos(e.target.value)}
                    placeholder="Ej. Morales Vega"
                    className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#06285C]"
                    required
                  />
                </div>
              </div>

              {/* Correo y Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Correo Institucional (@undc.edu.pe) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formCorreo}
                    onChange={(e) => setFormCorreo(e.target.value)}
                    placeholder="usuario@undc.edu.pe"
                    disabled={isEditing}
                    className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#06285C] disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                    placeholder="987654321"
                    className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#06285C]"
                  />
                </div>
              </div>

              {/* Sede */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Sede Universitaria <span className="text-red-500">*</span>
                </label>
                <select
                  value={formIdSede}
                  onChange={(e) => setFormIdSede(Number(e.target.value))}
                  className="w-full p-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#06285C]"
                >
                  {catalogs?.sedes?.map((s: any) => (
                    <option key={s.idSede} value={s.idSede}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* CAMPOS DINÁMICOS SEGÚN ROL */}
              {esAcademico && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Facultad Académica
                    </label>
                    <select
                      value={formIdFacultad}
                      onChange={(e) => {
                        setFormIdFacultad(e.target.value ? Number(e.target.value) : '');
                        setFormIdCarrera('');
                      }}
                      className="w-full p-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#06285C]"
                    >
                      <option value="">Seleccione Facultad...</option>
                      {catalogs?.facultades?.map((f: any) => (
                        <option key={f.idFacultad} value={f.idFacultad}>
                          {f.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Carrera Profesional
                    </label>
                    <select
                      value={formIdCarrera}
                      onChange={(e) => setFormIdCarrera(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#06285C]"
                    >
                      <option value="">Seleccione Carrera...</option>
                      {carrerasFiltradas?.map((c: any) => (
                        <option key={c.idCarrera} value={c.idCarrera}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {esAdministrativoOTecnico && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Área Administrativa o Equipo de Soporte TI
                  </label>
                  <select
                    value={formIdArea}
                    onChange={(e) => setFormIdArea(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#06285C]"
                  >
                    <option value="">Seleccione Área...</option>
                    {catalogs?.areas?.map((a: any) => (
                      <option key={a.idArea} value={a.idArea}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Contraseña */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {isEditing ? 'Nueva Contraseña (Dejar en blanco para mantener)' : 'Contraseña Inicial'}
                  {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#06285C]"
                  required={!isEditing}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-[#06285C] hover:bg-[#001C45] text-white rounded-xl font-bold shadow-md shadow-blue-900/10 transition"
                >
                  {guardando ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CON CONTRASEÑA PARA ELIMINAR USUARIO */}
      {deleteUserTarget && esAdminGeneral && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Confirmar Eliminación de Usuario</span>
              </div>
              <button
                onClick={() => setDeleteUserTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
              <p className="font-semibold">
                Está solicitando eliminar la cuenta institucional de:
              </p>
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/80 space-y-0.5">
                <div className="font-bold text-sm text-[#06285C]">
                  {deleteUserTarget.nombres} {deleteUserTarget.apellidos}
                </div>
                <div className="font-mono text-xs text-gray-600">
                  Código: <strong>{deleteUserTarget.codigo || 'Sin código'}</strong> • Correo:{' '}
                  {deleteUserTarget.correo}
                </div>
              </div>
              <p className="text-[11px] text-amber-800 pt-1">
                Si el usuario registra historial de tickets, comentarios o auditoría, el sistema desactivará su cuenta de forma segura conservando toda la trazabilidad histórica.
              </p>
            </div>

            {deleteUserError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteUserError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDeleteUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#06285C]" />
                  <span>Contraseña actual del Administrador</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Ingrese su contraseña de inicio de sesión..."
                    className="w-full p-2.5 pr-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700"
                    title={showAdminPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setDeleteUserTarget(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deletingUser}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingUser ? 'Verificando...' : 'Confirmar Eliminación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
