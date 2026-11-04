import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { buildUserProfile } from '../../common/helpers/profile-builder.helper';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { correo, password } = loginDto;

    const user = await this.prisma.usuario.findUnique({
      where: { correo },
      include: {
        rol: true,
        sede: true,
        area: true,
        facultad: true,
        carrera: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
    }

    if (!user.estado) {
      throw new UnauthorizedException('La cuenta se encuentra inactiva. Contacte al Administrador.');
    }

    const isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
    }

    // Actualizar último acceso
    await this.prisma.usuario.update({
      where: { idUsuario: user.idUsuario },
      data: { ultimoAcceso: new Date() },
    });

    const payload = {
      sub: user.idUsuario,
      email: user.correo,
      role: user.rol.nombre,
      nombres: user.nombres,
      apellidos: user.apellidos,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        idUsuario: user.idUsuario,
        codigo: user.codigo,
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombreCompleto: `${user.nombres} ${user.apellidos}`,
        correo: user.correo,
        telefono: user.telefono,
        rol: user.rol.nombre,
        idRol: user.idRol,
        sede: user.sede?.nombre,
        area: user.area?.nombre,
        facultad: user.facultad?.nombre,
        carrera: user.carrera?.nombre,
        ultimoAcceso: user.ultimoAcceso,
      },
    };
  }

  async getProfile(userId: number) {
    try {
      return await buildUserProfile(this.prisma, userId);
    } catch {
      throw new UnauthorizedException('Usuario no encontrado.');
    }
  }
}
