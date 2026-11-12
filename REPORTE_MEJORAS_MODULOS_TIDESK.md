# REPORTE TÉCNICO — MEJORAS FUNCIONALES Y CORRECCIONES DE TIDESK
**Sistema Integral de Mesa de Ayuda Universitaria — Universidad Nacional de Cañete (UNDC)**  
**Fecha de auditoría e implementación:** Noviembre 2026  
**Entorno de ejecución:** Localhost (`PostgreSQL 18` — `tidesk_db`, `NestJS 11`, `Prisma 6.19.3`, `Next.js 16.2.3`, `React 19`)

---

## 1. Resumen Ejecutivo de Estado por Módulo

| Módulo / Requerimiento | Estado Final | Resumen de Verificación |
| :--- | :---: | :--- |
| **1. Configuraciones — Administración exclusiva por Administrador General** | **FUNCIONAL** | Guardas `@Roles('Administrador')` en Backend (`POST` y `DELETE`) y validación de rol en interfaz (`/configuracion`). |
| **2. Configuraciones — Sedes, Áreas TI, Categorías, Subcategorías y Servicios TI** | **FUNCIONAL** | Creación y eliminación con confirmación de contraseña actual del Administrador General, mostrar/ocultar contraseña y protección de integridad referencial (`FK`). |
| **3. SLA — Incorporación de Prioridad Baja y vinculación integral** | **FUNCIONAL** | Política SLA activa para prioridad `Baja` (`idPrioridad: 4`, `idSla: 4` — 120 min respuesta / 1440 min resolución), creación/edición de políticas y cálculo dinámico en tickets. |
| **4. Usuarios — Eliminación segura con confirmación de contraseña** | **FUNCIONAL** | Endpoint `DELETE /api/users/:id` exclusivo para `Administrador`, bloqueo de auto-eliminación, validación de contraseña contra `passwordHash` (`argon2`) y preservación de historial. |
| **5. Gestión de Cambios (CRQ) — Corrección de `crqDetalle.usuariosAfectados`** | **FUNCIONAL** | Campo numérico entero (`type="number" min=0 step=1`), conversión explícita a entero en frontend y `@Transform` + `@IsInt()` + `@Min(0)` en `CreateTicketDto`. |
| **6. Preservación del Módulo Reportes y Base de Datos PostgreSQL** | **FUNCIONAL** | Sin modificaciones sobre `apps/api/src/modules/reports/*`, `apps/web/src/app/(dashboard)/reportes/page.tsx` ni `schema.prisma`. |

---

## 2. Estado Inicial Encontrado en los 4 Módulos

1. **Módulo Configuraciones (`/configuracion` y `apps/api/src/modules/catalogs`):**
   - Solo existían consultas de lectura (`GET /catalogs/*`). No había endpoints `POST` ni `DELETE` en `CatalogsController` ni métodos de escritura/eliminación en `CatalogsService`.
   - En la vista `apps/web/src/app/(dashboard)/configuracion/page.tsx`, los catálogos (`Sedes`, `Áreas TI`, `Categorías`, `Subcategorías`, `Servicios TI`) eran únicamente de lectura y el botón superior era decorativo.
2. **Módulo SLA (`/sla` y `apps/api/src/modules/sla`):**
   - En PostgreSQL (`prioridades`) existían las 4 prioridades (`1: Crítica`, `2: Alta`, `3: Media`, `4: Baja`), pero la tabla `politicas_sla` solo tenía 3 registros (`idSla: 1, 2, 3`), careciendo de política activa para la prioridad `Baja` (`idPrioridad: 4`).
   - `SlaController` solo permitía `PATCH /sla/policies/:id` con campos parciales en línea y no permitía registrar nuevas políticas (`POST /sla/policies`) ni seleccionar prioridad/tipo de ticket desde el modal de `/sla`.
   - Al crear un ticket en `TicketsService.create()`, la búsqueda de SLA filtraba estrictamente por `idTipoTicket`, impidiendo el fallback general por prioridad cuando el tipo era `CRQ` o `INC` y la política estaba asociada al tipo base.
