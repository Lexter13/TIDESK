import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(query: any, currentUser: any): Promise<{
        rol: any;
        kpis: {
            totalTickets: {
                valor: number;
                variacion: string;
                tendencia: "up" | "down" | "neutral";
            };
            resueltos: {
                valor: number;
                variacion: string;
                tendencia: "up" | "down" | "neutral";
            };
            enAtencion: {
                valor: number;
                variacion: string;
                tendencia: "up" | "down" | "neutral";
            };
            pendientes: {
                valor: number;
                variacion: string;
                tendencia: "up" | "down" | "neutral";
            };
            ticketsVencidos: {
                valor: number;
                descripcion: string;
            };
            cumplimientoSla: {
                valor: string;
                evaluados: number;
                cumplidos: number;
            };
            ticketsCriticos: {
                valor: number;
                descripcion: string;
            };
            tiempoPromedioResolucion: {
                valor: string;
                descripcion: string;
            };
            ticketsSinAsignar: {
                valor: number;
                descripcion: string;
            };
            crqPendientes: {
                valor: number;
                descripcion: string;
            };
        };
        graficos: {
            ticketsPorTipo: {
                idTipoTicket: number;
                codigo: string;
                nombre: string;
                cantidad: number;
                porcentaje: number;
            }[];
            ticketsPorEstado: {
                idEstado: number;
                nombre: string;
                cantidad: number;
            }[];
            categoriasMasSolicitadas: {
                idCategoria: number;
                nombre: string;
                cantidad: number;
            }[];
            ticketsPorMes: {
                mes: string;
                req: number;
                inc: number;
                crq: number;
                total: number;
            }[];
        };
        cargaEspecialistas: any[];
        ticketsRecientes: {
            idTicket: number;
            codigo: string;
            tipo: string;
            asunto: string;
            categoria: string;
            solicitante: string;
            especialista: string;
            prioridad: string;
            estado: string;
            idEstado: number;
            fechaCreacion: Date;
        }[];
    }>;
}
