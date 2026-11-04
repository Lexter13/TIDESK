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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const tickets_service_1 = require("./tickets.service");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const ticket_actions_dto_1 = require("./dto/ticket-actions.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
let TicketsController = class TicketsController {
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    async create(createDto, currentUser) {
        return this.ticketsService.create(createDto, currentUser);
    }
    async findAll(query, currentUser) {
        return this.ticketsService.findAll(query, currentUser);
    }
    async findOne(id, currentUser) {
        return this.ticketsService.findOne(id, currentUser);
    }
    async updateStatus(id, dto, currentUser) {
        return this.ticketsService.updateStatus(id, dto, currentUser);
    }
    async assignSpecialist(id, dto, currentUser) {
        return this.ticketsService.assignSpecialist(id, dto, currentUser);
    }
    async addComment(id, dto, currentUser) {
        return this.ticketsService.addComment(id, dto, currentUser);
    }
    async resolveTicket(id, dto, currentUser) {
        return this.ticketsService.resolveTicket(id, dto, currentUser);
    }
    async submitSurvey(id, dto, currentUser) {
        return this.ticketsService.submitSurvey(id, dto, currentUser);
    }
    async takeTicket(id, currentUser) {
        return this.ticketsService.takeTicket(id, currentUser);
    }
    async closeTicket(id, body, currentUser) {
        return this.ticketsService.closeTicket(id, currentUser, body?.motivo);
    }
    async approveCrq(id, dto, currentUser) {
        return this.ticketsService.approveCrq(id, dto, currentUser);
    }
    async uploadAttachment(id, file, currentUser) {
        if (!file) {
            throw new common_1.BadRequestException('No se ha proporcionado ningún archivo para subir.');
        }
        return this.ticketsService.addAttachment(id, currentUser, file);
    }
    async getAttachments(id, currentUser) {
        return this.ticketsService.getAttachments(id, currentUser);
    }
    async downloadAttachment(attachmentId, currentUser, res) {
        const adjunto = await this.ticketsService.getAttachmentById(attachmentId, currentUser);
        const filePath = path.resolve(adjunto.rutaArchivo);
        if (!fs.existsSync(filePath)) {
            throw new common_1.BadRequestException('El archivo físico no se encuentra en el servidor.');
        }
        res.download(filePath, adjunto.nombreArchivo);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo ticket (REQ, INC o CRQ)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket creado con código correlativo único' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar tickets con filtros y paginación según alcance de rol' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'idTipoTicket', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'idEstado', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'idPrioridad', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'idArea', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'idCategoria', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalle completo de un ticket con su línea de tiempo' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar el estado del ticket (Transición ITIL)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ticket_actions_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar o reasignar especialista técnico (Solo Coordinador/Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ticket_actions_dto_1.AssignTicketDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "assignSpecialist", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar un comentario público o interno al ticket' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ticket_actions_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/solution'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar diagnóstico, solución y marcar ticket como Resuelto' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ticket_actions_dto_1.ResolveTicketDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "resolveTicket", null);
__decorate([
    (0, common_1.Post)(':id/survey'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar encuesta de satisfacción (CSAT) por el solicitante' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ticket_actions_dto_1.SubmitSurveyDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "submitSurvey", null);
__decorate([
    (0, common_1.Post)(':id/take'),
    (0, swagger_1.ApiOperation)({ summary: 'Tomar ticket directamente por especialista técnico' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "takeTicket", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar formalmente el ticket resuelto (Solicitante / Coordinador)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "closeTicket", null);
__decorate([
    (0, common_1.Post)(':id/approve-crq'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar voto de aprobación de cambio en comité CAB (Solo Coordinador/Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ticket_actions_dto_1.ApproveCrqDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "approveCrq", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: uploadDir,
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                cb(null, `tidesk-${uniqueSuffix}${ext}`);
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedExts = [
                '.jpg',
                '.jpeg',
                '.png',
                '.webp',
                '.pdf',
                '.doc',
                '.docx',
                '.xls',
                '.xlsx',
                '.csv',
                '.txt',
            ];
            const ext = path.extname(file.originalname).toLowerCase();
            if (allowedExts.includes(ext)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException(`Tipo de archivo no permitido: ${ext}. Formatos permitidos: JPG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX, CSV, TXT`), false);
            }
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Subir evidencia o archivo adjunto a un ticket' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "uploadAttachment", null);
__decorate([
    (0, common_1.Get)(':id/attachments'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar archivos adjuntos de un ticket' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getAttachments", null);
__decorate([
    (0, common_1.Get)('attachments/:attachmentId/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar archivo adjunto de manera controlada' }),
    __param(0, (0, common_1.Param)('attachmentId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "downloadAttachment", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tickets'),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map