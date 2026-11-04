import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogsService {
  constructor(private prisma: PrismaService) {}

  async getAllCatalogs() {
    const [
      sedes,
      facultades,
      carreras,
      areas,
      roles,
      tiposTicket,
      prioridades,
      estados,
      categorias,
      subcategorias,
      servicios,
    ] = await Promise.all([
      this.prisma.sede.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.facultad.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.carrera.findMany({ where: { estado: true }, include: { facultad: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.area.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.rol.findMany({ where: { estado: true }, orderBy: { idRol: 'asc' } }),
      this.prisma.tipoTicket.findMany({ where: { estado: true }, orderBy: { idTipoTicket: 'asc' } }),
      this.prisma.prioridad.findMany({ where: { estado: true }, orderBy: { nivel: 'asc' } }),
      this.prisma.estado.findMany({ where: { estado: true }, orderBy: { idEstado: 'asc' } }),
      this.prisma.categoria.findMany({
        where: { estado: true },
        include: { subcategorias: { where: { estado: true } } },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.subcategoria.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.servicio.findMany({ where: { estado: true }, include: { area: true }, orderBy: { nombre: 'asc' } }),
    ]);

    return {
      sedes,
      facultades,
      carreras,
      areas,
      roles,
      tiposTicket,
      prioridades,
      estados,
      categorias,
      subcategorias,
      servicios,
    };
  }

  async getSedes() {
    return this.prisma.sede.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } });
  }

  async getAreas() {
    return this.prisma.area.findMany({ where: { estado: true }, orderBy: { nombre: 'asc' } });
  }

  async getTiposTicket() {
    return this.prisma.tipoTicket.findMany({ where: { estado: true }, orderBy: { idTipoTicket: 'asc' } });
  }

  async getPrioridades() {
    return this.prisma.prioridad.findMany({ where: { estado: true }, orderBy: { nivel: 'asc' } });
  }

  async getEstados() {
    return this.prisma.estado.findMany({ where: { estado: true }, orderBy: { idEstado: 'asc' } });
  }

  async getCategorias() {
    return this.prisma.categoria.findMany({
      where: { estado: true },
      include: { subcategorias: { where: { estado: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async getServiciosByArea(idArea?: number) {
    const where: any = { estado: true };
    if (idArea) where.idArea = Number(idArea);
    return this.prisma.servicio.findMany({ where, orderBy: { nombre: 'asc' } });
  }

  async getEspecialistas(idArea?: number) {
    const where: any = {
      estado: true,
      rol: { nombre: { in: ['Técnico TI', 'Coordinador TI', 'Administrador'] } },
    };
    if (idArea) where.idArea = Number(idArea);

    return this.prisma.usuario.findMany({
      where,
      select: {
        idUsuario: true,
        nombres: true,
        apellidos: true,
        correo: true,
        idArea: true,
        area: { select: { nombre: true } },
        rol: { select: { nombre: true } },
      },
      orderBy: { nombres: 'asc' },
    });
  }
}
