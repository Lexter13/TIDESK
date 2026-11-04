import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            idUsuario: number;
            codigo: string;
            nombres: string;
            apellidos: string;
            nombreCompleto: string;
            correo: string;
            telefono: string;
            rol: string;
            idRol: number;
            sede: string;
            area: string;
            facultad: string;
            carrera: string;
            ultimoAcceso: Date;
        };
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    me(userId: number): Promise<{
        idUsuario: number;
        codigo: string;
        nombres: string;
        apellidos: string;
        nombreCompleto: string;
        correo: string;
        telefono: string;
        estado: boolean;
        createdAt: Date;
        ultimoAcceso: Date;
        idRol: number;
        rol: string;
        rolDetalle: {
            idRol: number;
            nombre: string;
            descripcion: string;
        };
        idSede: number;
        sede: string;
        sedeDetalle: {
            idSede: number;
            nombre: string;
            direccion: string;
        };
        idArea: number;
        area: string;
        areaDetalle: {
            idArea: number;
            nombre: string;
            descripcion: string;
        };
        idFacultad: number;
        facultad: string;
        facultadDetalle: {
            idFacultad: number;
            nombre: string;
        };
        idCarrera: number;
        carrera: string;
        carreraDetalle: {
            idCarrera: number;
            nombre: string;
        };
        actividad: {
            tipoRol: "ADMINISTRADOR" | "COORDINADOR" | "TECNICO" | "SOLICITANTE";
            metricas: Record<string, any>;
            ultimosTickets: any[];
        };
    }>;
}
