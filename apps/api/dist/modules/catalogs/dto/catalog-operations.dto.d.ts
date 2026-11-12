export declare class CreateSedeDto {
    nombre: string;
    direccion?: string;
}
export declare class CreateAreaDto {
    nombre: string;
    descripcion?: string;
}
export declare class CreateCategoriaDto {
    nombre: string;
    descripcion?: string;
}
export declare class CreateSubcategoriaDto {
    idCategoria: number;
    nombre: string;
    descripcion?: string;
}
export declare class CreateServicioDto {
    idArea: number;
    nombre: string;
    descripcion?: string;
}
export declare class ConfirmPasswordDto {
    password: string;
}