3. **Módulo Usuarios (`/usuarios` y `apps/api/src/modules/users`):**
   - `UsersController` contaba con listado (`GET`), creación (`POST`), edición (`PATCH /:id`) y cambio de estado (`PATCH /:id/status`), pero carecía de endpoint `DELETE /users/:id` con validación de contraseña del Administrador General.
   - En `apps/web/src/app/(dashboard)/usuarios/page.tsx` no existía acción ni modal de eliminación segura con contraseña.
4. **Módulo Gestión de Cambios (`/tickets/nuevo?tipo=CRQ` y `CreateTicketDto`):**
   - En `apps/web/src/app/(dashboard)/tickets/nuevo/page.tsx`, el estado `crqUsuariosAfectados` se inicializaba con el texto `'Comunidad Universitaria UNDC'` en un `<input type="text">`.
   - Al enviarse al backend (`CrqDetalleDto`), `ValidationPipe` (`enableImplicitConversion: true`) intentaba convertir esa cadena de texto en número, produciendo `NaN` y arrojando el error HTTP 400: `crqDetalle.usuariosAfectados must be an integer number`.

---

## 3. Cambios Realizados en el Módulo Configuraciones

- **Verificación de Contraseña del Administrador General (`apps/api/src/common/helpers/password-verifier.helper.ts`):**
  - Se implementó `verifyAdminPassword(prisma, adminUserId, passwordPlain)` que obtiene al usuario autenticado desde el token JWT (`req.user.userId`), verifica que la cuenta esté activa, que su rol en base de datos sea exactamente `Administrador`, y valida la contraseña ingresada frente a `passwordHash` almacenado en PostgreSQL mediante `argon2.verify()`.
- **DTOs y Validaciones (`apps/api/src/modules/catalogs/dto/catalog-operations.dto.ts`):**
  - Se crearon `CreateSedeDto`, `CreateAreaDto`, `CreateCategoriaDto`, `CreateSubcategoriaDto`, `CreateServicioDto` y `ConfirmPasswordDto`.
- **Controlador y Servicio (`catalogs.controller.ts` y `catalogs.service.ts`):**
  - Se protegieron con `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles('Administrador')` los endpoints:
    - `POST /api/catalogs/sedes` y `DELETE /api/catalogs/sedes/:id`
    - `POST /api/catalogs/areas` y `DELETE /api/catalogs/areas/:id`
    - `POST /api/catalogs/categorias` y `DELETE /api/catalogs/categorias/:id`
    - `POST /api/catalogs/subcategorias` y `DELETE /api/catalogs/subcategorias/:id`
    - `POST /api/catalogs/servicios` y `DELETE /api/catalogs/servicios/:id`
  - Los endpoints `GET` permanecen accesibles para que los formularios de tickets y filtros carguen catálogos actualizados en tiempo real.
  - **Protección de relaciones (`FK`):** Antes de eliminar cualquier registro de catálogo, el servicio verifica el conteo de dependencias (`_count` en `usuarios`, `tickets`, `subcategorias`, `servicios`). Si no tiene registros históricos asociados, realiza eliminación física (`delete`); si posee historial vinculado, desactiva el registro (`estado: false`) informando claramente al Administrador General sin romper llaves foráneas.
- **Interfaz Frontend (`apps/web/src/app/(dashboard)/configuracion/page.tsx`):**
  - Evalúa `esAdminGeneral = user?.rol === 'Administrador'`. Solo el Administrador General visualiza los botones de **Nuevo Registro** y **Eliminar**. Los demás roles ven un aviso de modo lectura.
  - Modal de creación específico para cada catálogo (`Sedes`, `Áreas de TI`, `Categorías`, `Subcategorías` con selector de Categoría padre, y `Servicios de TI` con selector de Categoría y Subcategoría).
  - Modal de eliminación con confirmación de contraseña actual del Administrador General, botón de mostrar/ocultar contraseña (`Eye` / `EyeOff`), nombre del registro objetivo, botones **Cancelar** y **Confirmar eliminación**, y notificaciones de éxito/error.

---

## 4. Cambios Realizados en el Módulo SLA

