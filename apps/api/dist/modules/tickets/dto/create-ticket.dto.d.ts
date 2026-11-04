export declare class CrqDetalleDto {
    tipoTrabajo: string;
    motivo?: string;
    descripcionTecnica?: string;
    fechaProgramada?: string;
    horaInicio?: string;
    horaFinEstimada?: string;
    impacto?: string;
    riesgo?: string;
    usuariosAfectados?: number;
    planTrabajo?: string;
    planPruebas?: string;
    planReversa?: string;
}
export declare class CreateTicketDto {
    idTipoTicket: number;
    titulo: string;
    descripcion: string;
    idArea: number;
    idServicio?: number;
    idCategoria?: number;
    idSubcategoria?: number;
    idPrioridad: number;
    idUsuarioSolicitante?: number;
    crqDetalle?: CrqDetalleDto;
}
