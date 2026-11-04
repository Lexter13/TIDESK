import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Catálogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los catálogos para carga rápida en formularios' })
  async getAll() {
    return this.catalogsService.getAllCatalogs();
  }

  @Get('sedes')
  @ApiOperation({ summary: 'Listar sedes universitarias' })
  async getSedes() {
    return this.catalogsService.getSedes();
  }

  @Get('areas')
  @ApiOperation({ summary: 'Listar áreas de atención' })
  async getAreas() {
    return this.catalogsService.getAreas();
  }

  @Get('tipos-ticket')
  @ApiOperation({ summary: 'Listar tipos de ticket (REQ, INC, CRQ)' })
  async getTiposTicket() {
    return this.catalogsService.getTiposTicket();
  }

  @Get('prioridades')
  @ApiOperation({ summary: 'Listar niveles de prioridad' })
  async getPrioridades() {
    return this.catalogsService.getPrioridades();
  }

  @Get('estados')
  @ApiOperation({ summary: 'Listar estados del flujo ITIL' })
  async getEstados() {
    return this.catalogsService.getEstados();
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Listar categorías con sus subcategorías' })
  async getCategorias() {
    return this.catalogsService.getCategorias();
  }

  @Get('servicios')
  @ApiOperation({ summary: 'Listar servicios tecnológicos' })
  @ApiQuery({ name: 'idArea', required: false })
  async getServicios(@Query('idArea') idArea?: number) {
    return this.catalogsService.getServiciosByArea(idArea);
  }

  @Get('especialistas')
  @ApiOperation({ summary: 'Listar técnicos y coordinadores disponibles para asignación' })
  @ApiQuery({ name: 'idArea', required: false })
  async getEspecialistas(@Query('idArea') idArea?: number) {
    return this.catalogsService.getEspecialistas(idArea);
  }
}