- **Base de Datos y Semilla (`apps/api/src/modules/sla/sla.service.ts` y `apps/api/prisma/seed.ts`):**
  - Se garantizó en PostgreSQL (`politicas_sla`) y en el servicio `SlaService.ensureBajaPolicyExists()` la existencia de la política para la prioridad **Baja** (`idPrioridad: 4`, `nivel: 4`):
    - Nombre: `Atención de Baja Prioridad`
    - Tiempo de respuesta: `120 min` (2h)
    - Tiempo de resolución: `1440 min` (24h)
  - Las políticas se ordenan por jerarquía de nivel de prioridad (`1: Crítica`, `2: Alta`, `3: Media`, `4: Baja`).
- **Creación y Edición de Políticas (`sla.controller.ts`, `sla.service.ts`, `dto/sla-policy.dto.ts`):**
  - Se agregaron `CreateSlaPolicyDto` y `UpdateSlaPolicyDto`, habilitando `POST /api/sla/policies` y `PATCH /api/sla/policies/:id`.
- **Vinculación con Tickets (`apps/api/src/modules/tickets/tickets.service.ts` y `apps/web/src/app/(dashboard)/tickets/nuevo/page.tsx`):**
  - `CatalogsService.getAllCatalogs()` ahora incluye `politicasSla` activas.
  - El formulario `/tickets/nuevo` muestra dinámicamente los tiempos de respuesta/resolución reales configurados en SLA para las 4 prioridades (`Crítica`, `Alta`, `Media`, `Baja`).
  - `TicketsService.create()` asigna automáticamente la política SLA correspondiente a la prioridad seleccionada (incluyendo `Baja`), calculando `fechaVencimientoRespuesta` y `fechaVencimientoResolucion`.

---

## 5. Cambios Realizados en el Módulo Usuarios

- **Backend (`apps/api/src/modules/users/users.controller.ts` y `users.service.ts`):**
  - Se incorporó `DELETE /api/users/:id` protegido con `@Roles('Administrador')`.
  - Reglas de negocio aplicadas en `UsersService.remove(targetId, adminId, password)`:
    1. **Bloqueo de auto-eliminación:** Si `targetId === adminId`, lanza `BadRequestException('No puedes eliminar tu propia cuenta de Administrador General activa.')`.
    2. **Verificación de contraseña:** Valida la contraseña enviada en el body contra el `passwordHash` del Administrador autenticado mediante `verifyAdminPassword`.
    3. **Protección de integridad histórica:** Evalúa `_count` en las 8 relaciones históricas (`ticketsSolicitados`, `asignacionesRecibidas`, `asignacionesRealizadas`, `comentarios`, `adjuntos`, `historial`, `crqAprobaciones`, `encuestas`). Si el usuario no registra historial (`totalHistorial === 0`), se elimina físicamente de `usuarios`; si tiene actividad histórica, se desactiva de forma segura (`estado: false`) conservando la trazabilidad de auditoría.
- **Frontend (`apps/web/src/app/(dashboard)/usuarios/page.tsx`):**
  - Los controles administrativos (Nuevo Usuario, Editar, Activar/Desactivar, Eliminar) están restringidos a `user?.rol === 'Administrador'`.
  - Se agregó el botón de eliminación (`Trash2`) en cada fila (deshabilitado sobre la propia cuenta del administrador en sesión) que abre el modal de confirmación con:
    - Nombre completo, código institucional y correo del usuario a eliminar.
    - Campo de contraseña actual del Administrador General con opción de mostrar/ocultar (`Eye` / `EyeOff`).
    - Botones **Cancelar** y **Confirmar eliminación**, con actualización inmediata del listado y contadores.

---

## 6. Causa Exacta del Error en Gestión de Cambios (`crqDetalle.usuariosAfectados`)

- **Causa raíz identificada:**
  - En `apps/api/prisma/schema.prisma`, el modelo `CrqDetalle` define `usuariosAfectados Int? @map("usuarios_afectados")`.
  - En `apps/api/src/modules/tickets/dto/create-ticket.dto.ts`, `CrqDetalleDto` valida el campo con `@IsInt()`.
  - Sin embargo, en `apps/web/src/app/(dashboard)/tickets/nuevo/page.tsx` (línea 69 original), el estado `crqUsuariosAfectados` se inicializaba como `'Comunidad Universitaria UNDC'` y se renderizaba como `<input type="text">` bajo la etiqueta *"Comunidad Afectada"*.
  - Al enviar el payload `{ crqDetalle: { ..., usuariosAfectados: "Comunidad Universitaria UNDC" } }`, el `ValidationPipe` global de NestJS convertía el string no numérico en `NaN`, fallando la validación `@IsInt()` con el mensaje `crqDetalle.usuariosAfectados must be an integer number`.

