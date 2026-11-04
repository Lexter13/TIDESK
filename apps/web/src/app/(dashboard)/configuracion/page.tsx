'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Network,
  Tag,
  Wrench,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ConfiguracionPage() {
  const [catalogs, setCatalogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sedes' | 'areas' | 'categorias' | 'servicios'>('sedes');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.catalogs.getAll();
        setCatalogs(data);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#06285C] rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">Configuración de Catálogos Maestros</h1>
            <p className="text-sm text-gray-500">
              Parametrización institucional de Sedes, Áreas TI, Categorías y Servicios – UNDC
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-6 pt-3 shadow-sm">
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
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#06285C]" />
                  Sedes Académicas y Administrativas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {catalogs?.sedes?.map((s: any) => (
                    <div
                      key={s.idSede}
                      className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">{s.nombre}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Activa
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{s.direccion || 'Cañete, Lima, Perú'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB ÁREAS TI */}
            {activeTab === 'areas' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#06285C]" />
                  Estructura Organizacional de TI
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogs?.areas?.map((a: any) => (
                    <div
                      key={a.idArea}
                      className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">{a.nombre}</span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {a.idArea}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Área técnica encargada de tickets y escalamiento dentro de la Dirección de Tecnologías de la Información.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CATEGORÍAS */}
            {activeTab === 'categorias' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#06285C]" />
                  Árbol de Categorías y Subcategorías
                </h3>
                <div className="space-y-3">
                  {catalogs?.categorias?.map((c: any) => (
                    <div
                      key={c.idCategoria}
                      className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span>{c.nombre}</span>
                        <span className="text-[10px] text-gray-400">
                          {c.subcategorias?.length || 0} subcategorías
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {c.subcategorias?.map((sc: any) => (
                          <span
                            key={sc.idSubcategoria}
                            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-700"
                          >
                            {sc.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB SERVICIOS */}
            {activeTab === 'servicios' && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#06285C]" />
                  Catálogo de Servicios Tecnológicos Registrados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catalogs?.servicios?.map((s: any) => (
                    <div
                      key={s.idServicio}
                      className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm text-xs space-y-1"
                    >
                      <div className="font-bold text-gray-900">{s.nombre}</div>
                      <p className="text-gray-500 leading-relaxed">{s.descripcion}</p>
                      <div className="pt-2 flex items-center justify-between text-[10px] text-gray-400 border-t">
                        <span>Área asignada</span>
                        <span className="font-semibold text-gray-700">{s.area?.nombre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
