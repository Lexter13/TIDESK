"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUserProfile = buildUserProfile;
const common_1 = require("@nestjs/common");
async function buildUserProfile(prisma, userId) {
    const user = await prisma.usuario.findUnique({
        where: { idUsuario: userId },
        include: {
            rol: true,
            sede: true,
            area: true,
            facultad: true,
            carrera: true,
        },
    });
    if (!user) {
        throw new common_1.NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }
    const idRol = user.idRol;
    const rolNombre = user.rol.nombre;
    const ahora = new Date();
    let tipoRol = 'SOLICITANTE';
    let metricas = {};
    let ultimosTickets = [];
    const esAdmin = idRol === 1 || rolNombre === 'Administrador' || rolNombre.toLowerCase().startsWith('administrador') || rolNombre.toLowerCase() === 'admin';
    const esCoord = idRol === 2 || rolNombre === 'Coordinador TI' || rolNombre.toLowerCase().includes('coord');
    const esTecnico = idRol === 3 || rolNombre === 'Técnico TI' || rolNombre.toLowerCase().includes('técnico') || rolNombre.toLowerCase().includes('tecnico');
    if (esAdmin) {
        tipoRol = 'ADMINISTRADOR';
        const [creados, comentarios, accionesAuditoria, asignacionesRealizadas] = await Promise.all([
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId } }),
            prisma.comentario.count({ where: { idUsuario: userId } }),
            prisma.historialTicket.count({ where: { idUsuario: userId } }),
            prisma.asignacion.count({ where: { asignadoPor: userId } }),
        ]);
        metricas = {
            ticketsCreados: creados,
            intervencionesComentarios: comentarios,
            accionesRegistradas: accionesAuditoria,
            asignacionesGestionadas: asignacionesRealizadas,
        };
        ultimosTickets = await prisma.ticket.findMany({
            where: {
                OR: [
                    { idUsuarioSolicitante: userId },
                    { comentarios: { some: { idUsuario: userId } } },
                    { historial: { some: { idUsuario: userId } } },
                ],
            },
            take: 5,
            orderBy: { fechaCreacion: 'desc' },
            select: {
                idTicket: true,
                codigo: true,
                titulo: true,
                fechaCreacion: true,
                idEstado: true,
                estado: { select: { idEstado: true, nombre: true } },
                tipoTicket: { select: { codigo: true, nombre: true } },
                prioridad: { select: { nombre: true, nivel: true } },
            },
        });
    }
    else if (esCoord) {
        tipoRol = 'COORDINADOR';
        const [asignadosPorMi, crqGestionados, comentarios, creados] = await Promise.all([
            prisma.asignacion.count({ where: { asignadoPor: userId } }),
            prisma.crqAprobacion.count({ where: { idAprobador: userId } }),
            prisma.comentario.count({ where: { idUsuario: userId } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId } }),
        ]);
        metricas = {
            asignacionesRealizadas: asignadosPorMi,
            cambiosCrqSupervisados: crqGestionados,
            intervencionesComentarios: comentarios,
            ticketsCreados: creados,
        };
        ultimosTickets = await prisma.ticket.findMany({
            where: {
                OR: [
                    { asignaciones: { some: { asignadoPor: userId } } },
                    { idUsuarioSolicitante: userId },
                ],
            },
            take: 5,
            orderBy: { fechaCreacion: 'desc' },
            select: {
                idTicket: true,
                codigo: true,
                titulo: true,
                fechaCreacion: true,
                idEstado: true,
                estado: { select: { idEstado: true, nombre: true } },
                tipoTicket: { select: { codigo: true, nombre: true } },
                prioridad: { select: { nombre: true, nivel: true } },
            },
        });
    }
    else if (esTecnico) {
        tipoRol = 'TECNICO';
        const [asignadosActivos, enAtencion, enEspera, resueltos, cerrados, creados] = await Promise.all([
            prisma.asignacion.count({ where: { idEspecialista: userId, activo: true } }),
            prisma.ticket.count({
                where: {
                    asignaciones: { some: { idEspecialista: userId, activo: true } },
                    idEstado: 3,
                },
            }),
            prisma.ticket.count({
                where: {
                    asignaciones: { some: { idEspecialista: userId, activo: true } },
                    idEstado: 4,
                },
            }),
            prisma.ticket.count({
                where: {
                    asignaciones: { some: { idEspecialista: userId } },
                    idEstado: 5,
                },
            }),
            prisma.ticket.count({
                where: {
                    asignaciones: { some: { idEspecialista: userId } },
                    idEstado: 6,
                },
            }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId } }),
        ]);
        const [vencidos, proximosVencer] = await Promise.all([
            prisma.ticket.count({
                where: {
                    asignaciones: { some: { idEspecialista: userId, activo: true } },
                    idEstado: { in: [1, 2, 3, 4] },
                    ticketSla: {
                        some: {
                            fechaLimiteResolucion: { lt: ahora },
                        },
                    },
                },
            }),
            prisma.ticket.count({
                where: {
                    asignaciones: { some: { idEspecialista: userId, activo: true } },
                    idEstado: { in: [1, 2, 3, 4] },
                    ticketSla: {
                        some: {
                            fechaLimiteResolucion: {
                                gte: ahora,
                                lte: new Date(ahora.getTime() + 24 * 60 * 60 * 1000),
                            },
                        },
                    },
                },
            }),
        ]);
        metricas = {
            asignadosActivos,
            enAtencion,
            enEspera,
            resueltos,
            cerrados,
            slaVencidos: vencidos,
            slaProximosVencer: proximosVencer,
            ticketsCreados: creados,
        };
        ultimosTickets = await prisma.ticket.findMany({
            where: {
                OR: [
                    { asignaciones: { some: { idEspecialista: userId } } },
                    { idUsuarioSolicitante: userId },
                ],
            },
            take: 5,
            orderBy: { fechaCreacion: 'desc' },
            select: {
                idTicket: true,
                codigo: true,
                titulo: true,
                fechaCreacion: true,
                idEstado: true,
                estado: { select: { idEstado: true, nombre: true } },
                tipoTicket: { select: { codigo: true, nombre: true } },
                prioridad: { select: { nombre: true, nivel: true } },
            },
        });
    }
    else {
        tipoRol = 'SOLICITANTE';
        const [total, pendientes, enAtencion, resueltos, cerrados, reqCount, incCount, crqCount] = await Promise.all([
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId, idEstado: 1 } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId, idEstado: { in: [2, 3, 4] } } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId, idEstado: 5 } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId, idEstado: 6 } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId, tipoTicket: { codigo: 'REQ' } } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId, tipoTicket: { codigo: 'INC' } } }),
            prisma.ticket.count({ where: { idUsuarioSolicitante: userId, tipoTicket: { codigo: 'CRQ' } } }),
        ]);
        metricas = {
            totalTickets: total,
            pendientes,
            enAtencion,
            resueltos,
            cerrados,
            porTipo: {
                requerimientos: reqCount,
                incidentes: incCount,
                cambios: crqCount,
            },
        };
        ultimosTickets = await prisma.ticket.findMany({
            where: { idUsuarioSolicitante: userId },
            take: 5,
            orderBy: { fechaCreacion: 'desc' },
            select: {
                idTicket: true,
                codigo: true,
                titulo: true,
                fechaCreacion: true,
                idEstado: true,
                estado: { select: { idEstado: true, nombre: true } },
                tipoTicket: { select: { codigo: true, nombre: true } },
                prioridad: { select: { nombre: true, nivel: true } },
            },
        });
    }
    return {
        idUsuario: user.idUsuario,
        codigo: user.codigo,
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombreCompleto: `${user.nombres} ${user.apellidos}`.trim(),
        correo: user.correo,
        telefono: user.telefono,
        estado: user.estado ?? true,
        createdAt: user.createdAt,
        ultimoAcceso: user.ultimoAcceso,
        idRol: user.idRol,
        rol: user.rol.nombre,
        rolDetalle: {
            idRol: user.rol.idRol,
            nombre: user.rol.nombre,
            descripcion: user.rol.descripcion,
        },
        idSede: user.idSede,
        sede: user.sede?.nombre || null,
        sedeDetalle: user.sede
            ? {
                idSede: user.sede.idSede,
                nombre: user.sede.nombre,
                direccion: user.sede.direccion,
            }
            : null,
        idArea: user.idArea,
        area: user.area?.nombre || null,
        areaDetalle: user.area
            ? {
                idArea: user.area.idArea,
                nombre: user.area.nombre,
                descripcion: user.area.descripcion,
            }
            : null,
        idFacultad: user.idFacultad,
        facultad: user.facultad?.nombre || null,
        facultadDetalle: user.facultad
            ? {
                idFacultad: user.facultad.idFacultad,
                nombre: user.facultad.nombre,
            }
            : null,
        idCarrera: user.idCarrera,
        carrera: user.carrera?.nombre || null,
        carreraDetalle: user.carrera
            ? {
                idCarrera: user.carrera.idCarrera,
                nombre: user.carrera.nombre,
            }
            : null,
        actividad: {
            tipoRol,
            metricas,
            ultimosTickets,
        },
    };
}
//# sourceMappingURL=profile-builder.helper.js.map