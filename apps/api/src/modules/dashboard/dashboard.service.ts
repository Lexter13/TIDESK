import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(filters: any, currentUser: any) {
    const where: any = {};
    const rol = currentUser.role;

    // 1. Ámbito de visibilidad según rol institucional (RBAC)
    const isSolicitante = ['Estudiante', 'Docente', 'Administrativo'].includes(rol);
    const isTecnico = rol === 'Técnico TI';
    const isCoord = rol === 'Coordinador TI';
    const isAdmin = rol === 'Administrador';

    if (isSolicitante) {
      where.idUsuarioSolicitante = currentUser.idUsuario;
    } else if (isTecnico) {
      // Técnico puede filtrar por 'mis tickets' o ver el ámbito operativo
      if (filters?.scope === 'mis_tickets' || !isAdmin) {
        where.OR = [
          { idUsuarioSolicitante: currentUser.idUsuario },
          { asignaciones: { some: { idEspecialista: currentUser.idUsuario, activo: true } } },
        ];
      }
    }

    const safeParseInt = (val: any) => {
      if (val === undefined || val === null || val === '' || val === 'undefined' || val === 'null') return undefined;
      const num = Number(val);
      return Number.isFinite(num) && !Number.isNaN(num) ? num : undefined;
    };

    const safeParseDate = (val: any) => {
      if (!val || val === 'undefined' || val === 'null' || val === '') return undefined;
      const d = new Date(val);
      return !Number.isNaN(d.getTime()) ? d : undefined;
    };

    const parsedTipo = safeParseInt(filters?.idTipoTicket);
    if (parsedTipo !== undefined) where.idTipoTicket = parsedTipo;

    const parsedPrio = safeParseInt(filters?.idPrioridad);
    if (parsedPrio !== undefined) where.idPrioridad = parsedPrio;

    const parsedArea = safeParseInt(filters?.idArea);
    if (parsedArea !== undefined) where.idArea = parsedArea;

    const parsedSede = safeParseInt(filters?.idSede);
    if (parsedSede !== undefined) {
      where.solicitante = { idSede: parsedSede };
    }

    // 2. Filtro temporal auténtico
    const ahora = new Date();
    let fechaInicio: Date | null = null;
    let fechaInicioPeriodoAnterior: Date | null = null;
    let fechaFinPeriodoAnterior: Date | null = null;

    const periodo = filters?.periodo || 'este_mes';

    if (periodo === 'hoy') {
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      fechaInicioPeriodoAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1);
      fechaFinPeriodoAnterior = fechaInicio;
    } else if (periodo === '7dias') {
      fechaInicio = new Date(ahora.getTime() - 7 * 24 * 3600 * 1000);
      fechaInicioPeriodoAnterior = new Date(ahora.getTime() - 14 * 24 * 3600 * 1000);
      fechaFinPeriodoAnterior = fechaInicio;
    } else if (periodo === 'este_mes') {
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaInicioPeriodoAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      fechaFinPeriodoAnterior = fechaInicio;
    } else if (periodo === 'mes_anterior') {
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      const finMes = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);
      where.fechaCreacion = { gte: fechaInicio, lte: finMes };
      fechaInicioPeriodoAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
      fechaFinPeriodoAnterior = fechaInicio;
    } else if (safeParseDate(filters?.fechaInicio) && safeParseDate(filters?.fechaFin)) {
      where.fechaCreacion = {
        gte: safeParseDate(filters.fechaInicio)!,
        lte: safeParseDate(filters.fechaFin)!,
      };
    }

    if (fechaInicio && periodo !== 'mes_anterior' && !filters?.fechaInicio) {
      where.fechaCreacion = { gte: fechaInicio };
    }

    // 3. Consultas en paralelo para métricas reales del periodo
    const [
      totalTickets,
      resueltos,
      enAtencion,
      pendientes,
      cerrados,
      ticketsCriticos,
      ticketsPorTipoRaw,
      ticketsPorEstadoRaw,
      ticketsPorCategoriaRaw,
      recientes,
      resueltosConTiempo,
      ticketsConSla,
      ticketsSlaCumplidos,
      ticketsVencidosCount,
      ticketsSinAsignarCount,
      crqPendientesCount,
    ] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { ...where, idEstado: 5 } }),
      this.prisma.ticket.count({ where: { ...where, idEstado: 3 } }),
      this.prisma.ticket.count({ where: { ...where, idEstado: 1 } }),
      this.prisma.ticket.count({ where: { ...where, idEstado: 6 } }),
      // Tickets críticos abiertos (Prioridad 1 - Crítica, estados activos)
      this.prisma.ticket.count({
        where: {
          ...where,
          idPrioridad: 1,
          idEstado: { in: [1, 2, 3, 4] },
        },
      }),
      this.prisma.ticket.groupBy({
        by: ['idTipoTicket'],
        where,
        _count: { idTicket: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['idEstado'],
        where,
        _count: { idTicket: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['idCategoria'],
        where: { ...where, idCategoria: { not: null } },
        _count: { idTicket: true },
        orderBy: { _count: { idTicket: 'desc' } },
        take: 6,
      }),
      this.prisma.ticket.findMany({
        where,
        take: 8,
        orderBy: { fechaCreacion: 'desc' },
        include: {
          tipoTicket: true,
          prioridad: true,
          estado: true,
          categoria: true,
          solicitante: { select: { nombres: true, apellidos: true } },
          asignaciones: {
            where: { activo: true },
            include: { especialista: { select: { nombres: true, apellidos: true } } },
          },
        },
      }),
      // Tickets resueltos con fecha de creación y resolución para cálculo exacto de tiempo promedio
      this.prisma.ticket.findMany({
        where: {
          ...where,
          fechaResolucion: { not: null },
        },
        select: {
          fechaCreacion: true,
          fechaResolucion: true,
        },
      }),
      // SLA: Tickets con resolución evaluada
      this.prisma.ticketSla.count({
        where: {
          ticket: where,
          cumplioResolucion: { not: null },
        },
      }),
      // SLA: Tickets con resolución cumplida
      this.prisma.ticketSla.count({
        where: {
          ticket: where,
          cumplioResolucion: true,
        },
      }),
      // SLA: Tickets actualmente vencidos (abiertos con fecha límite sobrepasada o incumplimiento marcado)
      this.prisma.ticketSla.count({
        where: {
          ticket: {
            ...where,
            idEstado: { in: [1, 2, 3, 4, 8] },
          },
          OR: [
            { cumplioResolucion: false },
            { fechaLimiteResolucion: { lt: ahora } },
          ],
        },
      }),
      // Tickets sin asignación activa
      this.prisma.ticket.count({
        where: {
          ...where,
          idEstado: { in: [1, 4] },
          asignaciones: { none: { activo: true } },
        },
      }),
      // CRQs pendientes de aprobación o ejecución
      this.prisma.ticket.count({
        where: {
          idTipoTicket: 3, // CRQ
          idEstado: { in: [1, 2, 3] },
        },
      }),
    ]);

    // 4. Mapeo estructurado para gráficos
    const tipos = await this.prisma.tipoTicket.findMany();
    const ticketsPorTipo = tipos.map((t) => {
      const match = ticketsPorTipoRaw.find((r) => r.idTipoTicket === t.idTipoTicket);
      const cantidad = match ? match._count.idTicket : 0;
      const porcentaje = totalTickets > 0 ? Number(((cantidad / totalTickets) * 100).toFixed(1)) : 0;
      return {
        idTipoTicket: t.idTipoTicket,
        codigo: t.codigo,
        nombre: t.nombre,
        cantidad,
        porcentaje,
      };
    });

    const estados = await this.prisma.estado.findMany({ orderBy: { idEstado: 'asc' } });
    const ticketsPorEstado = estados.map((e) => {
      const match = ticketsPorEstadoRaw.find((r) => r.idEstado === e.idEstado);
      return {
        idEstado: e.idEstado,
        nombre: e.nombre,
        cantidad: match ? match._count.idTicket : 0,
      };
    });

    const categorias = await this.prisma.categoria.findMany();
    const categoriasMasSolicitadas = ticketsPorCategoriaRaw.map((c) => {
      const cat = categorias.find((k) => k.idCategoria === c.idCategoria);
      return {
        idCategoria: c.idCategoria,
        nombre: cat ? cat.nombre : 'General',
        cantidad: c._count.idTicket,
      };
    });

    // 5. Cálculo auténtico de variación frente a periodo anterior
    let totalAnterior = 0;
    let resueltosAnterior = 0;
    let enAtencionAnterior = 0;
    let pendientesAnterior = 0;

    if (fechaInicioPeriodoAnterior && fechaFinPeriodoAnterior) {
      const whereAnterior = {
        ...where,
        fechaCreacion: { gte: fechaInicioPeriodoAnterior, lt: fechaFinPeriodoAnterior },
      };
      [totalAnterior, resueltosAnterior, enAtencionAnterior, pendientesAnterior] = await Promise.all([
        this.prisma.ticket.count({ where: whereAnterior }),
        this.prisma.ticket.count({ where: { ...whereAnterior, idEstado: { in: [5, 6] } } }),
        this.prisma.ticket.count({ where: { ...whereAnterior, idEstado: 3 } }),
        this.prisma.ticket.count({ where: { ...whereAnterior, idEstado: 1 } }),
      ]);
    }

    const calcVar = (actual: number, anterior: number): { texto: string; tendencia: 'up' | 'down' | 'neutral' } => {
      if (!fechaInicioPeriodoAnterior) {
        return { texto: 'Sin datos previos', tendencia: 'neutral' };
      }
      if (anterior === 0) {
        return actual > 0
          ? { texto: '+100% (inicial)', tendencia: 'up' }
          : { texto: '0% (sin registros)', tendencia: 'neutral' };
      }
      const diff = ((actual - anterior) / anterior) * 100;
      const formatted = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
      return {
        texto: `${formatted} vs periodo ant.`,
        tendencia: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
      };
    };

    // 6. Cálculo real de Tiempo Promedio de Resolución (en horas)
    let tiempoPromedioHoras = 0;
    if (resueltosConTiempo.length > 0) {
      const totalMinutos = resueltosConTiempo.reduce((acc, t) => {
        const diffMs = t.fechaResolucion!.getTime() - t.fechaCreacion.getTime();
        return acc + diffMs / (1000 * 60);
      }, 0);
      tiempoPromedioHoras = Number((totalMinutos / (resueltosConTiempo.length * 60)).toFixed(1));
    }

    // 7. Cálculo real de Cumplimiento de SLA
    const porcentajeCumplimientoSla =
      ticketsConSla > 0
        ? Number(((ticketsSlaCumplidos / ticketsConSla) * 100).toFixed(1))
        : 100.0;

    // 8. Carga operativa por especialista (Para Coordinador TI y Administrador)
    let cargaEspecialistas: any[] = [];
    if (isCoord || isAdmin) {
      const especialistas = await this.prisma.usuario.findMany({
        where: {
          rol: { nombre: { in: ['Técnico TI', 'Coordinador TI'] } },
          estado: true,
        },
        select: {
          idUsuario: true,
          nombres: true,
          apellidos: true,
          asignacionesRecibidas: {
            where: {
              activo: true,
              ticket: { idEstado: { in: [1, 2, 3, 4] } },
            },
            select: { idAsignacion: true },
          },
        },
      });

      cargaEspecialistas = especialistas.map((e) => ({
        idUsuario: e.idUsuario,
        nombre: `${e.nombres} ${e.apellidos}`,
        ticketsActivos: e.asignacionesRecibidas.length,
      }));
    }

    // 9. Histórico de tickets por mes (últimos 6 meses)
    const seisMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);
    const historicoRaw = await this.prisma.ticket.findMany({
      where: {
        ...where,
        fechaCreacion: { gte: seisMesesAtras },
      },
      select: {
        fechaCreacion: true,
        idTipoTicket: true,
      },
    });

    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    const historicoMensual: Record<string, { mes: string; req: number; inc: number; crq: number; total: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      historicoMensual[key] = {
        mes: `${nombresMeses[d.getMonth()]} ${d.getFullYear()}`,
        req: 0,
        inc: 0,
        crq: 0,
        total: 0,
      };
    }

    for (const item of historicoRaw) {
      const key = `${item.fechaCreacion.getFullYear()}-${item.fechaCreacion.getMonth()}`;
      if (historicoMensual[key]) {
        historicoMensual[key].total++;
        if (item.idTipoTicket === 1) historicoMensual[key].req++;
        else if (item.idTipoTicket === 2) historicoMensual[key].inc++;
        else if (item.idTipoTicket === 3) historicoMensual[key].crq++;
      }
    }

    const ticketsPorMes = Object.values(historicoMensual);

    return {
      rol,
      kpis: {
        totalTickets: {
          valor: totalTickets,
          variacion: calcVar(totalTickets, totalAnterior).texto,
          tendencia: calcVar(totalTickets, totalAnterior).tendencia,
        },
        resueltos: {
          valor: resueltos + cerrados,
          variacion: calcVar(resueltos + cerrados, resueltosAnterior).texto,
          tendencia: calcVar(resueltos + cerrados, resueltosAnterior).tendencia,
        },
        enAtencion: {
          valor: enAtencion,
          variacion: calcVar(enAtencion, enAtencionAnterior).texto,
          tendencia: calcVar(enAtencion, enAtencionAnterior).tendencia,
        },
        pendientes: {
          valor: pendientes,
          variacion: calcVar(pendientes, pendientesAnterior).texto,
          tendencia: calcVar(pendientes, pendientesAnterior).tendencia,
        },
        ticketsVencidos: {
          valor: ticketsVencidosCount,
          descripcion: 'SLA de resolución excedido',
        },
        cumplimientoSla: {
          valor: `${porcentajeCumplimientoSla}%`,
          evaluados: ticketsConSla,
          cumplidos: ticketsSlaCumplidos,
        },
        ticketsCriticos: {
          valor: ticketsCriticos,
          descripcion: 'Prioridad 1 en curso',
        },
        tiempoPromedioResolucion: {
          valor: tiempoPromedioHoras > 0 ? `${tiempoPromedioHoras} hrs` : 'N/D',
          descripcion: 'Media de resolución efectiva',
        },
        ticketsSinAsignar: {
          valor: ticketsSinAsignarCount,
          descripcion: 'Por asignar a especialista',
        },
        crqPendientes: {
          valor: crqPendientesCount,
          descripcion: 'Cambios en evaluación/ejecución',
        },
      },
      graficos: {
        ticketsPorTipo,
        ticketsPorEstado,
        categoriasMasSolicitadas,
        ticketsPorMes,
      },
      cargaEspecialistas,
      ticketsRecientes: recientes.map((r) => {
        const especialistaActivo = r.asignaciones?.[0]?.especialista;
        return {
          idTicket: r.idTicket,
          codigo: r.codigo,
          tipo: r.tipoTicket.codigo,
          asunto: r.titulo,
          categoria: r.categoria?.nombre || 'General',
          solicitante: `${r.solicitante.nombres} ${r.solicitante.apellidos}`,
          especialista: especialistaActivo
            ? `${especialistaActivo.nombres} ${especialistaActivo.apellidos}`
            : 'Sin asignar',
          prioridad: r.prioridad.nombre,
          estado: r.estado.nombre,
          idEstado: r.idEstado,
          fechaCreacion: r.fechaCreacion,
        };
      }),
    };
  }
}
