"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SlaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
let SlaService = SlaService_1 = class SlaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SlaService_1.name);
    }
    async auditSlaDeadlines() {
        try {
            const ahora = new Date();
            const expiredTickets = await this.prisma.ticketSla.findMany({
                where: {
                    cumplioResolucion: null,
                    fechaLimiteResolucion: {
                        lt: ahora,
                    },
                    ticket: {
                        idEstado: { in: [1, 2, 3, 4, 8] },
                    },
                },
                include: {
                    ticket: {
                        include: {
                            solicitante: true,
                            asignaciones: { where: { activo: true }, include: { especialista: true } },
                        },
                    },
                },
            });
            if (expiredTickets.length > 0) {
                this.logger.warn(`⚠️ Se detectaron ${expiredTickets.length} tickets con SLA de resolución excedido.`);
                for (const item of expiredTickets) {
                    await this.prisma.$transaction(async (tx) => {
                        await tx.ticketSla.update({
                            where: { idTicketSla: item.idTicketSla },
                            data: { cumplioResolucion: false },
                        });
                        await tx.historialTicket.create({
                            data: {
                                idTicket: item.idTicket,
                                idUsuario: 1,
                                accion: 'Incumplimiento de SLA Detectado',
                                campoModificado: 'sla_resolucion',
                                valorAnterior: 'En Plazo',
                                valorNuevo: 'Vencido',
                                fecha: ahora,
                            },
                        });
                        const coordinadores = await tx.usuario.findMany({
                            where: { rol: { nombre: { in: ['Coordinador TI', 'Administrador'] } }, estado: true },
                        });
                        for (const coord of coordinadores) {
                            await tx.notificacion.create({
                                data: {
                                    idUsuario: coord.idUsuario,
                                    idTicket: item.idTicket,
                                    titulo: `⚠️ SLA Vencido: ${item.ticket.codigo}`,
                                    mensaje: `El ticket ${item.ticket.codigo} ha excedido el plazo límite de resolución estipulado por las políticas de servicio.`,
                                    fecha: ahora,
                                },
                            });
                        }
                    });
                }
            }
        }
        catch (err) {
            this.logger.error(`Error en auditoría de SLA: ${err.message}`);
        }
    }
    async getPolicies() {
        return this.prisma.politicaSla.findMany({
            orderBy: { idPrioridad: 'desc' },
            include: {
                prioridad: true,
                tipoTicket: true,
            },
        });
    }
    async updatePolicy(id, data) {
        const existing = await this.prisma.politicaSla.findUnique({ where: { idSla: id } });
        if (!existing)
            throw new common_1.NotFoundException('Política SLA no encontrada.');
        return this.prisma.politicaSla.update({
            where: { idSla: id },
            data: {
                nombre: data.nombre ?? existing.nombre,
                tiempoPrimeraRespuestaMin: data.tiempoPrimeraRespuestaMin ?? existing.tiempoPrimeraRespuestaMin,
                tiempoResolucionMin: data.tiempoResolucionMin ?? existing.tiempoResolucionMin,
                estado: data.estado ?? existing.estado,
            },
            include: {
                prioridad: true,
                tipoTicket: true,
            },
        });
    }
    async getSlaMetrics() {
        const totalWithSla = await this.prisma.ticketSla.count();
        const fulfilled = await this.prisma.ticketSla.count({ where: { cumplioResolucion: true } });
        const breached = await this.prisma.ticketSla.count({ where: { cumplioResolucion: false } });
        const inProgress = await this.prisma.ticketSla.count({ where: { cumplioResolucion: null } });
        const totalEvaluated = fulfilled + breached;
        const complianceRate = totalEvaluated > 0 ? Math.round((fulfilled / totalEvaluated) * 100) : 100;
        return {
            totalWithSla,
            fulfilled,
            breached,
            inProgress,
            complianceRate,
        };
    }
};
exports.SlaService = SlaService;
__decorate([
    (0, schedule_1.Cron)('*/2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaService.prototype, "auditSlaDeadlines", null);
exports.SlaService = SlaService = SlaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SlaService);
//# sourceMappingURL=sla.service.js.map