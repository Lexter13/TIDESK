import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto, AssignTicketDto, CreateCommentDto, ResolveTicketDto, SubmitSurveyDto, ApproveCrqDto } from './dto/ticket-actions.dto';
export declare class TicketsService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    private generateSequentialCode;
    create(dto: CreateTicketDto, currentUser: any): Promise<{
        area: {
            estado: boolean | null;
            idArea: number;
            createdAt: Date | null;
            nombre: string;
            descripcion: string | null;
        };
        tipoTicket: {
            estado: boolean | null;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            idTipoTicket: number;
        };
        prioridad: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idPrioridad: number;
            nivel: number;
        };
        estado: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idEstado: number;
        };
        solicitante: {
            correo: string;
            idUsuario: number;
            nombres: string;
            apellidos: string;
        };
    } & {
        codigo: string;
        idArea: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        descripcion: string;
        idTicket: number;
        idTipoTicket: number;
        idUsuarioSolicitante: number;
        idServicio: number | null;
        idCategoria: number | null;
        idSubcategoria: number | null;
        idPrioridad: number;
        idEstado: number;
        titulo: string;
        fechaCreacion: Date;
        fechaAsignacion: Date | null;
        fechaInicioAtencion: Date | null;
        fechaResolucion: Date | null;
        fechaCierre: Date | null;
        solucion: string | null;
    }>;
    findAll(params: any, currentUser: any): Promise<{
        items: {
            especialistaAsignado: string;
            idEspecialistaAsignado: number;
            slaVencido: boolean;
            fechaLimiteResolucion: Date;
            area: {
                estado: boolean | null;
                idArea: number;
                createdAt: Date | null;
                nombre: string;
                descripcion: string | null;
            };
            tipoTicket: {
                estado: boolean | null;
                codigo: string;
                nombre: string;
                descripcion: string | null;
                idTipoTicket: number;
            };
            prioridad: {
                estado: boolean | null;
                nombre: string;
                descripcion: string | null;
                idPrioridad: number;
                nivel: number;
            };
            estado: {
                estado: boolean | null;
                nombre: string;
                descripcion: string | null;
                idEstado: number;
            };
            categoria: {
                estado: boolean | null;
                nombre: string;
                descripcion: string | null;
                idCategoria: number;
            };
            subcategoria: {
                estado: boolean | null;
                nombre: string;
                descripcion: string | null;
                idCategoria: number;
                idSubcategoria: number;
            };
            ticketSla: ({
                sla: {
                    estado: boolean | null;
                    nombre: string;
                    idTipoTicket: number | null;
                    idPrioridad: number;
                    idSla: number;
                    tiempoPrimeraRespuestaMin: number;
                    tiempoResolucionMin: number;
                };
            } & {
                idTicket: number;
                idSla: number;
                fechaLimiteResolucion: Date | null;
                idTicketSla: number;
                fechaLimiteRespuesta: Date | null;
                fechaRespuestaReal: Date | null;
                fechaResolucionReal: Date | null;
                cumplioRespuesta: boolean | null;
                cumplioResolucion: boolean | null;
            })[];
            solicitante: {
                correo: string;
                idUsuario: number;
                nombres: string;
                apellidos: string;
            };
            asignaciones: ({
                especialista: {
                    correo: string;
                    idUsuario: number;
                    nombres: string;
                    apellidos: string;
                };
            } & {
                idTicket: number;
                fechaAsignacion: Date;
                activo: boolean | null;
                idEspecialista: number;
                motivoReasignacion: string | null;
                idAsignacion: number;
                asignadoPor: number | null;
                fechaFin: Date | null;
            })[];
            codigo: string;
            idArea: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            descripcion: string;
            idTicket: number;
            idTipoTicket: number;
            idUsuarioSolicitante: number;
            idServicio: number | null;
            idCategoria: number | null;
            idSubcategoria: number | null;
            idPrioridad: number;
            idEstado: number;
            titulo: string;
            fechaCreacion: Date;
            fechaAsignacion: Date | null;
            fechaInicioAtencion: Date | null;
            fechaResolucion: Date | null;
            fechaCierre: Date | null;
            solucion: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number, currentUser: any): Promise<{
        area: {
            estado: boolean | null;
            idArea: number;
            createdAt: Date | null;
            nombre: string;
            descripcion: string | null;
        };
        tipoTicket: {
            estado: boolean | null;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            idTipoTicket: number;
        };
        prioridad: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idPrioridad: number;
            nivel: number;
        };
        estado: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idEstado: number;
        };
        categoria: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idCategoria: number;
        };
        subcategoria: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idCategoria: number;
            idSubcategoria: number;
        };
        servicio: {
            estado: boolean | null;
            idArea: number;
            nombre: string;
            descripcion: string | null;
            idServicio: number;
        };
        ticketSla: ({
            sla: {
                estado: boolean | null;
                nombre: string;
                idTipoTicket: number | null;
                idPrioridad: number;
                idSla: number;
                tiempoPrimeraRespuestaMin: number;
                tiempoResolucionMin: number;
            };
        } & {
            idTicket: number;
            idSla: number;
            fechaLimiteResolucion: Date | null;
            idTicketSla: number;
            fechaLimiteRespuesta: Date | null;
            fechaRespuestaReal: Date | null;
            fechaResolucionReal: Date | null;
            cumplioRespuesta: boolean | null;
            cumplioResolucion: boolean | null;
        })[];
        crqDetalle: {
            aprobaciones: ({
                aprobador: {
                    correo: string;
                    idUsuario: number;
                    nombres: string;
                    apellidos: string;
                };
            } & {
                comentario: string | null;
                estadoAprobacion: string;
                idCrq: number;
                idAprobacion: number;
                idAprobador: number;
                fechaAprobacion: Date | null;
            })[];
        } & {
            createdAt: Date | null;
            updatedAt: Date | null;
            idTicket: number;
            tipoTrabajo: string;
            motivo: string | null;
            descripcionTecnica: string | null;
            fechaProgramada: Date | null;
            horaInicio: string | null;
            horaFinEstimada: string | null;
            impacto: string | null;
            riesgo: string | null;
            usuariosAfectados: number | null;
            planTrabajo: string | null;
            planPruebas: string | null;
            planReversa: string | null;
            idCrq: number;
            resultadoFinal: string | null;
        };
        encuesta: {
            comentario: string | null;
            idUsuario: number;
            idTicket: number;
            calificacion: number;
            fecha: Date | null;
            idEncuesta: number;
        };
        comentarios: ({
            usuario: {
                rol: {
                    estado: boolean | null;
                    idRol: number;
                    nombre: string;
                    descripcion: string | null;
                };
                idUsuario: number;
                nombres: string;
                apellidos: string;
            };
        } & {
            comentario: string;
            idUsuario: number;
            createdAt: Date;
            idTicket: number;
            comentarioInterno: boolean | null;
            idComentario: number;
        })[];
        adjuntos: ({
            usuario: {
                idUsuario: number;
                nombres: string;
                apellidos: string;
            };
        } & {
            idUsuario: number;
            createdAt: Date | null;
            idTicket: number;
            idAdjunto: number;
            nombreArchivo: string;
            rutaArchivo: string;
            tipoArchivo: string | null;
            tamanio: bigint | null;
        })[];
        historial: ({
            usuario: {
                rol: {
                    estado: boolean | null;
                    idRol: number;
                    nombre: string;
                    descripcion: string | null;
                };
                idUsuario: number;
                nombres: string;
                apellidos: string;
            };
        } & {
            idUsuario: number;
            idTicket: number;
            fecha: Date;
            idHistorial: number;
            accion: string;
            campoModificado: string | null;
            valorAnterior: string | null;
            valorNuevo: string | null;
        })[];
        solicitante: {
            sede: {
                estado: boolean | null;
                idSede: number;
                createdAt: Date | null;
                nombre: string;
                direccion: string | null;
            };
            facultad: {
                estado: boolean | null;
                idFacultad: number;
                createdAt: Date | null;
                nombre: string;
            };
            carrera: {
                estado: boolean | null;
                idFacultad: number;
                idCarrera: number;
                createdAt: Date | null;
                nombre: string;
            };
            rol: {
                estado: boolean | null;
                idRol: number;
                nombre: string;
                descripcion: string | null;
            };
            correo: string;
            idUsuario: number;
            codigo: string;
            nombres: string;
            apellidos: string;
            telefono: string;
        };
        asignaciones: ({
            especialista: {
                correo: string;
                idUsuario: number;
                nombres: string;
                apellidos: string;
            };
            asignador: {
                idUsuario: number;
                nombres: string;
                apellidos: string;
            };
        } & {
            idTicket: number;
            fechaAsignacion: Date;
            activo: boolean | null;
            idEspecialista: number;
            motivoReasignacion: string | null;
            idAsignacion: number;
            asignadoPor: number | null;
            fechaFin: Date | null;
        })[];
    } & {
        codigo: string;
        idArea: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        descripcion: string;
        idTicket: number;
        idTipoTicket: number;
        idUsuarioSolicitante: number;
        idServicio: number | null;
        idCategoria: number | null;
        idSubcategoria: number | null;
        idPrioridad: number;
        idEstado: number;
        titulo: string;
        fechaCreacion: Date;
        fechaAsignacion: Date | null;
        fechaInicioAtencion: Date | null;
        fechaResolucion: Date | null;
        fechaCierre: Date | null;
        solucion: string | null;
    }>;
    updateStatus(id: number, dto: UpdateStatusDto, currentUser: any): Promise<{
        estado: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idEstado: number;
        };
    } & {
        codigo: string;
        idArea: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        descripcion: string;
        idTicket: number;
        idTipoTicket: number;
        idUsuarioSolicitante: number;
        idServicio: number | null;
        idCategoria: number | null;
        idSubcategoria: number | null;
        idPrioridad: number;
        idEstado: number;
        titulo: string;
        fechaCreacion: Date;
        fechaAsignacion: Date | null;
        fechaInicioAtencion: Date | null;
        fechaResolucion: Date | null;
        fechaCierre: Date | null;
        solucion: string | null;
    }>;
    assignSpecialist(id: number, dto: AssignTicketDto, currentUser: any): Promise<{
        idTicket: number;
        fechaAsignacion: Date;
        activo: boolean | null;
        idEspecialista: number;
        motivoReasignacion: string | null;
        idAsignacion: number;
        asignadoPor: number | null;
        fechaFin: Date | null;
    }>;
    addComment(id: number, dto: CreateCommentDto, currentUser: any): Promise<{
        usuario: {
            rol: {
                estado: boolean | null;
                idRol: number;
                nombre: string;
                descripcion: string | null;
            };
            idUsuario: number;
            nombres: string;
            apellidos: string;
        };
    } & {
        comentario: string;
        idUsuario: number;
        createdAt: Date;
        idTicket: number;
        comentarioInterno: boolean | null;
        idComentario: number;
    }>;
    resolveTicket(id: number, dto: ResolveTicketDto, currentUser: any): Promise<{
        estado: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idEstado: number;
        };
    } & {
        codigo: string;
        idArea: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        descripcion: string;
        idTicket: number;
        idTipoTicket: number;
        idUsuarioSolicitante: number;
        idServicio: number | null;
        idCategoria: number | null;
        idSubcategoria: number | null;
        idPrioridad: number;
        idEstado: number;
        titulo: string;
        fechaCreacion: Date;
        fechaAsignacion: Date | null;
        fechaInicioAtencion: Date | null;
        fechaResolucion: Date | null;
        fechaCierre: Date | null;
        solucion: string | null;
    }>;
    submitSurvey(id: number, dto: SubmitSurveyDto, currentUser: any): Promise<{
        comentario: string | null;
        idUsuario: number;
        idTicket: number;
        calificacion: number;
        fecha: Date | null;
        idEncuesta: number;
    }>;
    approveCrq(idTicket: number, dto: ApproveCrqDto, currentUser: any): Promise<{
        comentario: string | null;
        estadoAprobacion: string;
        idCrq: number;
        idAprobacion: number;
        idAprobador: number;
        fechaAprobacion: Date | null;
    }>;
    takeTicket(id: number, currentUser: any): Promise<{
        idTicket: number;
        fechaAsignacion: Date;
        activo: boolean | null;
        idEspecialista: number;
        motivoReasignacion: string | null;
        idAsignacion: number;
        asignadoPor: number | null;
        fechaFin: Date | null;
    }>;
    closeTicket(id: number, currentUser: any, motivo?: string): Promise<{
        estado: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idEstado: number;
        };
    } & {
        codigo: string;
        idArea: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        descripcion: string;
        idTicket: number;
        idTipoTicket: number;
        idUsuarioSolicitante: number;
        idServicio: number | null;
        idCategoria: number | null;
        idSubcategoria: number | null;
        idPrioridad: number;
        idEstado: number;
        titulo: string;
        fechaCreacion: Date;
        fechaAsignacion: Date | null;
        fechaInicioAtencion: Date | null;
        fechaResolucion: Date | null;
        fechaCierre: Date | null;
        solucion: string | null;
    }>;
    addAttachment(ticketId: number, currentUser: any, file: {
        originalname: string;
        filename: string;
        mimetype: string;
        size: number;
        path: string;
    }): Promise<{
        tamanio: number;
        usuario: {
            idUsuario: number;
            nombres: string;
            apellidos: string;
        };
        idUsuario: number;
        createdAt: Date | null;
        idTicket: number;
        idAdjunto: number;
        nombreArchivo: string;
        rutaArchivo: string;
        tipoArchivo: string | null;
    }>;
    getAttachments(ticketId: number, currentUser: any): Promise<{
        tamanio: number;
        usuario: {
            idUsuario: number;
            nombres: string;
            apellidos: string;
        };
        idUsuario: number;
        createdAt: Date | null;
        idTicket: number;
        idAdjunto: number;
        nombreArchivo: string;
        rutaArchivo: string;
        tipoArchivo: string | null;
    }[]>;
    getAttachmentById(attachmentId: number, currentUser?: any): Promise<{
        ticket: {
            codigo: string;
            idArea: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            descripcion: string;
            idTicket: number;
            idTipoTicket: number;
            idUsuarioSolicitante: number;
            idServicio: number | null;
            idCategoria: number | null;
            idSubcategoria: number | null;
            idPrioridad: number;
            idEstado: number;
            titulo: string;
            fechaCreacion: Date;
            fechaAsignacion: Date | null;
            fechaInicioAtencion: Date | null;
            fechaResolucion: Date | null;
            fechaCierre: Date | null;
            solucion: string | null;
        };
    } & {
        idUsuario: number;
        createdAt: Date | null;
        idTicket: number;
        idAdjunto: number;
        nombreArchivo: string;
        rutaArchivo: string;
        tipoArchivo: string | null;
        tamanio: bigint | null;
    }>;
}
