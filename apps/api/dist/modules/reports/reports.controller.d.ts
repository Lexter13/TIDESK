import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getAnalytics(query: any): Promise<{
        total: number;
        estados: {
            nombre: string;
            cantidad: number;
        }[];
        tipos: {
            nombre: string;
            codigo: string;
            cantidad: number;
        }[];
        prioridades: {
            nombre: string;
            cantidad: number;
        }[];
        csat: {
            totalEncuestas: number;
            promedio: number;
        };
        sla: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TicketSlaGroupByOutputType, "cumplioResolucion"[]> & {
            _count: {
                idTicketSla: number;
            };
        })[];
    }>;
    exportExcel(res: Response, query: any): Promise<void>;
    exportCsv(res: Response, query: any): Promise<void>;
}
