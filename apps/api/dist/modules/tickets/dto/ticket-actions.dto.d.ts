export declare class UpdateStatusDto {
    idEstado: number;
    motivo?: string;
}
export declare class AssignTicketDto {
    idEspecialista: number;
    motivoReasignacion?: string;
}
export declare class CreateCommentDto {
    comentario: string;
    comentarioInterno?: boolean;
}
export declare class ResolveTicketDto {
    solucion: string;
}
export declare class SubmitSurveyDto {
    calificacion: number;
    comentario?: string;
}
export declare class ApproveCrqDto {
    estadoAprobacion: string;
    comentario?: string;
}
