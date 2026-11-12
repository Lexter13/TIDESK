import { PrismaService } from '../../prisma/prisma.service';
import { CreateSedeDto, CreateAreaDto, CreateCategoriaDto, CreateSubcategoriaDto, CreateServicioDto } from './dto/catalog-operations.dto';
export declare class CatalogsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllCatalogs(): Promise<{
        sedes: {
            estado: boolean | null;
            idSede: number;
            createdAt: Date | null;
            nombre: string;
            direccion: string | null;
        }[];
        facultades: {
            estado: boolean | null;
            idFacultad: number;
            createdAt: Date | null;
            nombre: string;
        }[];
        carreras: ({
            facultad: {
                estado: boolean | null;
                idFacultad: number;
                createdAt: Date | null;
                nombre: string;
            };
        } & {
            estado: boolean | null;
            idFacultad: number;
            idCarrera: number;
            createdAt: Date | null;
            nombre: string;
        })[];
        areas: {
            estado: boolean | null;
            idArea: number;
            createdAt: Date | null;
            nombre: string;
            descripcion: string | null;
        }[];
        roles: {
            estado: boolean | null;
            idRol: number;
            nombre: string;
            descripcion: string | null;
        }[];
        tiposTicket: {
            estado: boolean | null;
            codigo: string;
            nombre: string;
            descripcion: string | null;
            idTipoTicket: number;
        }[];
        prioridades: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idPrioridad: number;
            nivel: number;
        }[];
        estados: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idEstado: number;
        }[];
        categorias: ({
            subcategorias: {
                estado: boolean | null;
                nombre: string;
                descripcion: string | null;
                idCategoria: number;
                idSubcategoria: number;
            }[];
        } & {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idCategoria: number;
        })[];
        subcategorias: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idCategoria: number;
            idSubcategoria: number;
        }[];
        servicios: ({
            area: {
                estado: boolean | null;
                idArea: number;
                createdAt: Date | null;
                nombre: string;
                descripcion: string | null;
            };
        } & {
            estado: boolean | null;
            idArea: number;
            nombre: string;
            descripcion: string | null;
            idServicio: number;
        })[];
        politicasSla: ({
            tipoTicket: {
                estado: boolean | null;
                codigo: string;
                nombre: string;
                descripcion: string | null;
                idTipoTicket: number;
            };
            prioridad: {
                estado: boolean | null;
                nombre: string;
                descripcion: string | null;
                idPrioridad: number;
                nivel: number;
            };
        } & {
            estado: boolean | null;
            nombre: string;
            idTipoTicket: number | null;
            idPrioridad: number;
            idSla: number;
            tiempoPrimeraRespuestaMin: number;
            tiempoResolucionMin: number;
        })[];
    }>;
    getSedes(): Promise<{
        estado: boolean | null;
        idSede: number;
        createdAt: Date | null;
        nombre: string;
        direccion: string | null;
    }[]>;
    getAreas(): Promise<{
        estado: boolean | null;
        idArea: number;
        createdAt: Date | null;
        nombre: string;
        descripcion: string | null;
    }[]>;
    getTiposTicket(): Promise<{
        estado: boolean | null;
        codigo: string;
        nombre: string;
        descripcion: string | null;
        idTipoTicket: number;
    }[]>;
    getPrioridades(): Promise<{
        estado: boolean | null;
        nombre: string;
        descripcion: string | null;
        idPrioridad: number;
        nivel: number;
    }[]>;
    getEstados(): Promise<{
        estado: boolean | null;
        nombre: string;
        descripcion: string | null;
        idEstado: number;
    }[]>;
    getCategorias(): Promise<({
        subcategorias: {
            estado: boolean | null;
            nombre: string;
            descripcion: string | null;
            idCategoria: number;
            idSubcategoria: number;
        }[];
    } & {
        estado: boolean | null;
        nombre: string;
        descripcion: string | null;
        idCategoria: number;
    })[]>;
    getServiciosByArea(idArea?: number): Promise<{
        estado: boolean | null;
        idArea: number;
        nombre: string;
        descripcion: string | null;
        idServicio: number;
    }[]>;
    getEspecialistas(idArea?: number): Promise<{
        area: {
            nombre: string;
        };
        rol: {
            nombre: string;
        };
        correo: string;
        idUsuario: number;
        nombres: string;
        apellidos: string;
        idArea: number;
    }[]>;
    createSede(dto: CreateSedeDto): Promise<{
        estado: boolean | null;
        idSede: number;
        createdAt: Date | null;
        nombre: string;
        direccion: string | null;
    }>;
    deleteSede(id: number, adminId: number, password: string): Promise<{
        deleted: boolean;
        deactivated: boolean;
        message: string;
    }>;
    createArea(dto: CreateAreaDto): Promise<{
        estado: boolean | null;
        idArea: number;
        createdAt: Date | null;
        nombre: string;
        descripcion: string | null;
    }>;
    deleteArea(id: number, adminId: number, password: string): Promise<{
        deleted: boolean;
        deactivated: boolean;
        message: string;
    }>;
    createCategoria(dto: CreateCategoriaDto): Promise<{
        estado: boolean | null;
        nombre: string;
        descripcion: string | null;
        idCategoria: number;
    }>;
    deleteCategoria(id: number, adminId: number, password: string): Promise<{
        deleted: boolean;
        deactivated: boolean;
        message: string;
    }>;
    createSubcategoria(dto: CreateSubcategoriaDto): Promise<{
        estado: boolean | null;
        nombre: string;
        descripcion: string | null;
        idCategoria: number;
        idSubcategoria: number;
    }>;
    deleteSubcategoria(id: number, adminId: number, password: string): Promise<{
        deleted: boolean;
        deactivated: boolean;
        message: string;
    }>;
    createServicio(dto: CreateServicioDto): Promise<{
        area: {
            estado: boolean | null;
            idArea: number;
            createdAt: Date | null;
            nombre: string;
            descripcion: string | null;
        };
    } & {
        estado: boolean | null;
        idArea: number;
        nombre: string;
        descripcion: string | null;
        idServicio: number;
    }>;
    deleteServicio(id: number, adminId: number, password: string): Promise<{
        deleted: boolean;
        deactivated: boolean;
        message: string;
    }>;
}
