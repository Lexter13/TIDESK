import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserNotifications(userId: number): Promise<{
        items: ({
            ticket: {
                codigo: string;
                titulo: string;
            };
        } & {
            idUsuario: number;
            idTicket: number | null;
            titulo: string;
            fecha: Date;
            mensaje: string;
            leida: boolean | null;
            idNotificacion: number;
        })[];
        unreadCount: number;
    }>;
    markAsRead(id: number, userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