---

## 7. Solución Aplicada en Gestión de Cambios

1. **Frontend (`apps/web/src/app/(dashboard)/tickets/nuevo/page.tsx`):**
   - Se corrigió el valor inicial de `crqUsuariosAfectados` a `'20'`.
   - Se actualizó el control del formulario a `<input type="number" min={0} step={1} />` con etiqueta *"Cantidad Estimada de Usuarios Afectados"*, validando que solo acepte números enteros mayores o iguales a `0`.
   - Antes de enviar la petición `POST /api/tickets`, el valor se convierte explícitamente a entero (`parseInt(String(crqUsuariosAfectados), 10)`) y se verifica con `Number.isInteger()`.
2. **Backend (`apps/api/src/modules/tickets/dto/create-ticket.dto.ts`):**
   - Se reforzó `CrqDetalleDto.usuariosAfectados` con `@Transform()` para sanear entradas numéricas/vacías y `@IsInt({ message: 'crqDetalle.usuariosAfectados debe ser un número entero válido' })` + `@Min(0)`.
3. **Detalle de Ticket (`apps/web/src/app/(dashboard)/tickets/[id]/page.tsx`):**
   - En la pestaña de evaluación CRQ se muestra el indicador de **Usuarios Afectados** (`ticket.crqDetalle.usuariosAfectados`) junto con el análisis de impacto y riesgo.

---

## 8. Validación de Roles y Permisos

| Acción / Endpoint | Administrador General (`Administrador`) | Técnico / Gestor / Mesa de Ayuda | Solicitante (Docente / Estudiante / Admin.) |
| :--- | :---: | :---: | :---: |
| `GET /api/catalogs/*` | Permitido | Permitido | Permitido |
| `POST /api/catalogs/{sedes,areas,categorias,subcategorias,servicios}` | **Permitido** | Bloqueado (`403 Forbidden`) | Bloqueado (`403 Forbidden`) |
| `DELETE /api/catalogs/{sedes,areas,categorias,subcategorias,servicios}/:id` | **Permitido (con contraseña)** | Bloqueado (`403 Forbidden`) | Bloqueado (`403 Forbidden`) |
| `DELETE /api/users/:id` | **Permitido (con contraseña)** | Bloqueado (`403 Forbidden`) | Bloqueado (`403 Forbidden`) |
| `POST /api/sla/policies` y `PATCH /api/sla/policies/:id` | **Permitido** | Permitido (`Gestor`, `Mesa de Ayuda`) | Bloqueado (`403 Forbidden`) |

---

## 9. Validación de Confirmación por Contraseña

Se ejecutaron pruebas de integración contra el servidor NestJS conectado a PostgreSQL (`tidesk_db`):
- **Contraseña incorrecta en eliminación de catálogo (`DELETE /api/catalogs/sedes/:id`):** Devuelve `HTTP 401 Unauthorized` con mensaje `"Contraseña de administrador incorrecta. Operación cancelada."`.
- **Contraseña correcta en eliminación de catálogo (`DELETE /api/catalogs/sedes/:id`):** Devuelve `HTTP 200 OK`, eliminando el registro si no tiene dependencias o desactivándolo si tiene historial.
- **Rol no autorizado (`Técnico` intentando `POST` o `DELETE` en catálogos o `DELETE /api/users/:id`):** Devuelve `HTTP 403 Forbidden`.
- **Intento de auto-eliminación del Administrador General (`DELETE /api/users/:adminId`):** Devuelve `HTTP 400 Bad Request` impidiendo que el administrador elimine su propia sesión.
- **Contraseña incorrecta en eliminación de usuario (`DELETE /api/users/:id`):** Devuelve `HTTP 401 Unauthorized`.
- **Contraseña correcta en eliminación de usuario (`DELETE /api/users/:id`):** Devuelve `HTTP 200 OK` (eliminación física para cuentas sin historial o desactivación `estado: false` para cuentas con tickets/auditoría).

---

## 10. Archivos Inspeccionados y Modificados

