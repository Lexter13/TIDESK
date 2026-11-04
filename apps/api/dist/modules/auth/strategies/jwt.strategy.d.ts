import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        idUsuario: number;
        codigo: string;
        nombres: string;
        apellidos: string;
        correo: string;
        idRol: number;
        role: string;
        idSede: number;
        sede: string;
        idArea: number;
        area: string;
        idFacultad: number;
        facultad: string;
        idCarrera: number;
        carrera: string;
    }>;
}
export {};
