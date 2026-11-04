import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import {
  UpdateStatusDto,
  AssignTicketDto,
  CreateCommentDto,
  ResolveTicketDto,
  SubmitSurveyDto,
  ApproveCrqDto,
} from './dto/ticket-actions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Asegurar carpeta privada local para uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo ticket (REQ, INC o CRQ)' })
  @ApiResponse({ status: 201, description: 'Ticket creado con código correlativo único' })
  async create(@Body() createDto: CreateTicketDto, @CurrentUser() currentUser: any) {
    return this.ticketsService.create(createDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tickets con filtros y paginación según alcance de rol' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'idTipoTicket', required: false })
  @ApiQuery({ name: 'idEstado', required: false })
  @ApiQuery({ name: 'idPrioridad', required: false })
  @ApiQuery({ name: 'idArea', required: false })
  @ApiQuery({ name: 'idCategoria', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: any, @CurrentUser() currentUser: any) {
    return this.ticketsService.findAll(query, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de un ticket con su línea de tiempo' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: any) {
    return this.ticketsService.findOne(id, currentUser);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado del ticket (Transición ITIL)' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ticketsService.updateStatus(id, dto, currentUser);
  }

  @Post(':id/assignments')
  @ApiOperation({ summary: 'Asignar o reasignar especialista técnico (Solo Coordinador/Admin)' })
  async assignSpecialist(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTicketDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ticketsService.assignSpecialist(id, dto, currentUser);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Agregar un comentario público o interno al ticket' })
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ticketsService.addComment(id, dto, currentUser);
  }

  @Post(':id/solution')
  @ApiOperation({ summary: 'Registrar diagnóstico, solución y marcar ticket como Resuelto' })
  async resolveTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolveTicketDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ticketsService.resolveTicket(id, dto, currentUser);
  }

  @Post(':id/survey')
  @ApiOperation({ summary: 'Enviar encuesta de satisfacción (CSAT) por el solicitante' })
  async submitSurvey(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitSurveyDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ticketsService.submitSurvey(id, dto, currentUser);
  }

  @Post(':id/take')
  @ApiOperation({ summary: 'Tomar ticket directamente por especialista técnico' })
  async takeTicket(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: any) {
    return this.ticketsService.takeTicket(id, currentUser);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Cerrar formalmente el ticket resuelto (Solicitante / Coordinador)' })
  async closeTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motivo?: string },
    @CurrentUser() currentUser: any,
  ) {
    return this.ticketsService.closeTicket(id, currentUser, body?.motivo);
  }

  @Post(':id/approve-crq')
  @ApiOperation({ summary: 'Registrar voto de aprobación de cambio en comité CAB (Solo Coordinador/Admin)' })
  async approveCrq(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveCrqDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ticketsService.approveCrq(id, dto, currentUser);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `tidesk-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB máximo
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
        } else {
          cb(
            new BadRequestException(
              `Tipo de archivo no permitido: ${ext}. Formatos permitidos: JPG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX, CSV, TXT`,
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Subir evidencia o archivo adjunto a un ticket' })
  @ApiConsumes('multipart/form-data')
  async uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @CurrentUser() currentUser: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo para subir.');
    }
    return this.ticketsService.addAttachment(id, currentUser, file);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Listar archivos adjuntos de un ticket' })
  async getAttachments(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: any) {
    return this.ticketsService.getAttachments(id, currentUser);
  }

  @Get('attachments/:attachmentId/download')
  @ApiOperation({ summary: 'Descargar archivo adjunto de manera controlada' })
  async downloadAttachment(
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @CurrentUser() currentUser: any,
    @Res() res: Response,
  ) {
    const adjunto = await this.ticketsService.getAttachmentById(attachmentId, currentUser);
    const filePath = path.resolve(adjunto.rutaArchivo);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('El archivo físico no se encuentra en el servidor.');
    }

    res.download(filePath, adjunto.nombreArchivo);
  }
}
