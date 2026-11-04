import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['tidesk_token'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tidesk_undc_jwt_secret_key_change_in_production_2026',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.usuario.findUnique({
      where: { idUsuario: payload.sub },
      include: {
        rol: true,
        sede: true,
        area: true,
        facultad: true,
        carrera: true,
      },
    });

    if (!user || !user.estado) {
      throw new UnauthorizedException('El usuario no existe o se encuentra inactivo.');
    }

    return {
      idUsuario: user.idUsuario,
      codigo: user.codigo,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,
      idRol: user.idRol,
      role: user.rol.nombre,
      idSede: user.idSede,
      sede: user.sede?.nombre,
      idArea: user.idArea,
      area: user.area?.nombre,
      idFacultad: user.idFacultad,
      facultad: user.facultad?.nombre,
      idCarrera: user.idCarrera,
      carrera: user.carrera?.nombre,
    };
  }
}
