import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfirmPasswordDto } from '../catalogs/dto/catalog-operations.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: any): Promise<{
        items: {
            sede: {
                idSede: number;
                nombre: string;
            };
            facultad: {
                idFacultad: number;
                nombre: string;
            };
            carrera: {
                idCarrera: number;
                nombre: string;
            };
            area: {
                idArea: number;
                nombre: string;
            };
            rol: {
                idRol: number;
                nombre: string;
            };
            estado: boolean;
            correo: string;
            idUsuario: number;
            codigo: string;
            nombres: string;
            apellidos: string;
            telefono: string;
            idRol: number;
            ultimoAcceso: Date;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getMyProfile(userId: number): Promise<{
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
    findOne(id: number): Promise<{
        sede: {
            estado: boolean | null;
            idSede: number;
            createdAt: Date | null;
            nombre: string;
            direccion: string | null;
        };
        facultad: {
            estado: boolean | null;
            idFacultad: number;
            createdAt: Date | null;
            nombre: string;
        };
        carrera: {
            estado: boolean | null;
            idFacultad: number;
            idCarrera: number;
            createdAt: Date | null;
            nombre: string;
        };
        area: {
            estado: boolean | null;
            idArea: number;
            createdAt: Date | null;
            nombre: string;
            descripcion: string | null;
        };
        rol: {
            estado: boolean | null;
            idRol: number;
            nombre: string;
            descripcion: string | null;
        };
        estado: boolean;
        correo: string;
        idUsuario: number;
        codigo: string;
        nombres: string;
        apellidos: string;
        telefono: string;
        idRol: number;
        idSede: number;
        idFacultad: number;
        idCarrera: number;
        idArea: number;
        ultimoAcceso: Date;
        createdAt: Date;
    }>;
    create(createDto: CreateUserDto): Promise<{
        idUsuario: number;
        codigo: string;
        nombres: string;
        apellidos: string;
        correo: string;
        rol: string;
        estado: boolean;
    }>;
    update(id: number, updateDto: UpdateUserDto): Promise<{
        idUsuario: number;
        codigo: string;
        nombres: string;
        apellidos: string;
        correo: string;
        rol: string;
        estado: boolean;
    }>;
    toggleStatus(id: number): Promise<{
        idUsuario: number;
        estado: boolean;
        message: string;
    }>;
    deleteUser(id: number, adminId: number, dto: ConfirmPasswordDto): Promise<{
        idUsuario: number;
        deleted: boolean;
        deactivated: boolean;
        message: string;
    }>;
}
