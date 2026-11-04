import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(private prisma: PrismaService) {}

  // Auditoría automática periódica de SLA
  @Cron('*/2 * * * *')
  async auditSlaDeadlines() {
    try {
      const ahora = new Date();

      // Buscar tickets abiertos con SLA de resolución sobrepasado
      const expiredTickets = await this.prisma.ticketSla.findMany({
        where: {
          cumplioResolucion: null,
          fechaLimiteResolucion: {
            lt: ahora,
          },
          ticket: {
            idEstado: { in: [1, 2, 3, 4, 8] }, // Abiertos (Pendiente, Asignado, En atención, En espera, etc.)
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
            // Marcar incumplimiento
            await tx.ticketSla.update({
              where: { idTicketSla: item.idTicketSla },
              data: { cumplioResolucion: false },
            });

            // Registrar en historial
            await tx.historialTicket.create({
              data: {
                idTicket: item.idTicket,
                idUsuario: 1, // Sistema
                accion: 'Incumplimiento de SLA Detectado',
                campoModificado: 'sla_resolucion',
                valorAnterior: 'En Plazo',
                valorNuevo: 'Vencido',
                fecha: ahora,
              },
            });

            // Notificar a Coordinadores TI
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
    } catch (err: any) {
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

  async updatePolicy(id: number, data: any) {
    const existing = await this.prisma.politicaSla.findUnique({ where: { idSla: id } });
    if (!existing) throw new NotFoundException('Política SLA no encontrada.');

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
}
