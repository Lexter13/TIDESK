export declare class CreateSlaPolicyDto {
    nombre: string;
    idPrioridad: number;
    idTipoTicket?: number | null;
    tiempoPrimeraRespuestaMin: number;
    tiempoResolucionMin: number;
}
export declare class UpdateSlaPolicyDto {
    nombre?: string;
    idPrioridad?: number;
    idTipoTicket?: number | null;
    tiempoPrimeraRespuestaMin?: number;
    tiempoResolucionMin?: number;
    estado?: boolean;
}
