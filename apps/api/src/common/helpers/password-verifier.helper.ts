import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';

export async function verifyAdminPassword(
  prisma: PrismaService,
  adminUserId: number,
  passwordPlain: string,
): Promise<void> {
  if (!passwordPlain || typeof passwordPlain !== 'string') {
    throw new UnauthorizedException('Se requiere la contraseña de confirmación del administrador.');
  }

  const admin = await prisma.usuario.findUnique({
    where: { idUsuario: adminUserId },
    include: { rol: true },
  });

  if (!admin || !admin.estado) {
    throw new UnauthorizedException('Cuenta de administrador no encontrada o inactiva.');
  }

  if (admin.rol?.nombre !== 'Administrador') {
    throw new ForbiddenException('Acceso denegado: Se requiere el rol de Administrador General.');
  }

  const isValid = await argon2.verify(admin.passwordHash, passwordPlain);
  if (!isValid) {
    throw new UnauthorizedException('La contraseña de confirmación es incorrecta.');
  }
}

