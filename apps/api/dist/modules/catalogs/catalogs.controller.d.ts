import { CatalogsService } from './catalogs.service';
export declare class CatalogsController {
    private readonly catalogsService;
    constructor(catalogsService: CatalogsService);
    getAll(): Promise<{
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
    getServicios(idArea?: number): Promise<{
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
}
