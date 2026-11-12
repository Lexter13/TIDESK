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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../prisma/prisma.service");
const profile_builder_helper_1 = require("../../common/helpers/profile-builder.helper");
const password_verifier_helper_1 = require("../../common/helpers/password-verifier.helper");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(userId) {
        return (0, profile_builder_helper_1.buildUserProfile)(this.prisma, userId);
    }
    async findAll(params) {
        const page = params?.page ? Number(params.page) : 1;
        const limit = params?.limit ? Number(params.limit) : 50;
        const skip = (page - 1) * limit;
        const where = {};
        if (params?.idRol)
            where.idRol = Number(params.idRol);
        if (params?.idArea)
            where.idArea = Number(params.idArea);
        if (params?.idSede)
            where.idSede = Number(params.idSede);
        if (params?.estado !== undefined)
            where.estado = params.estado;
        if (params?.search) {
            const s = params.search;
            where.OR = [
                { nombres: { contains: s, mode: 'insensitive' } },
                { apellidos: { contains: s, mode: 'insensitive' } },
                { correo: { contains: s, mode: 'insensitive' } },
                { codigo: { contains: s, mode: 'insensitive' } },
            ];
        }
        const [total, items] = await Promise.all([
            this.prisma.usuario.count({ where }),
            this.prisma.usuario.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    idUsuario: true,
                    codigo: true,
                    nombres: true,
                    apellidos: true,
                    correo: true,
                    telefono: true,
                    idRol: true,
                    estado: true,
                    ultimoAcceso: true,
                    createdAt: true,
                    rol: { select: { idRol: true, nombre: true } },
                    sede: { select: { idSede: true, nombre: true } },
                    area: { select: { idArea: true, nombre: true } },
                    facultad: { select: { idFacultad: true, nombre: true } },
                    carrera: { select: { idCarrera: true, nombre: true } },
                },
            }),
        ]);
        return {
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const user = await this.prisma.usuario.findUnique({
            where: { idUsuario: id },
            select: {
                idUsuario: true,
                codigo: true,
                nombres: true,
                apellidos: true,
                correo: true,
                telefono: true,
                idRol: true,
                idSede: true,
                idArea: true,
                idFacultad: true,
                idCarrera: true,
                estado: true,
                ultimoAcceso: true,
                createdAt: true,
                rol: true,
                sede: true,
                area: true,
                facultad: true,
                carrera: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
        }
        return user;
    }
    async create(dto) {
        const existingEmail = await this.prisma.usuario.findUnique({
            where: { correo: dto.correo },
        });
        if (existingEmail) {
            throw new common_1.ConflictException(`El correo ${dto.correo} ya está registrado.`);
        }
        if (dto.codigo) {
            const existingCode = await this.prisma.usuario.findUnique({
                where: { codigo: dto.codigo },
            });
            if (existingCode) {
                throw new common_1.ConflictException(`El código ${dto.codigo} ya está asignado.`);
            }
        }
        const passwordHash = await argon2.hash(dto.password);
        const user = await this.prisma.usuario.create({
            data: {
                codigo: dto.codigo,
                nombres: dto.nombres,
                apellidos: dto.apellidos,
                correo: dto.correo,
                passwordHash,
                telefono: dto.telefono,
                idRol: dto.idRol,
                idSede: dto.idSede,
                idFacultad: dto.idFacultad,
                idCarrera: dto.idCarrera,
                idArea: dto.idArea,
                estado: true,
            },
            include: {
                rol: true,
                sede: true,
                area: true,
            },
        });
        return {
            idUsuario: user.idUsuario,
            codigo: user.codigo,
            nombres: user.nombres,
            apellidos: user.apellidos,
            correo: user.correo,
            rol: user.rol.nombre,
            estado: user.estado,
        };
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = { ...dto };
        if (dto.password) {
            data.passwordHash = await argon2.hash(dto.password);
            delete data.password;
        }
        const updated = await this.prisma.usuario.update({
            where: { idUsuario: id },
            data,
            include: {
                rol: true,
                sede: true,
                area: true,
            },
        });
        return {
            idUsuario: updated.idUsuario,
            codigo: updated.codigo,
            nombres: updated.nombres,
            apellidos: updated.apellidos,
            correo: updated.correo,
            rol: updated.rol.nombre,
            estado: updated.estado,
        };
    }
    async toggleStatus(id) {
        const user = await this.findOne(id);
        const updated = await this.prisma.usuario.update({
            where: { idUsuario: id },
            data: { estado: !user.estado },
        });
        return {
            idUsuario: updated.idUsuario,
            estado: updated.estado,
            message: `El usuario ahora se encuentra ${updated.estado ? 'activo' : 'inactivo'}.`,
        };
    }
    async deleteUser(targetId, adminId, password) {
        if (targetId === adminId) {
            throw new common_1.BadRequestException('Por seguridad institucional, no puede eliminar ni desactivar su propia cuenta de Administrador en sesión.');
        }
        await (0, password_verifier_helper_1.verifyAdminPassword)(this.prisma, adminId, password);
        const targetUser = await this.prisma.usuario.findUnique({
            where: { idUsuario: targetId },
            include: {
                rol: true,
                _count: {
                    select: {
                        ticketsSolicitados: true,
                        asignacionesRecibidas: true,
                        asignacionesRealizadas: true,
                        comentarios: true,
                        adjuntos: true,
                        historial: true,
                        crqAprobaciones: true,
                        notificaciones: true,
                        encuestas: true,
                    },
                },
            },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException(`El usuario con ID ${targetId} no existe.`);
        }
        const c = targetUser._count;
        const activityRecordsCount = c.ticketsSolicitados +
            c.asignacionesRecibidas +
            c.asignacionesRealizadas +
            c.comentarios +
            c.adjuntos +
            c.historial +
            c.crqAprobaciones +
            c.encuestas;
        if (activityRecordsCount > 0) {
            await this.prisma.usuario.update({
                where: { idUsuario: targetId },
                data: { estado: false },
            });
            return {
                idUsuario: targetId,
                deleted: false,
                deactivated: true,
                message: `El usuario ${targetUser.nombres} ${targetUser.apellidos} (${targetUser.codigo || targetUser.correo}) registra actividad histórica en el sistema (${c.ticketsSolicitados} tickets solicitados, ${c.asignacionesRecibidas} asignaciones, ${c.historial} eventos de auditoría). Por integridad referencial ITIL, su cuenta ha sido desactivada de forma segura preservando toda la trazabilidad.`,
            };
        }
        await this.prisma.$transaction([
            this.prisma.notificacion.deleteMany({ where: { idUsuario: targetId } }),
            this.prisma.usuario.delete({ where: { idUsuario: targetId } }),
        ]);
        return {
            idUsuario: targetId,
            deleted: true,
            deactivated: false,
            message: `La cuenta del usuario ${targetUser.nombres} ${targetUser.apellidos} (${targetUser.codigo || targetUser.correo}) ha sido eliminada definitivamente del sistema.`,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map