import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: number) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notificacion.findMany({
        where: { idUsuario: userId },
        take: 20,
        orderBy: { fecha: 'desc' },
        include: {
          ticket: { select: { codigo: true, titulo: true } },
        },
      }),
      this.prisma.notificacion.count({
        where: { idUsuario: userId, leida: false },
      }),
    ]);

    return {
      items,
      unreadCount,
    };
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.notificacion.updateMany({
      where: { idNotificacion: id, idUsuario: userId },
      data: { leida: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notificacion.updateMany({
      where: { idUsuario: userId, leida: false },
      data: { leida: true },
    });
  }
}
