import { PrismaService } from '../../prisma/prisma.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto/sla-policy.dto';
export declare class SlaService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    auditSlaDeadlines(): Promise<void>;
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
    getSlaMetrics(): Promise<{
        totalWithSla: number;
        fulfilled: number;
        breached: number;
        inProgress: number;
        complianceRate: number;
    }>;
}
