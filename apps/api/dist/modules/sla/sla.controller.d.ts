import { SlaService } from './sla.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto/sla-policy.dto';
export declare class SlaController {
    private readonly slaService;
    constructor(slaService: SlaService);
    getPolicies(): Promise<({
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
    })[]>;
    createPolicy(data: CreateSlaPolicyDto): Promise<{
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
    }>;
    updatePolicy(id: number, data: UpdateSlaPolicyDto): Promise<{
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
    }>;
    getMetrics(): Promise<{
        totalWithSla: number;
        fulfilled: number;
        breached: number;
        inProgress: number;
        complianceRate: number;
    }>;
}
