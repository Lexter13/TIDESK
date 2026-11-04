'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api, getToken } from '@/lib/api';

const COLORS = ['#06285C', '#176BDA', '#009B60', '#FFD21E', '#E51C3B', '#8B5CF6'];

export default function ReportesPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [catalogs, setCatalogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [idArea, setIdArea] = useState<string>('');
  const [idTipoTicket, setIdTipoTicket] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, cat] = await Promise.all([
        api.reports.getAnalytics({
          idArea: idArea || undefined,
          idTipoTicket: idTipoTicket || undefined,
        }),
        catalogs ? Promise.resolve(catalogs) : api.catalogs.getAll(),
      ]);
      setAnalytics(data);
      if (!catalogs) setCatalogs(cat);
    } catch (err) {
      console.error('Error cargando analítica:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [idArea, idTipoTicket]);

  const handleExportExcel = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (idArea) params.append('idArea', idArea);
      if (idTipoTicket) params.append('idTipoTicket', idTipoTicket);

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/reports/export/excel?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Reporte_TIDESK_UNDC_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Error al descargar reporte Excel');
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (idArea) params.append('idArea', idArea);

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/reports/export/csv?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Reporte_TIDESK_UNDC_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Error al descargar reporte CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#06285C] rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#06285C]">Reportes y Analítica Institucional</h1>
            <p className="text-sm text-gray-500">
              Métricas de rendimiento ITIL, cumplimiento de SLA y satisfacción del usuario – UNDC
            </p>
          </div>
        </div>

        {/* Botones de Descarga */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#009B60] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/10 transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FFD21E]" />
            <span>Descargar Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mr-2">
          <Filter className="w-4 h-4 text-[#06285C]" />
          <span>Filtrar métricas:</span>
        </div>

        <select
          value={idArea}
          onChange={(e) => setIdArea(e.target.value)}
          className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
        >
          <option value="">Todas las Áreas TI</option>
          {catalogs?.areas?.map((a: any) => (
            <option key={a.idArea} value={a.idArea}>
              {a.nombre}
            </option>
          ))}
        </select>

        <select
          value={idTipoTicket}
          onChange={(e) => setIdTipoTicket(e.target.value)}
          className="py-1.5 px-3 text-xs border border-gray-200 rounded-xl bg-white text-gray-700"
        >
          <option value="">Todos los Tipos (REQ / INC / CRQ)</option>
          {catalogs?.tiposTicket?.map((t: any) => (
            <option key={t.idTipoTicket} value={t.idTipoTicket}>
              {t.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setIdArea('');
            setIdTipoTicket('');
          }}
          className="p-1.5 text-gray-400 hover:text-gray-700"
          title="Resetear filtros"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total Solicitudes</span>
            <span className="p-2 bg-blue-50 text-[#06285C] rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#06285C] mt-2">
            {loading ? '...' : analytics?.total || 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Registros en el periodo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Satisfacción CSAT</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Star className="w-4 h-4 fill-current" />
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 flex items-baseline gap-1">
            <span>{loading ? '...' : analytics?.csat?.promedio || '5.0'}</span>
            <span className="text-xs text-gray-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {analytics?.csat?.totalEncuestas || 0} encuestas evaluadas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Tickets Resueltos</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {loading
              ? '...'
              : analytics?.estados?.find((e: any) => e.nombre === 'Resuelto')?.cantidad || 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Solucionados por soporte TI</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Pendientes de Atención</span>
            <span className="p-2 bg-rose-50 text-[#E51C3B] rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#E51C3B] mt-2">
            {loading
              ? '...'
              : analytics?.estados?.find((e: any) => e.nombre === 'Pendiente')?.cantidad || 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">En cola de asignación</p>
        </div>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Distribución por Estado */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-sm">Distribución de Tickets por Estado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.estados || []}>
                <XAxis dataKey="nombre" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#06285C" radius={[6, 6, 0, 0]}>
                  {analytics?.estados?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribución por Tipo de Ticket */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-sm">Proporción por Tipo ITIL</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.tipos || []}
                  dataKey="cantidad"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {analytics?.tipos?.map((entry: any, index: number) => (
                    <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Distribución por Nivel de Prioridad */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-bold text-gray-800 text-sm">Volumen de Tickets por Nivel de Prioridad</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.prioridades || []} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" stroke="#888888" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#176BDA" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
