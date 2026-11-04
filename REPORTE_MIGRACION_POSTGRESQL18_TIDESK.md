# REPORTE DE MIGRACIÓN, CONEXIÓN Y RESTAURACIÓN DE TIDESK CON POSTGRESQL 18 + PRISMA

## A. Entorno
- **Sistema Operativo:** Windows (x64)
- **Motor de Base de Datos:** PostgreSQL 18 (`postgresql-x64-18` ejecutándose en el servicio local de Windows)
- **Host / Puerto:** `localhost:5432`
- **Nombre de Base de Datos:** `tidesk_db` (Conservado exactamente como fue requerido)
- **Usuario:** `postgres`
- **Versión de Prisma:** `6.19.3` (`@prisma/client` y `@prisma/cli`)
- **Framework Backend:** NestJS 12 (TypeScript, Express, Fastify/Node 24)
- **Framework Frontend:** Next.js 16.4.0 (Turbopack, React 19)

---

## B. Diagnóstico Inicial
1. **Servicio PostgreSQL 18:**
   - Servicio Windows `postgresql-x64-18` encontrado en estado `Running`.
   - Binarios de PostgreSQL ubicados en `C:\Program Files\PostgreSQL\18\bin` (`psql.exe`, `pg_dump.exe`, `pg_restore.exe`).
   - Autenticación con contraseña proporcionada validada exitosamente.
2. **Base de Datos Original:**
   - La base de datos `tidesk_db` aún no existía en la nueva laptop tras la instalación en limpio de PostgreSQL 18.
3. **Migraciones / Esquema:**
   - El proyecto no contenía carpeta `prisma/migrations` de orígenes previos; utilizaba sincronización declarativa con `schema.prisma` y un script completo de inicialización / semillero (`prisma/seed.ts`).
   - En `references/Untitled.sql` se conservaba el modelo relacional DDL original de 24 tablas.
4. **Variables de Entorno:**
   - `apps/api/.env` tenía una contraseña desactualizada (`1234`).
   - Se requería actualizar a la credencial oficial proporcionada.

---

## C. Cambios Realizados
1. **Creación Segura de la Base Oficial:**
   - Se creó la base `tidesk_db` con codificación UTF-8 en el cluster local de PostgreSQL 18:
     ```sql
     CREATE DATABASE tidesk_db ENCODING 'UTF8';
     ```
2. **Configuración de Variables de Entorno (`apps/api/.env`):**
   - Actualizada la cadena de conexión segura respetando el formato solicitado:
     ```env
     DATABASE_URL="postgresql://postgres:11131204@localhost:5432/tidesk_db?schema=public"
     ```
   - No se alteraron parámetros de producción ni configuraciones externas.
3. **Validación y Sincronización Prisma:**
   - Validación sintáctica del modelo: `prisma validate` (Resultado: válido).
   - Despliegue de estructura relacional sin pérdida de datos: `prisma db push` (24 tablas y todas las claves foráneas e índices creados).
   - Generación de cliente Prisma: `prisma generate` (Cliente Prisma v6.19.3 generado satisfactoriamente).
4. **Poblado y Recuperación de Datos:**
   - Ejecución de `prisma db seed` (`prisma/seed.ts`), restaurando la estructura académica, roles institucionales, cuentas administrativas y tickets modelo.

---

## D. Base de Datos: Inventario e Integridad

### 1. Tablas Desplegadas (24 Tablas en el esquema `public`):
1. `adjuntos`
2. `areas`
3. `asignaciones`
4. `carreras`
5. `categorias`
6. `comentarios`
7. `crq_aprobaciones`
8. `crq_detalle`
9. `encuestas`
10. `estados`
11. `facultades`
12. `historial_ticket`
13. `notificaciones`
14. `politicas_sla`
15. `prioridades`
16. `roles`
17. `secuencias_tickets`
18. `sedes`
19. `servicios`
20. `subcategorias`
21. `ticket_sla`
22. `tickets`
23. `tipos_ticket`
24. `usuarios`

### 2. Conteo de Registros Activos:
| Tabla | Cantidad de Registros |
| :--- | :--- |
| `usuarios` | 6 |
| `roles` | 6 |
| `sedes` | 3 |
| `facultades` | 3 |
| `carreras` | 5 |
| `areas` | 4 |
| `tipos_ticket` | 3 |
| `prioridades` | 4 |
| `estados` | 8 |
| `categorias` | 5 |
| `subcategorias` | 5 |
| `servicios` | 3 |
| `politicas_sla` | 3 |
| `tickets` | 4 |

---

## E. Pruebas Realizadas y Evidencia Técnica

1. **Conexión PostgreSQL 18:**
   - Verificado con `psql` conectado a `tidesk_db` en el puerto 5432 con usuario `postgres`.
2. **Generación de Prisma Client:**
   - `✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client`.
3. **Backend NestJS (API):**
   - Compilación exitosa con `nest build`.
   - Inicialización completa de módulos en puerto `4000`: `PrismaModule`, `AuthModule`, `UsersModule`, `CatalogsModule`, `TicketsModule`, `DashboardModule`, `NotificationsModule`, `SlaModule`, `ReportsModule`.
   - Endpoints activos:
     - `GET http://localhost:4000/api/v1` -> `200 OK` ("Hello World!")
     - Swagger UI disponible en `http://localhost:4000/api/docs`
4. **Autenticación (JWT + Argon2):**
   - Prueba con usuario administrador (`admin@undc.edu.pe`): Generó access token JWT válido, extrayendo rol `Administrador`, sede `Sede Principal - San Vicente de Cañete` y área `Soporte Técnico y Mesa de Ayuda`.
5. **Consultas a Base de Datos (Lectura / Tickets):**
   - `GET /api/v1/tickets` (con token Bearer): Respondió con paginación, tickets existentes (`REQ-2026-0001`, `CRQ-2026-0001`, etc.), relaciones con solicitante, estados, prioridades y asignaciones sin errores SQL.
6. **Frontend (Next.js):**
   - Desplegado en `http://localhost:3000`.
   - Petición HTTP directa respondió `StatusCode: 200 OK`.

---

## F. Matriz de Resultados

| Componente | Estado | Evidencia |
| :--- | :--- | :--- |
| **Servicio PostgreSQL 18** | **Funcionando** | Conexión local activa en `localhost:5432` |
| **Base `tidesk_db`** | **Funcionando** | Base creada y verificada con 24 tablas |
| **Prisma ORM Client** | **Funcionando** | Cliente v6.19.3 sincronizado con `tidesk_db` |
| **Integridad de Datos** | **Funcionando** | Tablas institucionales y operativas pobladas |
| **Backend (NestJS API)** | **Funcionando** | Corriendo en `http://localhost:4000` con Swagger |
| **Autenticación y Seguridad** | **Funcionando** | Login exitoso y emisión de token JWT |
| **Frontend (Next.js App)** | **Funcionando** | Corriendo en `http://localhost:3000` (Status 200) |
