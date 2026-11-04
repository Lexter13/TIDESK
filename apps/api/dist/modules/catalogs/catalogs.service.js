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
let CatalogsService = class CatalogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllCatalogs() {
        const [sedes, facultades, carreras, areas, roles, tiposTicket, prioridades, estados, categorias, subcategorias, servicios,] = await Promise.all([
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
                include: { subcategorias: { where: { estado: true } } },
                orderBy: { nombre: 'asc' },
            }),
            this.prisma.subcategoria.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
            this.prisma.servicio.findMany({ where: { estado: true }, include: { area: true }, orderBy: { nombre: 'asc' } }),
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
            include: { subcategorias: { where: { estado: true } } },
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
};
exports.CatalogsService = CatalogsService;
exports.CatalogsService = CatalogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogsService);
//# sourceMappingURL=catalogs.service.js.map