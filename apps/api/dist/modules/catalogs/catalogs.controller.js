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
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const catalog_operations_dto_1 = require("./dto/catalog-operations.dto");
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
    async createSede(dto) {
        return this.catalogsService.createSede(dto);
    }
    async deleteSede(id, adminId, dto) {
        return this.catalogsService.deleteSede(id, adminId, dto.password);
    }
    async getAreas() {
        return this.catalogsService.getAreas();
    }
    async createArea(dto) {
        return this.catalogsService.createArea(dto);
    }
    async deleteArea(id, adminId, dto) {
        return this.catalogsService.deleteArea(id, adminId, dto.password);
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
    async createCategoria(dto) {
        return this.catalogsService.createCategoria(dto);
    }
    async deleteCategoria(id, adminId, dto) {
        return this.catalogsService.deleteCategoria(id, adminId, dto.password);
    }
    async createSubcategoria(dto) {
        return this.catalogsService.createSubcategoria(dto);
    }
    async deleteSubcategoria(id, adminId, dto) {
        return this.catalogsService.deleteSubcategoria(id, adminId, dto.password);
    }
    async getServicios(idArea) {
        return this.catalogsService.getServiciosByArea(idArea);
    }
    async createServicio(dto) {
        return this.catalogsService.createServicio(dto);
    }
    async deleteServicio(id, adminId, dto) {
        return this.catalogsService.deleteServicio(id, adminId, dto.password);
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
    (0, common_1.Post)('sedes'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar nueva sede universitaria (Solo Administrador General)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_operations_dto_1.CreateSedeDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "createSede", null);
__decorate([
    (0, common_1.Delete)('sedes/:id'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar sede universitaria con confirmación de contraseña (Solo Administrador General)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('idUsuario')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, catalog_operations_dto_1.ConfirmPasswordDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "deleteSede", null);
__decorate([
    (0, common_1.Get)('areas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar áreas de atención' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "getAreas", null);
__decorate([
    (0, common_1.Post)('areas'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nueva área de TI (Solo Administrador General)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_operations_dto_1.CreateAreaDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "createArea", null);
__decorate([
    (0, common_1.Delete)('areas/:id'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar área de TI con confirmación de contraseña (Solo Administrador General)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('idUsuario')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, catalog_operations_dto_1.ConfirmPasswordDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "deleteArea", null);
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
    (0, common_1.Post)('categorias'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar nueva categoría (Solo Administrador General)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_operations_dto_1.CreateCategoriaDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "createCategoria", null);
__decorate([
    (0, common_1.Delete)('categorias/:id'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar categoría con confirmación de contraseña (Solo Administrador General)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('idUsuario')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, catalog_operations_dto_1.ConfirmPasswordDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "deleteCategoria", null);
__decorate([
    (0, common_1.Post)('subcategorias'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar nueva subcategoría vinculada a una categoría (Solo Administrador General)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_operations_dto_1.CreateSubcategoriaDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "createSubcategoria", null);
__decorate([
    (0, common_1.Delete)('subcategorias/:id'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar subcategoría con confirmación de contraseña (Solo Administrador General)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('idUsuario')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, catalog_operations_dto_1.ConfirmPasswordDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "deleteSubcategoria", null);
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
    (0, common_1.Post)('servicios'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar nuevo servicio de TI (Solo Administrador General)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalog_operations_dto_1.CreateServicioDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "createServicio", null);
__decorate([
    (0, common_1.Delete)('servicios/:id'),
    (0, roles_decorator_1.Roles)('Administrador'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar servicio de TI con confirmación de contraseña (Solo Administrador General)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('idUsuario')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, catalog_operations_dto_1.ConfirmPasswordDto]),
    __metadata("design:returntype", Promise)
], CatalogsController.prototype, "deleteServicio", null);
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('catalogs'),
    __metadata("design:paramtypes", [catalogs_service_1.CatalogsService])
], CatalogsController);
//# sourceMappingURL=catalogs.controller.js.map