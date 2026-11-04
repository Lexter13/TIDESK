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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const catalogs_service_1 = require("./catalogs.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let CatalogsController = class CatalogsController {
    constructor(catalogsService) {
        this.catalogsService = catalogsService;
    }
    async getAll() {
        return this.catalogsService.getAllCatalogs();
    }
    async getSedes() {
        return this.catalogsService.getSedes();
    }
    async getAreas() {
        return this.catalogsService.getAreas();
    }
    async getTiposTicket() {
        return this.catalogsService.getTiposTicket();
    }
    async getPrioridades() {
        return this.catalogsService.getPrioridades();
    }
    async getEstados() {
        return this.catalogsService.getEstados();
    }
    async getCategorias() {
        return this.catalogsService.getCategorias();
    }
    async getServicios(idArea) {
        return this.catalogsService.getServiciosByArea(idArea);
    }
    async getEspecialistas(idArea) {
        return this.catalogsService.getEspecialistas(idArea);
    }
};
exports.CatalogsController = CatalogsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los catálogos para carga rápida en formularios' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('sedes'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar sedes universitarias' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getSedes", null);
__decorate([
    (0, common_1.Get)('areas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar áreas de atención' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getAreas", null);
__decorate([
    (0, common_1.Get)('tipos-ticket'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar tipos de ticket (REQ, INC, CRQ)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getTiposTicket", null);
__decorate([
    (0, common_1.Get)('prioridades'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar niveles de prioridad' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getPrioridades", null);
__decorate([
    (0, common_1.Get)('estados'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar estados del flujo ITIL' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getEstados", null);
__decorate([
    (0, common_1.Get)('categorias'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar categorías con sus subcategorías' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getCategorias", null);
__decorate([
    (0, common_1.Get)('servicios'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar servicios tecnológicos' }),
    (0, swagger_1.ApiQuery)({ name: 'idArea', required: false }),
    __param(0, (0, common_1.Query)('idArea')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getServicios", null);
__decorate([
    (0, common_1.Get)('especialistas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar técnicos y coordinadores disponibles para asignación' }),
    (0, swagger_1.ApiQuery)({ name: 'idArea', required: false }),
    __param(0, (0, common_1.Query)('idArea')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getEspecialistas", null);
exports.CatalogsController = CatalogsController = __decorate([
    (0, swagger_1.ApiTags)('Catálogos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('catalogs'),
    __metadata("design:paramtypes", [catalogs_service_1.CatalogsService])
], CatalogsController);
//# sourceMappingURL=catalogs.controller.js.map