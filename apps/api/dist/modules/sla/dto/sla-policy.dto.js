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
exports.UpdateSlaPolicyDto = exports.CreateSlaPolicyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSlaPolicyDto {
}
exports.CreateSlaPolicyDto = CreateSlaPolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Atención de Baja Prioridad' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la política SLA es requerido.' }),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateSlaPolicyDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4, description: 'ID de la prioridad asociada' }),
    (0, class_validator_1.IsInt)({ message: 'Debe seleccionar una prioridad válida.' }),
    __metadata("design:type", Number)
], CreateSlaPolicyDto.prototype, "idPrioridad", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, required: false, description: 'ID del tipo de ticket (opcional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSlaPolicyDto.prototype, "idTipoTicket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120, description: 'Tiempo máximo de primera respuesta en minutos' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSlaPolicyDto.prototype, "tiempoPrimeraRespuestaMin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1440, description: 'Tiempo máximo de resolución en minutos' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    __metadata("design:type", Number)
], CreateSlaPolicyDto.prototype, "tiempoResolucionMin", void 0);
class UpdateSlaPolicyDto {
}
exports.UpdateSlaPolicyDto = UpdateSlaPolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], UpdateSlaPolicyDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSlaPolicyDto.prototype, "idPrioridad", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSlaPolicyDto.prototype, "idTipoTicket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateSlaPolicyDto.prototype, "tiempoPrimeraRespuestaMin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    __metadata("design:type", Number)
], UpdateSlaPolicyDto.prototype, "tiempoResolucionMin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSlaPolicyDto.prototype, "estado", void 0);
//# sourceMappingURL=sla-policy.dto.js.map