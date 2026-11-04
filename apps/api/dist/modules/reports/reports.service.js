"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAnalytics(query) {
        const where = {};
        if (query?.idArea && !isNaN(Number(query.idArea)))
            where.idArea = Number(query.idArea);
        if (query?.idTipoTicket && !isNaN(Number(query.idTipoTicket)))
            where.idTipoTicket = Number(query.idTipoTicket);
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
        const avgCsat = encuestas.length > 0
            ? Number((encuestas.reduce((acc, curr) => acc + curr.calificacion, 0) /
                encuestas.length).toFixed(2))
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
    async exportExcel(res, query) {
        const where = {};
        if (query?.idArea && !isNaN(Number(query.idArea)))
            where.idArea = Number(query.idArea);
        if (query?.idTipoTicket && !isNaN(Number(query.idTipoTicket)))
            where.idTipoTicket = Number(query.idTipoTicket);
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
        sheet.mergeCells('A2:N2');
        const subtitleCell = sheet.getCell('A2');
        subtitleCell.value = `Reporte exportado el: ${new Date().toLocaleString('es-PE')} | Total de registros: ${tickets.length}`;
        subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF333333' } };
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getRow(2).height = 20;
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
        sheet.columns.forEach((col, idx) => {
            let maxLen = 15;
            col?.eachCell?.({ includeEmpty: false }, (cell) => {
                const val = cell.value ? String(cell.value) : '';
                if (val.length > maxLen)
                    maxLen = Math.min(val.length + 3, 40);
            });
            col.width = maxLen;
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_TIDESK_UNDC_${Date.now()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async exportCsv(res, query) {
        const where = {};
        if (query?.idArea)
            where.idArea = Number(query.idArea);
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
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_TIDESK_UNDC_${Date.now()}.csv`);
        res.write('\uFEFF');
        const headers = 'Código;Tipo;Título;Solicitante;Área;Prioridad;Estado;Fecha Creación\n';
        res.write(headers);
        tickets.forEach((t) => {
            const line = `"${t.codigo}";"${t.tipoTicket?.codigo}";"${t.titulo.replace(/"/g, '""')}";"${t.solicitante ? t.solicitante.nombres + ' ' + t.solicitante.apellidos : ''}";"${t.area?.nombre}";"${t.prioridad?.nombre}";"${t.estado?.nombre}";"${new Date(t.fechaCreacion).toISOString()}"\n`;
            res.write(line);
        });
        res.end();
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map