### Archivos Nuevos Creados
- `apps/api/src/common/helpers/password-verifier.helper.ts`
- `apps/api/src/modules/catalogs/dto/catalog-operations.dto.ts`
- `apps/api/src/modules/sla/dto/sla-policy.dto.ts`
- `REPORTE_MEJORAS_MODULOS_TIDESK.md`

### Archivos Modificados
- `apps/api/src/modules/catalogs/catalogs.controller.ts`
- `apps/api/src/modules/catalogs/catalogs.service.ts`
- `apps/api/src/modules/sla/sla.controller.ts`
- `apps/api/src/modules/sla/sla.service.ts`
- `apps/api/src/modules/users/users.controller.ts`
- `apps/api/src/modules/users/users.service.ts`
- `apps/api/src/modules/tickets/dto/create-ticket.dto.ts`
- `apps/api/src/modules/tickets/tickets.service.ts`
- `apps/api/prisma/seed.ts`
- `apps/web/src/lib/api.ts`
- `apps/web/src/app/(dashboard)/configuracion/page.tsx`
- `apps/web/src/app/(dashboard)/sla/page.tsx`
- `apps/web/src/app/(dashboard)/usuarios/page.tsx`
- `apps/web/src/app/(dashboard)/tickets/nuevo/page.tsx`
- `apps/web/src/app/(dashboard)/tickets/[id]/page.tsx`

### Archivos Auditados y Preservados sin Modificación
- `apps/api/prisma/schema.prisma` (Intacto)
- `apps/api/src/modules/reports/reports.controller.ts` y `reports.service.ts` (Intactos)
- `apps/web/src/app/(dashboard)/reportes/page.tsx` (Intacto)

---

## 11. Pruebas Ejecutadas

1. **Compilación TypeScript Backend (`apps/api`):** `tsc --noEmit` → **0 errores** (`FUNCIONAL`).
2. **Compilación NestJS Build (`apps/api`):** `npm --prefix apps/api run build` → **Compilación limpia** (`FUNCIONAL`).
3. **Compilación TypeScript Frontend (`apps/web`):** `tsc --noEmit` → **0 errores** (`FUNCIONAL`).
4. **Suite de Pruebas E2E con PostgreSQL (`tidesk_db`):**
   - Verificación de bloqueo `403` para roles no administradores en `/api/catalogs/*` (`POST`/`DELETE`) y `/api/users/:id` (`DELETE`) → **FUNCIONAL**.
   - Creación de Sede, Área, Categoría, Subcategoría y Servicio como Administrador General → **FUNCIONAL**.
   - Rechazo `401` con contraseña inválida y eliminación `200` con contraseña válida en catálogos → **FUNCIONAL**.
   - Presencia y orden de las 4 prioridades (`Crítica`, `Alta`, `Media`, `Baja`) en `/api/sla/policies` y edición/restauración de tiempos de `Baja` → **FUNCIONAL**.
   - Creación de solicitud de cambio (`CRQ`) con prioridad `Baja` y `crqDetalle.usuariosAfectados: 45` (entero) verificando vinculación de `politicaSla` (`Atención de Baja Prioridad`) → **FUNCIONAL**.
   - Bloqueo de auto-eliminación del Administrador General (`400`), rechazo de contraseña inválida (`401`) y eliminación con contraseña válida (`200`) en `/api/users/:id` → **FUNCIONAL**.

---

## 12. Riesgos o Pendientes Detectados

- **Sincronización de secuencias `SERIAL` en PostgreSQL:** Debido a que el archivo inicial `seed.ts` insertaba registros con IDs explícitos (`idSla: 1, 2, 3`, `idPrioridad: 1..4`, etc.), se sincronizaron todas las secuencias (`pg_get_serial_sequence`) en `tidesk_db` con el valor máximo actual de cada tabla para evitar colisiones `Unique constraint failed` al insertar nuevos registros desde la interfaz.
- **Política de preservación de datos históricos:** Tanto en **Configuraciones** como en **Usuarios**, si el Administrador General confirma con su contraseña la eliminación de un registro que ya tiene tickets o auditoría vinculada en PostgreSQL, el sistema aplica automáticamente **desactivación lógica segura (`estado: false`)** en lugar de borrado físico destructivo, garantizando cero pérdida de integridad referencial.

