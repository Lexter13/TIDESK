import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import {
  UpdateStatusDto,
  AssignTicketDto,
  CreateCommentDto,
  ResolveTicketDto,
  SubmitSurveyDto,
  ApproveCrqDto,
} from './dto/ticket-actions.dto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private async generateSequentialCode(tipoCodigo: string, tx: any): Promise<string> {
    const anio = new Date().getFullYear();

    await tx.$executeRaw`
      INSERT INTO secuencias_tickets (tipo_ticket, anio, ultimo_numero)
      VALUES (${tipoCodigo}, ${anio}, 0)
      ON CONFLICT (tipo_ticket, anio) DO NOTHING
    `;

    const rows = await tx.$queryRaw<{ ultimo_numero: number }[]>`
      UPDATE secuencias_tickets
      SET ultimo_numero = ultimo_numero + 1
      WHERE tipo_ticket = ${tipoCodigo} AND anio = ${anio}
      RETURNING ultimo_numero
    `;

    const nextNum = rows[0]?.ultimo_numero || 1;
    return `${tipoCodigo}-${anio}-${String(nextNum).padStart(4, '0')}`;
  }

  async create(dto: CreateTicketDto, currentUser: any) {
    const tipo = await this.prisma.tipoTicket.findUnique({
      where: { idTipoTicket: dto.idTipoTicket },
    });
    if (!tipo) throw new NotFoundException('Tipo de ticket no válido.');

    if (tipo.codigo === 'CRQ') {
      const isAllowed = ['Administrador', 'Coordinador TI', 'Técnico TI'].includes(currentUser.role);
      if (!isAllowed) {
        throw new ForbiddenException('Los solicitantes no tienen permisos para crear Solicitudes de Cambio (CRQ).');
      }
      if (!dto.crqDetalle) {
        throw new BadRequestException('Los datos de crqDetalle son obligatorios para tickets de tipo CRQ.');
      }
    }

    let solicitanteId = currentUser.idUsuario;
    if (dto.idUsuarioSolicitante) {
      if (['Administrador', 'Coordinador TI'].includes(currentUser.role)) {
        solicitanteId = dto.idUsuarioSolicitante;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const codigo = await this.generateSequentialCode(tipo.codigo, tx);

      const ticket = await tx.ticket.create({
        data: {
          codigo,
          idTipoTicket: dto.idTipoTicket,
          idUsuarioSolicitante: solicitanteId,
          idArea: dto.idArea,
          idServicio: dto.idServicio,
          idCategoria: dto.idCategoria,
          idSubcategoria: dto.idSubcategoria,
          idPrioridad: dto.idPrioridad,
          idEstado: 1, // Pendiente
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          fechaCreacion: new Date(),
        },
        include: {
          tipoTicket: true,
          prioridad: true,
          estado: true,
          area: true,
          solicitante: {
            select: { idUsuario: true, nombres: true, apellidos: true, correo: true },
          },
        },
      });

      // Detalle CRQ si aplica
      if (tipo.codigo === 'CRQ' && dto.crqDetalle) {
        const crq = await tx.crqDetalle.create({
          data: {
            idTicket: ticket.idTicket,
            tipoTrabajo: dto.crqDetalle.tipoTrabajo,
            motivo: dto.crqDetalle.motivo,
            descripcionTecnica: dto.crqDetalle.descripcionTecnica,
            fechaProgramada: dto.crqDetalle.fechaProgramada ? new Date(dto.crqDetalle.fechaProgramada) : null,
            horaInicio: dto.crqDetalle.horaInicio,
            horaFinEstimada: dto.crqDetalle.horaFinEstimada,
            impacto: dto.crqDetalle.impacto?.substring(0, 50),
            riesgo: dto.crqDetalle.riesgo?.substring(0, 50),
            usuariosAfectados:
              dto.crqDetalle.usuariosAfectados !== undefined &&
              dto.crqDetalle.usuariosAfectados !== null
                ? Number(dto.crqDetalle.usuariosAfectados)
                : null,
            planTrabajo: dto.crqDetalle.planTrabajo,
            planPruebas: dto.crqDetalle.planPruebas,
            planReversa: dto.crqDetalle.planReversa,
          },
        });

        // Coordinadores asignados como aprobadores por defecto
        const coordinadores = await tx.usuario.findMany({
          where: { rol: { nombre: 'Coordinador TI' }, estado: true },
        });

        for (const coord of coordinadores) {
          await tx.crqAprobacion.create({
            data: {
              idCrq: crq.idCrq,
              idAprobador: coord.idUsuario,
              estadoAprobacion: 'PENDIENTE',
            },
          });
        }
      }

      // Registro en auditoría
      await tx.historialTicket.create({
        data: {
          idTicket: ticket.idTicket,
          idUsuario: currentUser.idUsuario,
          accion: 'Creación del Ticket',
          campoModificado: 'estado',
          valorAnterior: null,
          valorNuevo: 'Pendiente',
          fecha: new Date(),
        },
      });

      // Cálculo de SLA inicial (prioriza política específica para el tipo de ticket y, si no existe, aplica la política de esa prioridad)
      let slaPolitica = await tx.politicaSla.findFirst({
        where: {
          idPrioridad: dto.idPrioridad,
          OR: [{ idTipoTicket: dto.idTipoTicket }, { idTipoTicket: null }],
          estado: true,
        },
        orderBy: { idTipoTicket: 'asc' },
      });

      if (!slaPolitica) {
        slaPolitica = await tx.politicaSla.findFirst({
          where: {
            idPrioridad: dto.idPrioridad,
            estado: true,
          },
        });
      }

      if (slaPolitica) {
        const ahora = new Date();
        const limiteRespuesta = new Date(ahora.getTime() + slaPolitica.tiempoPrimeraRespuestaMin * 60000);
        const limiteResolucion = new Date(ahora.getTime() + slaPolitica.tiempoResolucionMin * 60000);

        await tx.ticketSla.create({
          data: {
            idTicket: ticket.idTicket,
            idSla: slaPolitica.idSla,
            fechaLimiteRespuesta: limiteRespuesta,
            fechaLimiteResolucion: limiteResolucion,
          },
        });
      }

      // Notificación a coordinadores
      const coordinadoresParaNotificar = await tx.usuario.findMany({
        where: { rol: { nombre: { in: ['Coordinador TI', 'Administrador'] } }, estado: true },
      });

      for (const admin of coordinadoresParaNotificar) {
        await tx.notificacion.create({
          data: {
            idUsuario: admin.idUsuario,
            idTicket: ticket.idTicket,
            titulo: `Nuevo ticket ${ticket.codigo}`,
            mensaje: `Se ha registrado el ticket ${ticket.codigo}: "${ticket.titulo}".`,
            fecha: new Date(),
          },
        });
      }

      // Despachar correo institucional de confirmación
      this.mailService.notifyTicketCreated(ticket).catch(() => {});

      return ticket;
    });
  }

  async findAll(params: any, currentUser: any) {
    const page = params?.page ? Math.max(1, Number(params.page)) : 1;
    const limit = params?.limit ? Math.min(100, Math.max(1, Number(params.limit))) : 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 1. Ámbito de rol base
    const isSolicitante = ['Estudiante', 'Docente', 'Administrativo'].includes(currentUser.role);
    if (isSolicitante) {
      where.idUsuarioSolicitante = currentUser.idUsuario;
    } else if (currentUser.role === 'Técnico TI') {
      if (params?.vista === 'mis_tickets' || !params?.vista) {
        where.OR = [
          { idUsuarioSolicitante: currentUser.idUsuario },
          { asignaciones: { some: { idEspecialista: currentUser.idUsuario, activo: true } } },
          { idEstado: 1 }, // Tickets pendientes en la cola
        ];
      }
    }

    // 2. Vistas Especializadas (Estilo GLPI / ServiceDesk Plus)
    const ahora = new Date();
    if (params?.vista === 'mis_tickets') {
      where.OR = [
        { idUsuarioSolicitante: currentUser.idUsuario },
        { asignaciones: { some: { idEspecialista: currentUser.idUsuario, activo: true } } },
      ];
    } else if (params?.vista === 'sin_asignar') {
      where.asignaciones = { none: { activo: true } };
      where.idEstado = { in: [1, 4] };
    } else if (params?.vista === 'vencidos') {
      where.idEstado = { in: [1, 2, 3, 4] };
      where.ticketSla = {
        some: {
          OR: [
            { cumplioResolucion: false },
            { fechaLimiteResolucion: { lt: ahora }, cumplioResolucion: null },
          ],
        },
      };
    } else if (params?.vista === 'urgentes') {
      where.idPrioridad = { in: [1, 2] };
      where.idEstado = { in: [1, 2, 3, 4] };
    }

    // 3. Filtros combinados con sanitización robusta
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

    const parsedTipo = safeParseInt(params?.idTipoTicket);
    if (parsedTipo !== undefined) where.idTipoTicket = parsedTipo;

    const parsedEstado = safeParseInt(params?.idEstado);
    if (parsedEstado !== undefined) where.idEstado = parsedEstado;

    const parsedPrioridad = safeParseInt(params?.idPrioridad);
    if (parsedPrioridad !== undefined) where.idPrioridad = parsedPrioridad;

    const parsedArea = safeParseInt(params?.idArea);
    if (parsedArea !== undefined) where.idArea = parsedArea;

    const parsedCategoria = safeParseInt(params?.idCategoria);
    if (parsedCategoria !== undefined) where.idCategoria = parsedCategoria;

    // Filtro por Técnico Especialista
    const parsedEsp = safeParseInt(params?.idEspecialista);
    if (parsedEsp !== undefined) {
      where.asignaciones = {
        some: { idEspecialista: parsedEsp, activo: true },
      };
    }

    // Filtro por Rango de Fechas
    const dDesde = safeParseDate(params?.fechaDesde);
    const dHasta = safeParseDate(params?.fechaHasta);
    if (dDesde || dHasta) {
      where.fechaCreacion = {};
      if (dDesde) where.fechaCreacion.gte = dDesde;
      if (dHasta) {
        dHasta.setHours(23, 59, 59, 999);
        where.fechaCreacion.lte = dHasta;
      }
    }

    // Búsqueda por texto (código, título, solicitante, descripción)
    if (params?.search && typeof params.search === 'string' && params.search.trim() !== '' && params.search !== 'undefined') {
      const s = params.search.trim();
      where.OR = [
        { codigo: { contains: s, mode: 'insensitive' } },
        { titulo: { contains: s, mode: 'insensitive' } },
        { descripcion: { contains: s, mode: 'insensitive' } },
        { solicitante: { nombres: { contains: s, mode: 'insensitive' } } },
        { solicitante: { apellidos: { contains: s, mode: 'insensitive' } } },
      ];
    }

    // 4. Ordenamiento configurable
    const sortField = params?.sortBy || 'fechaCreacion';
    const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: any = {};
    if (['fechaCreacion', 'codigo', 'titulo', 'idPrioridad', 'idEstado'].includes(sortField)) {
      orderBy[sortField] = sortOrder;
    } else {
      orderBy.fechaCreacion = 'desc';
    }

    const [total, items] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tipoTicket: true,
          prioridad: true,
          estado: true,
          area: true,
          categoria: true,
          subcategoria: true,
          solicitante: {
            select: { idUsuario: true, nombres: true, apellidos: true, correo: true },
          },
          asignaciones: {
            where: { activo: true },
            include: {
              especialista: {
                select: { idUsuario: true, nombres: true, apellidos: true, correo: true },
              },
            },
          },
          ticketSla: {
            include: { sla: true },
          },
        },
      }),
    ]);

    const formatted = items.map((t) => {
      const activeAsig = t.asignaciones[0];
      const activeSla = t.ticketSla[0];
      const ahoraDate = new Date();
      const estaVencido =
        activeSla &&
        activeSla.fechaLimiteResolucion &&
        activeSla.fechaLimiteResolucion < ahoraDate &&
        [1, 2, 3, 4].includes(t.idEstado);

      return {
        ...t,
        especialistaAsignado: activeAsig
          ? `${activeAsig.especialista.nombres} ${activeAsig.especialista.apellidos}`
          : 'Sin asignar',
        idEspecialistaAsignado: activeAsig ? activeAsig.especialista.idUsuario : null,
        slaVencido: Boolean(estaVencido),
        fechaLimiteResolucion: activeSla?.fechaLimiteResolucion || null,
      };
    });

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, currentUser: any) {
    const isSolicitante = ['Estudiante', 'Docente', 'Administrativo'].includes(currentUser.role);

    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: id },
      include: {
        tipoTicket: true,
        prioridad: true,
        estado: true,
        area: true,
        servicio: true,
        categoria: true,
        subcategoria: true,
        solicitante: {
          select: {
            idUsuario: true,
            codigo: true,
            nombres: true,
            apellidos: true,
            correo: true,
            telefono: true,
            sede: true,
            facultad: true,
            carrera: true,
            rol: true,
          },
        },
        asignaciones: {
          orderBy: { fechaAsignacion: 'desc' },
          include: {
            especialista: { select: { idUsuario: true, nombres: true, apellidos: true, correo: true } },
            asignador: { select: { idUsuario: true, nombres: true, apellidos: true } },
          },
        },
        comentarios: {
          where: isSolicitante ? { comentarioInterno: false } : {},
          orderBy: { createdAt: 'asc' },
          include: {
            usuario: { select: { idUsuario: true, nombres: true, apellidos: true, rol: true } },
          },
        },
        adjuntos: {
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: { select: { idUsuario: true, nombres: true, apellidos: true } },
          },
        },
        historial: {
          orderBy: { fecha: 'desc' },
          include: {
            usuario: { select: { idUsuario: true, nombres: true, apellidos: true, rol: true } },
          },
        },
        ticketSla: {
          include: { sla: true },
        },
        crqDetalle: {
          include: {
            aprobaciones: {
              include: {
                aprobador: { select: { idUsuario: true, nombres: true, apellidos: true, correo: true } },
              },
            },
          },
        },
        encuesta: true,
      },
    });

    if (!ticket) throw new NotFoundException(`Ticket con ID ${id} no encontrado.`);

    if (isSolicitante && ticket.idUsuarioSolicitante !== currentUser.idUsuario) {
      throw new ForbiddenException('No tiene permiso para consultar este ticket.');
    }

    return ticket;
  }

  async updateStatus(id: number, dto: UpdateStatusDto, currentUser: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: id },
      include: { estado: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');

    const nuevoEstado = await this.prisma.estado.findUnique({
      where: { idEstado: dto.idEstado },
    });
    if (!nuevoEstado) throw new NotFoundException('Estado especificado no existe.');

    return this.prisma.$transaction(async (tx) => {
      const dataUpdate: any = { idEstado: dto.idEstado };

      // Si pasa a 'En atención' (3) y no tiene fecha inicio
      if (dto.idEstado === 3 && !ticket.fechaInicioAtencion) {
        dataUpdate.fechaInicioAtencion = new Date();
      }

      // Si pasa a 'Cerrado' (6)
      if (dto.idEstado === 6) {
        dataUpdate.fechaCierre = new Date();
      }

      const updated = await tx.ticket.update({
        where: { idTicket: id },
        data: dataUpdate,
        include: { estado: true },
      });

      await tx.historialTicket.create({
        data: {
          idTicket: id,
          idUsuario: currentUser.idUsuario,
          accion: 'Cambio de Estado',
          campoModificado: 'estado',
          valorAnterior: ticket.estado.nombre,
          valorNuevo: nuevoEstado.nombre,
          fecha: new Date(),
        },
      });

      // Notificación al solicitante
      await tx.notificacion.create({
        data: {
          idUsuario: ticket.idUsuarioSolicitante,
          idTicket: id,
          titulo: `Actualización de Ticket ${ticket.codigo}`,
          mensaje: `El estado del ticket ha cambiado a "${nuevoEstado.nombre}". ${dto.motivo ? 'Motivo: ' + dto.motivo : ''}`,
          fecha: new Date(),
        },
      });

      return updated;
    });
  }

  async assignSpecialist(id: number, dto: AssignTicketDto, currentUser: any) {
    const isAllowed = ['Administrador', 'Coordinador TI'].includes(currentUser.role);
    if (!isAllowed) {
      throw new ForbiddenException('Solo coordinadores y administradores pueden asignar especialistas.');
    }

    const ticket = await this.prisma.ticket.findUnique({ where: { idTicket: id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');

    const especialista = await this.prisma.usuario.findUnique({
      where: { idUsuario: dto.idEspecialista },
    });
    if (!especialista) throw new NotFoundException('Especialista no encontrado.');

    return this.prisma.$transaction(async (tx) => {
      // Finalizar asignación activa previa
      await tx.asignacion.updateMany({
        where: { idTicket: id, activo: true },
        data: {
          activo: false,
          fechaFin: new Date(),
          motivoReasignacion: dto.motivoReasignacion || 'Reasignación operativa',
        },
      });

      // Crear nueva asignación activa
      const nuevaAsig = await tx.asignacion.create({
        data: {
          idTicket: id,
          idEspecialista: dto.idEspecialista,
          asignadoPor: currentUser.idUsuario,
          fechaAsignacion: new Date(),
          activo: true,
        },
      });

      // Si el ticket estaba en Pendiente (1), pasar a Asignado (2)
      const dataTicketUpdate: any = { fechaAsignacion: new Date() };
      if (ticket.idEstado === 1) {
        dataTicketUpdate.idEstado = 2; // Asignado
      }

      await tx.ticket.update({
        where: { idTicket: id },
        data: dataTicketUpdate,
      });

      await tx.historialTicket.create({
        data: {
          idTicket: id,
          idUsuario: currentUser.idUsuario,
          accion: 'Asignación de Especialista',
          campoModificado: 'especialista',
          valorAnterior: null,
          valorNuevo: `${especialista.nombres} ${especialista.apellidos}`,
          fecha: new Date(),
        },
      });

      // Notificación al especialista
      await tx.notificacion.create({
        data: {
          idUsuario: especialista.idUsuario,
          idTicket: id,
          titulo: `Ticket Asignado: ${ticket.codigo}`,
          mensaje: `Se le ha asignado el ticket ${ticket.codigo}: "${ticket.titulo}".`,
          fecha: new Date(),
        },
      });

      return nuevaAsig;
    });
  }

  async addComment(id: number, dto: CreateCommentDto, currentUser: any) {
    const isSolicitante = ['Estudiante', 'Docente', 'Administrativo'].includes(currentUser.role);
    const interno = isSolicitante ? false : Boolean(dto.comentarioInterno);

    const ticket = await this.prisma.ticket.findUnique({ where: { idTicket: id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');

    const comentario = await this.prisma.comentario.create({
      data: {
        idTicket: id,
        idUsuario: currentUser.idUsuario,
        comentario: dto.comentario,
        comentarioInterno: interno,
        createdAt: new Date(),
      },
      include: {
        usuario: { select: { idUsuario: true, nombres: true, apellidos: true, rol: true } },
      },
    });

    // Notificar a la contraparte si no es interno
    if (!interno) {
      const destinatarioId =
        currentUser.idUsuario === ticket.idUsuarioSolicitante
          ? null // Notificar al especialista asignado si existe
          : ticket.idUsuarioSolicitante;

      if (destinatarioId) {
        await this.prisma.notificacion.create({
          data: {
            idUsuario: destinatarioId,
            idTicket: id,
            titulo: `Nuevo comentario en ${ticket.codigo}`,
            mensaje: `${currentUser.nombres}: ${dto.comentario.substring(0, 100)}...`,
            fecha: new Date(),
          },
        });
      }
    }

    return comentario;
  }

  async resolveTicket(id: number, dto: ResolveTicketDto, currentUser: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: id },
      include: { estado: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');

    return this.prisma.$transaction(async (tx) => {
      const ahora = new Date();

      const updated = await tx.ticket.update({
        where: { idTicket: id },
        data: {
          idEstado: 5, // Resuelto
          solucion: dto.solucion,
          fechaResolucion: ahora,
        },
        include: { estado: true },
      });

      // Evaluar SLA de resolución
      const ticketSla = await tx.ticketSla.findFirst({ where: { idTicket: id } });
      if (ticketSla && ticketSla.fechaLimiteResolucion) {
        const cumplio = ahora <= ticketSla.fechaLimiteResolucion;
        await tx.ticketSla.update({
          where: { idTicketSla: ticketSla.idTicketSla },
          data: {
            fechaResolucionReal: ahora,
            cumplioResolucion: cumplio,
          },
        });
      }

      await tx.historialTicket.create({
        data: {
          idTicket: id,
          idUsuario: currentUser.idUsuario,
          accion: 'Resolución del Ticket',
          campoModificado: 'estado',
          valorAnterior: ticket.estado.nombre,
          valorNuevo: 'Resuelto',
          fecha: ahora,
        },
      });

      // Notificar al solicitante
      await tx.notificacion.create({
        data: {
          idUsuario: ticket.idUsuarioSolicitante,
          idTicket: id,
          titulo: `Ticket Resuelto: ${ticket.codigo}`,
          mensaje: `Su ticket ha sido resuelto. Solución: "${dto.solucion.substring(0, 120)}...". Por favor confirme y responda la breve encuesta de satisfacción.`,
          fecha: ahora,
        },
      });

      // Despachar correo institucional de ticket resuelto
      this.mailService.notifyTicketResolved({ ...ticket, solucion: dto.solucion }).catch(() => {});

      return updated;
    });
  }

  async submitSurvey(id: number, dto: SubmitSurveyDto, currentUser: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: id },
      include: { encuesta: true },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado.');
    if (ticket.idUsuarioSolicitante !== currentUser.idUsuario) {
      throw new ForbiddenException('Solo el usuario solicitante puede evaluar este ticket.');
    }
    if (![5, 6].includes(ticket.idEstado)) {
      throw new BadRequestException('El ticket debe estar resuelto o cerrado para registrar la encuesta.');
    }
    if (ticket.encuesta) {
      throw new ConflictException('Ya se ha registrado una encuesta para este ticket.');
    }

    return this.prisma.$transaction(async (tx) => {
      const encuesta = await tx.encuesta.create({
        data: {
          idTicket: id,
          idUsuario: currentUser.idUsuario,
          calificacion: dto.calificacion,
          comentario: dto.comentario,
          fecha: new Date(),
        },
      });

      // Si estaba en Resuelto (5), pasarlo a Cerrado (6)
      if (ticket.idEstado === 5) {
        await tx.ticket.update({
          where: { idTicket: id },
          data: { idEstado: 6, fechaCierre: new Date() },
        });

        await tx.historialTicket.create({
          data: {
            idTicket: id,
            idUsuario: currentUser.idUsuario,
            accion: 'Cierre del Ticket con Encuesta CSAT',
            campoModificado: 'estado',
            valorAnterior: 'Resuelto',
            valorNuevo: 'Cerrado',
            fecha: new Date(),
          },
        });
      }

      return encuesta;
    });
  }

  async approveCrq(idTicket: number, dto: ApproveCrqDto, currentUser: any) {
    const isAllowed = ['Administrador', 'Coordinador TI'].includes(currentUser.role);
    if (!isAllowed) throw new ForbiddenException('Solo coordinadores del CAB pueden registrar votos de aprobación.');

    const crq = await this.prisma.crqDetalle.findUnique({
      where: { idTicket },
      include: { aprobaciones: true, ticket: true },
    });
    if (!crq) throw new NotFoundException('Detalle de CRQ no encontrado para este ticket.');

    const aprobacion = crq.aprobaciones.find((a) => a.idAprobador === currentUser.idUsuario);
    if (!aprobacion) {
      throw new ForbiddenException('Usted no está registrado como aprobador del comité para este cambio.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAprobacion = await tx.crqAprobacion.update({
        where: { idAprobacion: aprobacion.idAprobacion },
        data: {
          estadoAprobacion: dto.estadoAprobacion,
          comentario: dto.comentario,
          fechaAprobacion: new Date(),
        },
      });

      await tx.historialTicket.create({
        data: {
          idTicket,
          idUsuario: currentUser.idUsuario,
          accion: `Voto CAB CRQ: ${dto.estadoAprobacion}`,
          campoModificado: 'crq_aprobacion',
          valorAnterior: aprobacion.estadoAprobacion,
          valorNuevo: dto.estadoAprobacion,
          fecha: new Date(),
        },
      });

      return updatedAprobacion;
    });
  }

  async takeTicket(id: number, currentUser: any) {
    const isStaff = ['Técnico TI', 'Coordinador TI', 'Administrador'].includes(currentUser.role);
    if (!isStaff) {
      throw new ForbiddenException('Solo el personal de soporte técnico puede tomar tickets.');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: id },
      include: { estado: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');

    if ([5, 6, 7, 8].includes(ticket.idEstado)) {
      throw new BadRequestException('No se puede tomar un ticket que ya ha sido resuelto, cerrado o cancelado.');
    }

    return this.prisma.$transaction(async (tx) => {
      const ahora = new Date();

      // Desactivar asignación activa previa si la hubiera
      await tx.asignacion.updateMany({
        where: { idTicket: id, activo: true },
        data: {
          activo: false,
          fechaFin: ahora,
          motivoReasignacion: `Tomado directamente por ${currentUser.nombres} ${currentUser.apellidos}`,
        },
      });

      // Crear nueva asignación activa
      const nuevaAsig = await tx.asignacion.create({
        data: {
          idTicket: id,
          idEspecialista: currentUser.idUsuario,
          asignadoPor: currentUser.idUsuario,
          fechaAsignacion: ahora,
          activo: true,
        },
      });

      // Pasar a 'En atención' (3) si estaba en Pendiente (1) o Asignado (2)
      const dataUpdate: any = { fechaAsignacion: ahora };
      if ([1, 2].includes(ticket.idEstado)) {
        dataUpdate.idEstado = 3; // En atención
        if (!ticket.fechaInicioAtencion) {
          dataUpdate.fechaInicioAtencion = ahora;
        }
      }

      await tx.ticket.update({
        where: { idTicket: id },
        data: dataUpdate,
      });

      await tx.historialTicket.create({
        data: {
          idTicket: id,
          idUsuario: currentUser.idUsuario,
          accion: 'Ticket Tomado por Especialista',
          campoModificado: 'especialista',
          valorAnterior: ticket.estado.nombre,
          valorNuevo: `${currentUser.nombres} ${currentUser.apellidos} (En atención)`,
          fecha: ahora,
        },
      });

      // Notificar al solicitante
      await tx.notificacion.create({
        data: {
          idUsuario: ticket.idUsuarioSolicitante,
          idTicket: id,
          titulo: `Atención Iniciada: ${ticket.codigo}`,
          mensaje: `El especialista ${currentUser.nombres} ${currentUser.apellidos} ha tomado su ticket y comenzado la atención.`,
          fecha: ahora,
        },
      });

      return nuevaAsig;
    });
  }

  async closeTicket(id: number, currentUser: any, motivo?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: id },
      include: { estado: true },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado.');

    const isSolicitante = currentUser.idUsuario === ticket.idUsuarioSolicitante;
    const isStaff = ['Administrador', 'Coordinador TI'].includes(currentUser.role);
    if (!isSolicitante && !isStaff) {
      throw new ForbiddenException('Solo el solicitante o coordinadores TI pueden cerrar formalmente este ticket.');
    }

    if (ticket.idEstado === 6) {
      throw new BadRequestException('El ticket ya se encuentra formalmente cerrado.');
    }

    return this.prisma.$transaction(async (tx) => {
      const ahora = new Date();

      const updated = await tx.ticket.update({
        where: { idTicket: id },
        data: {
          idEstado: 6, // Cerrado
          fechaCierre: ahora,
        },
        include: { estado: true },
      });

      await tx.historialTicket.create({
        data: {
          idTicket: id,
          idUsuario: currentUser.idUsuario,
          accion: 'Cierre Definitivo del Ticket',
          campoModificado: 'estado',
          valorAnterior: ticket.estado.nombre,
          valorNuevo: 'Cerrado',
          fecha: ahora,
        },
      });

      await tx.notificacion.create({
        data: {
          idUsuario: ticket.idUsuarioSolicitante,
          idTicket: id,
          titulo: `Ticket Cerrado: ${ticket.codigo}`,
          mensaje: `El ticket ${ticket.codigo} ha sido cerrado definitivamente.${motivo ? ' Detalle: ' + motivo : ''}`,
          fecha: ahora,
        },
      });

      return updated;
    });
  }

  async addAttachment(
    ticketId: number,
    currentUser: any,
    file: { originalname: string; filename: string; mimetype: string; size: number; path: string },
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: ticketId },
      include: { solicitante: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${ticketId} no encontrado`);
    }

    // Autorización: Administrador, Coordinador, Especialista asignado o el propio solicitante
    const esAdmin = currentUser.role === 'Administrador' || currentUser.role === 'Coordinador TI';
    const esSolicitante = ticket.idUsuarioSolicitante === currentUser.idUsuario;
    const esTecnico = currentUser.role === 'Técnico TI';

    if (!esAdmin && !esSolicitante && !esTecnico) {
      throw new ForbiddenException('No tiene permisos para adjuntar evidencias en este ticket.');
    }

    const adjunto = await this.prisma.adjunto.create({
      data: {
        idTicket: ticketId,
        idUsuario: currentUser.idUsuario,
        nombreArchivo: file.originalname,
        rutaArchivo: file.path,
        tipoArchivo: file.mimetype,
        tamanio: BigInt(file.size),
      },
      include: {
        usuario: { select: { idUsuario: true, nombres: true, apellidos: true } },
      },
    });

    // Registrar en Historial
    await this.prisma.historialTicket.create({
      data: {
        idTicket: ticketId,
        idUsuario: currentUser.idUsuario,
        accion: 'Evidencia o Archivo Adjunto Agregado',
        campoModificado: 'adjuntos',
        valorNuevo: file.originalname,
        fecha: new Date(),
      },
    });

    return {
      ...adjunto,
      tamanio: Number(adjunto.tamanio),
    };
  }

  async getAttachments(ticketId: number, currentUser: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { idTicket: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${ticketId} no encontrado`);
    }

    const items = await this.prisma.adjunto.findMany({
      where: { idTicket: ticketId },
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: { select: { idUsuario: true, nombres: true, apellidos: true } },
      },
    });

    return items.map((a) => ({
      ...a,
      tamanio: Number(a.tamanio),
    }));
  }

  async getAttachmentById(attachmentId: number, currentUser?: any) {
    const adjunto = await this.prisma.adjunto.findUnique({
      where: { idAdjunto: attachmentId },
      include: { ticket: true },
    });

    if (!adjunto) {
      throw new NotFoundException('Archivo adjunto no encontrado.');
    }

    return adjunto;
  }
}
