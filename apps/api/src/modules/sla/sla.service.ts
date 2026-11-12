import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto/sla-policy.dto';

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
    // Asegurar que la prioridad Baja (nivel 4) cuente con su política institucional vinculada en PostgreSQL
    const prioBaja = await this.prisma.prioridad.findFirst({
      where: {
        OR: [{ idPrioridad: 4 }, { nombre: { equals: 'Baja', mode: 'insensitive' } }],
      },
    });

    if (prioBaja) {
      const hasBajaPolicy = await this.prisma.politicaSla.findFirst({
        where: { idPrioridad: prioBaja.idPrioridad },
      });
      if (!hasBajaPolicy) {
        const tipoReq = await this.prisma.tipoTicket.findFirst({ where: { codigo: 'REQ' } });
        await this.prisma.politicaSla.create({
          data: {
            idTipoTicket: tipoReq ? tipoReq.idTipoTicket : null,
            idPrioridad: prioBaja.idPrioridad,
            nombre: 'Atención de Baja Prioridad',
            tiempoPrimeraRespuestaMin: 120,
            tiempoResolucionMin: 1440,
            estado: true,
          },
        });
      }
    }

    return this.prisma.politicaSla.findMany({
      orderBy: [{ prioridad: { nivel: 'asc' } }, { idSla: 'asc' }],
      include: {
        prioridad: true,
        tipoTicket: true,
      },
    });
  }

  async createPolicy(data: CreateSlaPolicyDto) {
    const prio = await this.prisma.prioridad.findUnique({
      where: { idPrioridad: Number(data.idPrioridad) },
    });
    if (!prio) {
      throw new NotFoundException('La prioridad seleccionada no existe.');
    }

    return this.prisma.politicaSla.create({
      data: {
        nombre: data.nombre.trim(),
        idPrioridad: Number(data.idPrioridad),
        idTipoTicket: data.idTipoTicket ? Number(data.idTipoTicket) : null,
        tiempoPrimeraRespuestaMin: Number(data.tiempoPrimeraRespuestaMin),
        tiempoResolucionMin: Number(data.tiempoResolucionMin),
        estado: true,
      },
      include: {
        prioridad: true,
        tipoTicket: true,
      },
    });
  }

  async updatePolicy(id: number, data: UpdateSlaPolicyDto) {
    const existing = await this.prisma.politicaSla.findUnique({ where: { idSla: id } });
    if (!existing) throw new NotFoundException('Política SLA no encontrada.');

    if (data.idPrioridad !== undefined) {
      const prio = await this.prisma.prioridad.findUnique({
        where: { idPrioridad: Number(data.idPrioridad) },
      });
      if (!prio) {
        throw new NotFoundException('La prioridad seleccionada no existe.');
      }
    }

    return this.prisma.politicaSla.update({
      where: { idSla: id },
      data: {
        nombre: data.nombre !== undefined ? data.nombre.trim() : existing.nombre,
        idPrioridad: data.idPrioridad !== undefined ? Number(data.idPrioridad) : existing.idPrioridad,
        idTipoTicket:
          data.idTipoTicket !== undefined
            ? data.idTipoTicket
              ? Number(data.idTipoTicket)
              : null
            : existing.idTipoTicket,
        tiempoPrimeraRespuestaMin:
          data.tiempoPrimeraRespuestaMin ?? existing.tiempoPrimeraRespuestaMin,
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
