// Código de salida: 0 = la tabla de usuarios está vacía (base nueva),
//                   1 = ya hay usuarios, 2 = no se pudo consultar.
// Lo usa entrypoint.sh para decidir si corre el seed inicial sin riesgo de borrar tickets reales.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.usuario
  .count()
  .then((total) => {
    console.log(`[tidesk] Usuarios en la base de datos: ${total}`);
    process.exitCode = total === 0 ? 0 : 1;
  })
  .catch((error) => {
    console.error('[tidesk] No se pudo consultar la tabla de usuarios:', error.message);
    process.exitCode = 2;
  })
  .finally(() => prisma.$disconnect());
