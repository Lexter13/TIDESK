import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notifService;
    constructor(notifService: NotificationsService);
    getMyNotifications(userId: number): Promise<{
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
