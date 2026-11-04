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
exports.CreateTicketDto = exports.CrqDetalleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CrqDetalleDto {
}
exports.CrqDetalleDto = CrqDetalleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mantenimiento Preventivo de Servidores' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "tipoTrabajo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Actualización periódica de kernel' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "motivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Parches de seguridad y reinicio de servicios' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "descripcionTecnica", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-15', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "fechaProgramada", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '22:00:00', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "horaInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '23:30:00', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "horaFinEstimada", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Medio', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "impacto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bajo', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "riesgo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CrqDetalleDto.prototype, "usuariosAfectados", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1. Notificar. 2. Backup. 3. Aplicar parches.', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "planTrabajo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Probar conectividad y servicios web.', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "planPruebas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Restaurar snapshot de máquina virtual.', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrqDetalleDto.prototype, "planReversa", void 0);
class CreateTicketDto {
}
exports.CreateTicketDto = CreateTicketDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID del tipo de ticket (1: REQ, 2: INC, 3: CRQ)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "idTipoTicket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Falla de conectividad en Laboratorio 2' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El título es requerido' }),
    (0, class_validator_1.MinLength)(5, { message: 'El título debe tener al menos 5 caracteres' }),
    (0, class_validator_1.MaxLength)(200, { message: 'El título no puede superar 200 caracteres' }),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "titulo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Los equipos de la fila central no tienen acceso a la red.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción detallada es requerida' }),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID del área responsable' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "idArea", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "idServicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "idCategoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "idSubcategoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, description: 'ID de la prioridad (1: Crítica, 2: Alta, 3: Media, 4: Baja)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "idPrioridad", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'ID de solicitante (solo para Coordinador/Admin creando a nombre de otro)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTicketDto.prototype, "idUsuarioSolicitante", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CrqDetalleDto, required: false, description: 'Datos adicionales obligatorios si el ticket es tipo CRQ' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CrqDetalleDto),
    __metadata("design:type", CrqDetalleDto)
], CreateTicketDto.prototype, "crqDetalle", void 0);
//# sourceMappingURL=create-ticket.dto.js.map