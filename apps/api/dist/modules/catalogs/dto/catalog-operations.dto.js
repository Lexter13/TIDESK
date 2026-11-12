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
exports.ConfirmPasswordDto = exports.CreateServicioDto = exports.CreateSubcategoriaDto = exports.CreateCategoriaDto = exports.CreateAreaDto = exports.CreateSedeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSedeDto {
}
exports.CreateSedeDto = CreateSedeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sede San Luis - Cañete' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la sede es requerido.' }),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateSedeDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Av. Panamericana Sur Km 138, San Luis', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], CreateSedeDto.prototype, "direccion", void 0);
class CreateAreaDto {
}
exports.CreateAreaDto = CreateAreaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ciberseguridad y Auditoría TI' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del área es requerido.' }),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateAreaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Monitoreo de seguridad informática y protección de datos', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], CreateAreaDto.prototype, "descripcion", void 0);
class CreateCategoriaDto {
}
exports.CreateCategoriaDto = CreateCategoriaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Seguridad de la Información' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la categoría es requerido.' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Incidentes y requerimientos de seguridad digital', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "descripcion", void 0);
class CreateSubcategoriaDto {
}
exports.CreateSubcategoriaDto = CreateSubcategoriaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsInt)({ message: 'Debe seleccionar una categoría válida.' }),
    __metadata("design:type", Number)
], CreateSubcategoriaDto.prototype, "idCategoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sincronización de calificaciones Moodle' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la subcategoría es requerido.' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateSubcategoriaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Soporte en integración de notas del aula virtual', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], CreateSubcategoriaDto.prototype, "descripcion", void 0);
class CreateServicioDto {
}
exports.CreateServicioDto = CreateServicioDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsInt)({ message: 'Debe seleccionar un área responsable válida.' }),
    __metadata("design:type", Number)
], CreateServicioDto.prototype, "idArea", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emisión de certificados digitales institucionales' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del servicio es requerido.' }),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateServicioDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Provisión y configuración de firma digital para funcionarios', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], CreateServicioDto.prototype, "descripcion", void 0);
class ConfirmPasswordDto {
}
exports.ConfirmPasswordDto = ConfirmPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contraseña actual del Administrador General para confirmar la eliminación' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Debe ingresar su contraseña actual para confirmar la eliminación.' }),
    __metadata("design:type", String)
], ConfirmPasswordDto.prototype, "password", void 0);
//# sourceMappingURL=catalog-operations.dto.js.map