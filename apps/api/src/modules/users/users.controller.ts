import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmPasswordDto } from '../catalogs/dto/catalog-operations.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Administrador', 'Coordinador TI', 'Técnico TI')
  @ApiOperation({ summary: 'Listar usuarios con filtros y paginación' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'idRol', required: false })
  @ApiQuery({ name: 'idArea', required: false })
  @ApiQuery({ name: 'idSede', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil institucional y actividad del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil institucional del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMyProfile(@CurrentUser('idUsuario') userId: number) {
    return this.usersService.getMyProfile(userId);
  }

  @Get(':id')
  @Roles('Administrador', 'Coordinador TI')
  @ApiOperation({ summary: 'Obtener detalle de un usuario' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('Administrador')
  @ApiOperation({ summary: 'Registrar un nuevo usuario (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  async create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  @Patch(':id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Actualizar datos de un usuario' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(id, updateDto);
  }

  @Patch(':id/toggle-status')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Activar o desactivar cuenta de usuario' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleStatus(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Eliminar cuenta de usuario con confirmación de contraseña (Solo Administrador General)' })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('idUsuario') adminId: number,
    @Body() dto: ConfirmPasswordDto,
  ) {
    return this.usersService.deleteUser(id, adminId, dto.password);
  }
}
