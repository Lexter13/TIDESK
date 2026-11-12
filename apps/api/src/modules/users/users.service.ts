import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { buildUserProfile } from '../../common/helpers/profile-builder.helper';
import { verifyAdminPassword } from '../../common/helpers/password-verifier.helper';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    return buildUserProfile(this.prisma, userId);
  }

  async findAll(params?: {
    search?: string;
    idRol?: number;
    idArea?: number;
    idSede?: number;
    estado?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page ? Number(params.page) : 1;
    const limit = params?.limit ? Number(params.limit) : 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.idRol) where.idRol = Number(params.idRol);
    if (params?.idArea) where.idArea = Number(params.idArea);
    if (params?.idSede) where.idSede = Number(params.idSede);
    if (params?.estado !== undefined) where.estado = params.estado;

    if (params?.search) {
      const s = params.search;
      where.OR = [
        { nombres: { contains: s, mode: 'insensitive' } },
        { apellidos: { contains: s, mode: 'insensitive' } },
        { correo: { contains: s, mode: 'insensitive' } },
        { codigo: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          idUsuario: true,
          codigo: true,
          nombres: true,
          apellidos: true,
          correo: true,
          telefono: true,
          idRol: true,
          estado: true,
          ultimoAcceso: true,
          createdAt: true,
          rol: { select: { idRol: true, nombre: true } },
          sede: { select: { idSede: true, nombre: true } },
          area: { select: { idArea: true, nombre: true } },
          facultad: { select: { idFacultad: true, nombre: true } },
          carrera: { select: { idCarrera: true, nombre: true } },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { idUsuario: id },
      select: {
        idUsuario: true,
        codigo: true,
        nombres: true,
        apellidos: true,
        correo: true,
        telefono: true,
        idRol: true,
        idSede: true,
        idArea: true,
        idFacultad: true,
        idCarrera: true,
        estado: true,
        ultimoAcceso: true,
        createdAt: true,
        rol: true,
        sede: true,
        area: true,
        facultad: true,
        carrera: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });
    if (existingEmail) {
      throw new ConflictException(`El correo ${dto.correo} ya está registrado.`);
    }

    if (dto.codigo) {
      const existingCode = await this.prisma.usuario.findUnique({
        where: { codigo: dto.codigo },
      });
      if (existingCode) {
        throw new ConflictException(`El código ${dto.codigo} ya está asignado.`);
      }
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.usuario.create({
      data: {
        codigo: dto.codigo,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        correo: dto.correo,
        passwordHash,
        telefono: dto.telefono,
        idRol: dto.idRol,
        idSede: dto.idSede,
        idFacultad: dto.idFacultad,
        idCarrera: dto.idCarrera,
        idArea: dto.idArea,
        estado: true,
      },
      include: {
        rol: true,
        sede: true,
        area: true,
      },
    });

    return {
      idUsuario: user.idUsuario,
      codigo: user.codigo,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,
      rol: user.rol.nombre,
      estado: user.estado,
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await argon2.hash(dto.password);
      delete data.password;
    }

    const updated = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data,
      include: {
        rol: true,
        sede: true,
        area: true,
      },
    });

    return {
      idUsuario: updated.idUsuario,
      codigo: updated.codigo,
      nombres: updated.nombres,
      apellidos: updated.apellidos,
      correo: updated.correo,
      rol: updated.rol.nombre,
      estado: updated.estado,
    };
  }

  async toggleStatus(id: number) {
    const user = await this.findOne(id);
    const updated = await this.prisma.usuario.update({
      where: { idUsuario: id },
      data: { estado: !user.estado },
    });
    return {
      idUsuario: updated.idUsuario,
      estado: updated.estado,
      message: `El usuario ahora se encuentra ${updated.estado ? 'activo' : 'inactivo'}.`,
    };
  }

  async deleteUser(targetId: number, adminId: number, password: string) {
    if (targetId === adminId) {
      throw new BadRequestException(
        'Por seguridad institucional, no puede eliminar ni desactivar su propia cuenta de Administrador en sesión.',
      );
    }

    await verifyAdminPassword(this.prisma, adminId, password);

    const targetUser = await this.prisma.usuario.findUnique({
      where: { idUsuario: targetId },
      include: {
        rol: true,
        _count: {
          select: {
            ticketsSolicitados: true,
            asignacionesRecibidas: true,
            asignacionesRealizadas: true,
            comentarios: true,
            adjuntos: true,
            historial: true,
            crqAprobaciones: true,
            notificaciones: true,
            encuestas: true,
          },
        },
      },
    });

    if (!targetUser) {
      throw new NotFoundException(`El usuario con ID ${targetId} no existe.`);
    }

    const c = targetUser._count;
    const activityRecordsCount =
      c.ticketsSolicitados +
      c.asignacionesRecibidas +
      c.asignacionesRealizadas +
      c.comentarios +
      c.adjuntos +
      c.historial +
      c.crqAprobaciones +
      c.encuestas;

    if (activityRecordsCount > 0) {
      await this.prisma.usuario.update({
        where: { idUsuario: targetId },
        data: { estado: false },
      });

      return {
        idUsuario: targetId,
        deleted: false,
        deactivated: true,
        message: `El usuario ${targetUser.nombres} ${targetUser.apellidos} (${targetUser.codigo || targetUser.correo}) registra actividad histórica en el sistema (${c.ticketsSolicitados} tickets solicitados, ${c.asignacionesRecibidas} asignaciones, ${c.historial} eventos de auditoría). Por integridad referencial ITIL, su cuenta ha sido desactivada de forma segura preservando toda la trazabilidad.`,
      };
    }

    await this.prisma.$transaction([
      this.prisma.notificacion.deleteMany({ where: { idUsuario: targetId } }),
      this.prisma.usuario.delete({ where: { idUsuario: targetId } }),
    ]);

    return {
      idUsuario: targetId,
      deleted: true,
      deactivated: false,
      message: `La cuenta del usuario ${targetUser.nombres} ${targetUser.apellidos} (${targetUser.codigo || targetUser.correo}) ha sido eliminada definitivamente del sistema.`,
    };
  }
}
