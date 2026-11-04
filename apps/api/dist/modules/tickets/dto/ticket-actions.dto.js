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
exports.ApproveCrqDto = exports.SubmitSurveyDto = exports.ResolveTicketDto = exports.CreateCommentDto = exports.AssignTicketDto = exports.UpdateStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateStatusDto {
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, description: 'ID del nuevo estado' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStatusDto.prototype, "idEstado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Se inicia atención técnica en sitio.', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "motivo", void 0);
class AssignTicketDto {
}
exports.AssignTicketDto = AssignTicketDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, description: 'ID del especialista a asignar' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AssignTicketDto.prototype, "idEspecialista", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Asignación por especialidad en redes.', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignTicketDto.prototype, "motivoReasignacion", void 0);
class CreateCommentDto {
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Se realizó reinicio del equipo y prueba de ping.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El comentario no puede estar vacío' }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "comentario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, default: false, description: 'Si es true, solo técnicos y coordinadores pueden verlo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCommentDto.prototype, "comentarioInterno", void 0);
class ResolveTicketDto {
}
exports.ResolveTicketDto = ResolveTicketDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Se reemplazó cable de red dañado y se comprobó enlace gigabit a 1000 Mbps.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La solución técnica es requerida para resolver el ticket' }),
    __metadata("design:type", String)
], ResolveTicketDto.prototype, "solucion", void 0);
class SubmitSurveyDto {
}
exports.SubmitSurveyDto = SubmitSurveyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Calificación del servicio (1 a 5 estrellas)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'La calificación mínima es 1' }),
    (0, class_validator_1.Max)(5, { message: 'La calificación máxima es 5' }),
    __metadata("design:type", Number)
], SubmitSurveyDto.prototype, "calificacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Excelente y rápida atención del equipo técnico.', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitSurveyDto.prototype, "comentario", void 0);
class ApproveCrqDto {
}
exports.ApproveCrqDto = ApproveCrqDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'APROBADO', enum: ['APROBADO', 'RECHAZADO'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveCrqDto.prototype, "estadoAprobacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ventana de mantenimiento aprobada por no coincidir con exámenes.', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveCrqDto.prototype, "comentario", void 0);
//# sourceMappingURL=ticket-actions.dto.js.map