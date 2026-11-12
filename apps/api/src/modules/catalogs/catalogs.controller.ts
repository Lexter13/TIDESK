import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateSedeDto,
  CreateAreaDto,
  CreateCategoriaDto,
  CreateSubcategoriaDto,
  CreateServicioDto,
  ConfirmPasswordDto,
} from './dto/catalog-operations.dto';

@ApiTags('Catálogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Post('sedes')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Agregar nueva sede universitaria (Solo Administrador General)' })
  async createSede(@Body() dto: CreateSedeDto) {
    return this.catalogsService.createSede(dto);
  }

  @Delete('sedes/:id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Eliminar sede universitaria con confirmación de contraseña (Solo Administrador General)' })
  async deleteSede(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('idUsuario') adminId: number,
    @Body() dto: ConfirmPasswordDto,
  ) {
    return this.catalogsService.deleteSede(id, adminId, dto.password);
  }

  @Get('areas')
  @ApiOperation({ summary: 'Listar áreas de atención' })
  async getAreas() {
    return this.catalogsService.getAreas();
  }

  @Post('areas')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Registrar nueva área de TI (Solo Administrador General)' })
  async createArea(@Body() dto: CreateAreaDto) {
    return this.catalogsService.createArea(dto);
  }

  @Delete('areas/:id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Eliminar área de TI con confirmación de contraseña (Solo Administrador General)' })
  async deleteArea(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('idUsuario') adminId: number,
    @Body() dto: ConfirmPasswordDto,
  ) {
    return this.catalogsService.deleteArea(id, adminId, dto.password);
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

  @Post('categorias')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Agregar nueva categoría (Solo Administrador General)' })
  async createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.catalogsService.createCategoria(dto);
  }

  @Delete('categorias/:id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Eliminar categoría con confirmación de contraseña (Solo Administrador General)' })
  async deleteCategoria(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('idUsuario') adminId: number,
    @Body() dto: ConfirmPasswordDto,
  ) {
    return this.catalogsService.deleteCategoria(id, adminId, dto.password);
  }

  @Post('subcategorias')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Agregar nueva subcategoría vinculada a una categoría (Solo Administrador General)' })
  async createSubcategoria(@Body() dto: CreateSubcategoriaDto) {
    return this.catalogsService.createSubcategoria(dto);
  }

  @Delete('subcategorias/:id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Eliminar subcategoría con confirmación de contraseña (Solo Administrador General)' })
  async deleteSubcategoria(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('idUsuario') adminId: number,
    @Body() dto: ConfirmPasswordDto,
  ) {
    return this.catalogsService.deleteSubcategoria(id, adminId, dto.password);
  }

  @Get('servicios')
  @ApiOperation({ summary: 'Listar servicios tecnológicos' })
  @ApiQuery({ name: 'idArea', required: false })
  async getServicios(@Query('idArea') idArea?: number) {
    return this.catalogsService.getServiciosByArea(idArea);
  }

  @Post('servicios')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Agregar nuevo servicio de TI (Solo Administrador General)' })
  async createServicio(@Body() dto: CreateServicioDto) {
    return this.catalogsService.createServicio(dto);
  }

  @Delete('servicios/:id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Eliminar servicio de TI con confirmación de contraseña (Solo Administrador General)' })
  async deleteServicio(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('idUsuario') adminId: number,
    @Body() dto: ConfirmPasswordDto,
  ) {
    return this.catalogsService.deleteServicio(id, adminId, dto.password);
  }

  @Get('especialistas')
  @ApiOperation({ summary: 'Listar técnicos y coordinadores disponibles para asignación' })
  @ApiQuery({ name: 'idArea', required: false })
  async getEspecialistas(@Query('idArea') idArea?: number) {
    return this.catalogsService.getEspecialistas(idArea);
  }
}
