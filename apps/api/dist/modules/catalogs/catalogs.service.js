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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const password_verifier_helper_1 = require("../../common/helpers/password-verifier.helper");
let CatalogsService = class CatalogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllCatalogs() {
        const [sedes, facultades, carreras, areas, roles, tiposTicket, prioridades, estados, categorias, subcategorias, servicios, politicasSla,] = await Promise.all([
            this.prisma.sede.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
            this.prisma.facultad.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
            this.prisma.carrera.findMany({ where: { estado: true }, include: { facultad: true }, orderBy: { nombre: 'asc' } }),
            this.prisma.area.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
            this.prisma.rol.findMany({ where: { estado: true }, orderBy: { idRol: 'asc' } }),
            this.prisma.tipoTicket.findMany({ where: { estado: true }, orderBy: { idTipoTicket: 'asc' } }),
            this.prisma.prioridad.findMany({ where: { estado: true }, orderBy: { nivel: 'asc' } }),
            this.prisma.estado.findMany({ where: { estado: true }, orderBy: { idEstado: 'asc' } }),
            this.prisma.categoria.findMany({
                where: { estado: true },
                include: { subcategorias: { where: { estado: true }, orderBy: { nombre: 'asc' } } },
                orderBy: { nombre: 'asc' },
            }),
            this.prisma.subcategoria.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
            this.prisma.servicio.findMany({ where: { estado: true }, include: { area: true }, orderBy: { nombre: 'asc' } }),
            this.prisma.politicaSla.findMany({
                where: { estado: true },
                include: { prioridad: true, tipoTicket: true },
                orderBy: [{ prioridad: { nivel: 'asc' } }, { idSla: 'asc' }],
            }),
        ]);
        return {
            sedes,
            facultades,
            carreras,
            areas,
            roles,
            tiposTicket,
            prioridades,
            estados,
            categorias,
            subcategorias,
            servicios,
            politicasSla,
        };
    }
    async getSedes() {
        return this.prisma.sede.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } });
    }
    async getAreas() {
        return this.prisma.area.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } });
    }
    async getTiposTicket() {
        return this.prisma.tipoTicket.findMany({ where: { estado: true }, orderBy: { idTipoTicket: 'asc' } });
    }
    async getPrioridades() {
        return this.prisma.prioridad.findMany({ where: { estado: true }, orderBy: { nivel: 'asc' } });
    }
    async getEstados() {
        return this.prisma.estado.findMany({ where: { estado: true }, orderBy: { idEstado: 'asc' } });
    }
    async getCategorias() {
        return this.prisma.categoria.findMany({
            where: { estado: true },
            include: { subcategorias: { where: { estado: true }, orderBy: { nombre: 'asc' } } },
            orderBy: { nombre: 'asc' },
        });
    }
    async getServiciosByArea(idArea) {
        const where = { estado: true };
        if (idArea)
            where.idArea = Number(idArea);
        return this.prisma.servicio.findMany({ where, orderBy: { nombre: 'asc' } });
    }
    async getEspecialistas(idArea) {
        const where = {
            estado: true,
            rol: { nombre: { in: ['Técnico TI', 'Coordinador TI', 'Administrador'] } },
        };
        if (idArea)
            where.idArea = Number(idArea);
        return this.prisma.usuario.findMany({
            where,
            select: {
                idUsuario: true,
                nombres: true,
                apellidos: true,
                correo: true,
                idArea: true,
                area: { select: { nombre: true } },
                rol: { select: { nombre: true } },
            },
            orderBy: { nombres: 'asc' },
        });
    }
    async createSede(dto) {
        const nombre = dto.nombre.trim();
        const existing = await this.prisma.sede.findFirst({
            where: { nombre: { equals: nombre, mode: 'insensitive' } },
        });
        if (existing) {
            if (existing.estado === false) {
                return this.prisma.sede.update({
                    where: { idSede: existing.idSede },
                    data: { estado: true, direccion: dto.direccion?.trim() || existing.direccion },
                });
            }
            throw new common_1.ConflictException(`La sede "${nombre}" ya se encuentra registrada.`);
        }
        return this.prisma.sede.create({
            data: {
                nombre,
                direccion: dto.direccion?.trim() || null,
                estado: true,
            },
        });
    }
    async deleteSede(id, adminId, password) {
        await (0, password_verifier_helper_1.verifyAdminPassword)(this.prisma, adminId, password);
        const sede = await this.prisma.sede.findUnique({
            where: { idSede: id },
            include: { _count: { select: { usuarios: true } } },
        });
        if (!sede) {
            throw new common_1.NotFoundException('La sede especificada no existe.');
        }
        if (sede._count.usuarios > 0) {
            await this.prisma.sede.update({
                where: { idSede: id },
                data: { estado: false },
            });
            return {
                deleted: false,
                deactivated: true,
                message: `La sede "${sede.nombre}" tiene ${sede._count.usuarios} usuario(s) vinculado(s). Se ha desactivado de forma segura para preservar el historial institucional.`,
            };
        }
        await this.prisma.sede.delete({ where: { idSede: id } });
        return {
            deleted: true,
            deactivated: false,
            message: `La sede "${sede.nombre}" ha sido eliminada exitosamente.`,
        };
    }
    async createArea(dto) {
        const nombre = dto.nombre.trim();
        const existing = await this.prisma.area.findFirst({
            where: { nombre: { equals: nombre, mode: 'insensitive' } },
        });
        if (existing) {
            if (existing.estado === false) {
                return this.prisma.area.update({
                    where: { idArea: existing.idArea },
                    data: { estado: true, descripcion: dto.descripcion?.trim() || existing.descripcion },
                });
            }
            throw new common_1.ConflictException(`El área "${nombre}" ya se encuentra registrada.`);
        }
        return this.prisma.area.create({
            data: {
                nombre,
                descripcion: dto.descripcion?.trim() || null,
                estado: true,
            },
        });
    }
    async deleteArea(id, adminId, password) {
        await (0, password_verifier_helper_1.verifyAdminPassword)(this.prisma, adminId, password);
        const area = await this.prisma.area.findUnique({
            where: { idArea: id },
            include: {
                _count: {
                    select: {
                        usuarios: true,
                        servicios: true,
                        tickets: true,
                    },
                },
            },
        });
        if (!area) {
            throw new common_1.NotFoundException('El área especificada no existe.');
        }
        const totalRelaciones = area._count.usuarios + area._count.servicios + area._count.tickets;
        if (totalRelaciones > 0) {
            await this.prisma.area.update({
                where: { idArea: id },
                data: { estado: false },
            });
            return {
                deleted: false,
                deactivated: true,
                message: `El área "${area.nombre}" posee registros relacionados (${area._count.tickets} tickets, ${area._count.servicios} servicios, ${area._count.usuarios} usuarios). Se ha desactivado de forma segura sin afectar el historial.`,
            };
        }
        await this.prisma.area.delete({ where: { idArea: id } });
        return {
            deleted: true,
            deactivated: false,
            message: `El área "${area.nombre}" ha sido eliminada exitosamente.`,
        };
    }
    async createCategoria(dto) {
        const nombre = dto.nombre.trim();
        const existing = await this.prisma.categoria.findFirst({
            where: { nombre: { equals: nombre, mode: 'insensitive' } },
        });
        if (existing) {
            if (existing.estado === false) {
                return this.prisma.categoria.update({
                    where: { idCategoria: existing.idCategoria },
                    data: { estado: true, descripcion: dto.descripcion?.trim() || existing.descripcion },
                });
            }
            throw new common_1.ConflictException(`La categoría "${nombre}" ya se encuentra registrada.`);
        }
        return this.prisma.categoria.create({
            data: {
                nombre,
                descripcion: dto.descripcion?.trim() || null,
                estado: true,
            },
        });
    }
    async deleteCategoria(id, adminId, password) {
        await (0, password_verifier_helper_1.verifyAdminPassword)(this.prisma, adminId, password);
        const categoria = await this.prisma.categoria.findUnique({
            where: { idCategoria: id },
            include: {
                _count: {
                    select: {
                        subcategorias: true,
                        tickets: true,
                    },
                },
            },
        });
        if (!categoria) {
            throw new common_1.NotFoundException('La categoría especificada no existe.');
        }
        if (categoria._count.tickets > 0 || categoria._count.subcategorias > 0) {
            await this.prisma.$transaction([
                this.prisma.categoria.update({
                    where: { idCategoria: id },
                    data: { estado: false },
                }),
                this.prisma.subcategoria.updateMany({
                    where: { idCategoria: id },
                    data: { estado: false },
                }),
            ]);
            return {
                deleted: false,
                deactivated: true,
                message: `La categoría "${categoria.nombre}" tiene ${categoria._count.tickets} ticket(s) y ${categoria._count.subcategorias} subcategoría(s) vinculadas. Se ha desactivado de forma segura para conservar la trazabilidad.`,
            };
        }
        await this.prisma.categoria.delete({ where: { idCategoria: id } });
        return {
            deleted: true,
            deactivated: false,
            message: `La categoría "${categoria.nombre}" ha sido eliminada exitosamente.`,
        };
    }
    async createSubcategoria(dto) {
        const categoria = await this.prisma.categoria.findUnique({
            where: { idCategoria: dto.idCategoria },
        });
        if (!categoria || !categoria.estado) {
            throw new common_1.NotFoundException('La categoría seleccionada no existe o se encuentra inactiva.');
        }
        const nombre = dto.nombre.trim();
        const existing = await this.prisma.subcategoria.findFirst({
            where: {
                idCategoria: dto.idCategoria,
                nombre: { equals: nombre, mode: 'insensitive' },
            },
        });
        if (existing) {
            if (existing.estado === false) {
                return this.prisma.subcategoria.update({
                    where: { idSubcategoria: existing.idSubcategoria },
                    data: { estado: true, descripcion: dto.descripcion?.trim() || existing.descripcion },
                });
            }
            throw new common_1.ConflictException(`La subcategoría "${nombre}" ya existe dentro de la categoría "${categoria.nombre}".`);
        }
        return this.prisma.subcategoria.create({
            data: {
                idCategoria: dto.idCategoria,
                nombre,
                descripcion: dto.descripcion?.trim() || null,
                estado: true,
            },
        });
    }
    async deleteSubcategoria(id, adminId, password) {
        await (0, password_verifier_helper_1.verifyAdminPassword)(this.prisma, adminId, password);
        const subcategoria = await this.prisma.subcategoria.findUnique({
            where: { idSubcategoria: id },
            include: { _count: { select: { tickets: true } } },
        });
        if (!subcategoria) {
            throw new common_1.NotFoundException('La subcategoría especificada no existe.');
        }
        if (subcategoria._count.tickets > 0) {
            await this.prisma.subcategoria.update({
                where: { idSubcategoria: id },
                data: { estado: false },
            });
            return {
                deleted: false,
                deactivated: true,
                message: `La subcategoría "${subcategoria.nombre}" está asociada a ${subcategoria._count.tickets} ticket(s). Se ha desactivado de forma segura sin afectar el historial.`,
            };
        }
        await this.prisma.subcategoria.delete({ where: { idSubcategoria: id } });
        return {
            deleted: true,
            deactivated: false,
            message: `La subcategoría "${subcategoria.nombre}" ha sido eliminada exitosamente.`,
        };
    }
    async createServicio(dto) {
        const area = await this.prisma.area.findUnique({
            where: { idArea: dto.idArea },
        });
        if (!area || !area.estado) {
            throw new common_1.NotFoundException('El área seleccionada no existe o se encuentra inactiva.');
        }
        const nombre = dto.nombre.trim();
        const existing = await this.prisma.servicio.findFirst({
            where: {
                idArea: dto.idArea,
                nombre: { equals: nombre, mode: 'insensitive' },
            },
        });
        if (existing) {
            if (existing.estado === false) {
                return this.prisma.servicio.update({
                    where: { idServicio: existing.idServicio },
                    data: { estado: true, descripcion: dto.descripcion?.trim() || existing.descripcion },
                    include: { area: true },
                });
            }
            throw new common_1.ConflictException(`El servicio "${nombre}" ya se encuentra registrado en el área "${area.nombre}".`);
        }
        return this.prisma.servicio.create({
            data: {
                idArea: dto.idArea,
                nombre,
                descripcion: dto.descripcion?.trim() || null,
                estado: true,
            },
            include: { area: true },
        });
    }
    async deleteServicio(id, adminId, password) {
        await (0, password_verifier_helper_1.verifyAdminPassword)(this.prisma, adminId, password);
        const servicio = await this.prisma.servicio.findUnique({
            where: { idServicio: id },
            include: { _count: { select: { tickets: true } } },
        });
        if (!servicio) {
            throw new common_1.NotFoundException('El servicio especificado no existe.');
        }
        if (servicio._count.tickets > 0) {
            await this.prisma.servicio.update({
                where: { idServicio: id },
                data: { estado: false },
            });
            return {
                deleted: false,
                deactivated: true,
                message: `El servicio "${servicio.nombre}" está vinculado a ${servicio._count.tickets} ticket(s). Se ha desactivado de forma segura para mantener el historial.`,
            };
        }
        await this.prisma.servicio.delete({ where: { idServicio: id } });
        return {
            deleted: true,
            deactivated: false,
            message: `El servicio "${servicio.nombre}" ha sido eliminado exitosamente.`,
        };
    }
};
exports.CatalogsService = CatalogsService;
exports.CatalogsService = CatalogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogsService);
//# sourceMappingURL=catalogs.service.js.map