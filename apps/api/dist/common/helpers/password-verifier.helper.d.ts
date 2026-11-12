import { PrismaService } from '../../prisma/prisma.service';
export declare function verifyAdminPassword(prisma: PrismaService, adminUserId: number, passwordPlain: string): Promise<void>;
