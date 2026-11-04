import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(query: any) {
    const where: any = {};
    if (query?.idArea && !isNaN(Number(query.idArea))) where.idArea = Number(query.idArea);
    if (query?.idTipoTicket && !isNaN(Number(query.idTipoTicket))) where.idTipoTicket = Number(query.idTipoTicket);

    const [total, porEstado, porTipo, porPrioridad, encuestas, slaStats] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.estado.findMany({
        select: {
          nombre: true,
          _count: { select: { tickets: { where } } },
        },
      }),
      this.prisma.tipoTicket.findMany({
        select: {
          nombre: true,
          codigo: true,
          _count: { select: { tickets: { where } } },
        },
      }),
      this.prisma.prioridad.findMany({
        select: {
          nombre: true,
          _count: { select: { tickets: { where } } },
        },
      }),
      this.prisma.encuesta.findMany({
        select: { calificacion: true },
      }),
      this.prisma.ticketSla.groupBy({
        by: ['cumplioResolucion'],
        _count: { idTicketSla: true },
      }),
    ]);

    const avgCsat =
      encuestas.length > 0
        ? Number(
            (
              encuestas.reduce((acc, curr) => acc + curr.calificacion, 0) /
              encuestas.length
            ).toFixed(2),
          )
        : 5.0;

    return {
      total,
      estados: porEstado.map((e) => ({ nombre: e.nombre, cantidad: e._count.tickets })),
      tipos: porTipo.map((t) => ({ nombre: t.nombre, codigo: t.codigo, cantidad: t._count.tickets })),
      prioridades: porPrioridad.map((p) => ({ nombre: p.nombre, cantidad: p._count.tickets })),
      csat: {
        totalEncuestas: encuestas.length,
        promedio: avgCsat,
      },
      sla: slaStats,
    };
  }

  async exportExcel(res: Response, query: any) {
    const where: any = {};
    if (query?.idArea && !isNaN(Number(query.idArea))) where.idArea = Number(query.idArea);
    if (query?.idTipoTicket && !isNaN(Number(query.idTipoTicket))) where.idTipoTicket = Number(query.idTipoTicket);

    const tickets = await this.prisma.ticket.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        tipoTicket: true,
        prioridad: true,
        estado: true,
        area: true,
        solicitante: {
          include: { sede: true, rol: true },
        },
        asignaciones: {
          where: { activo: true },
          include: { especialista: true },
        },
        ticketSla: true,
        encuesta: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TIDESK - Universidad Nacional de Cañete';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Reporte de Tickets UNDC', {
      views: [{ showGridLines: true }],
    });

    // Título institucional
    sheet.mergeCells('A1:N1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'UNIVERSIDAD NACIONAL DE CAÑETE – TIDESK (SISTEMA DE MESA DE AYUDA)';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF06285C' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 35;

    // Subtítulo
    sheet.mergeCells('A2:N2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `Reporte exportado el: ${new Date().toLocaleString('es-PE')} | Total de registros: ${tickets.length}`;
    subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF333333' } };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 20;

    // Encabezados de tabla
    const headers = [
      'Código',
      'Tipo ITIL',
      'Título del Ticket',
      'Solicitante',
      'Rol Solicitante',
      'Sede',
      'Área Responsable',
      'Prioridad',
      'Estado',
      'Especialista Asignado',
      'Fecha Creación',
      'Fecha Cierre',
      'SLA Cumplido',
      'Calificación CSAT',
    ];

    const headerRow = sheet.addRow(headers);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF001C45' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Filas de datos
    tickets.forEach((t) => {
      const activeAsig = t.asignaciones[0];
      const activeSla = t.ticketSla?.[0];
      const row = sheet.addRow([
        t.codigo,
        t.tipoTicket?.codigo,
        t.titulo,
        t.solicitante ? `${t.solicitante.nombres} ${t.solicitante.apellidos}` : 'Anónimo',
        t.solicitante?.rol?.nombre || '-',
        t.solicitante?.sede?.nombre || '-',
        t.area?.nombre || '-',
        t.prioridad?.nombre,
        t.estado?.nombre,
        activeAsig ? `${activeAsig.especialista.nombres} ${activeAsig.especialista.apellidos}` : 'Sin asignar',
        new Date(t.fechaCreacion).toLocaleString('es-PE'),
        t.fechaCierre ? new Date(t.fechaCierre).toLocaleString('es-PE') : '-',
        activeSla?.cumplioResolucion === true
          ? 'Sí'
          : activeSla?.cumplioResolucion === false
          ? 'No'
          : 'En plazo',
        t.encuesta ? `${t.encuesta.calificacion} / 5` : 'Pendiente',
      ]);

      row.height = 20;
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

    // Ancho automático de columnas
    sheet.columns.forEach((col, idx) => {
      let maxLen = 15;
      col?.eachCell?.({ includeEmpty: false }, (cell) => {
        const val = cell.value ? String(cell.value) : '';
        if (val.length > maxLen) maxLen = Math.min(val.length + 3, 40);
      });
      col.width = maxLen;
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Reporte_TIDESK_UNDC_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async exportCsv(res: Response, query: any) {
    const where: any = {};
    if (query?.idArea) where.idArea = Number(query.idArea);

    const tickets = await this.prisma.ticket.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        tipoTicket: true,
        prioridad: true,
        estado: true,
        area: true,
        solicitante: true,
      },
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Reporte_TIDESK_UNDC_${Date.now()}.csv`,
    );

    // UTF-8 BOM
    res.write('\uFEFF');

    const headers = 'Código;Tipo;Título;Solicitante;Área;Prioridad;Estado;Fecha Creación\n';
    res.write(headers);

    tickets.forEach((t) => {
      const line = `"${t.codigo}";"${t.tipoTicket?.codigo}";"${t.titulo.replace(/"/g, '""')}";"${t.solicitante ? t.solicitante.nombres + ' ' + t.solicitante.apellidos : ''}";"${t.area?.nombre}";"${t.prioridad?.nombre}";"${t.estado?.nombre}";"${new Date(t.fechaCreacion).toISOString()}"\n`;
      res.write(line);
    });

    res.end();
  }
}
