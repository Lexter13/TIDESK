# REPORTE DE IMPLEMENTACIÓN TÉCNICA: MÓDULO “MI PERFIL INSTITUCIONAL”
## TIDESK – Sistema Integral de Mesa de Ayuda Universitaria
### Universidad Nacional de Cañete – UNDC
**Fecha de Emisión:** 03 de Noviembre de 2026  
**Ambiente de Trabajo:** Entorno Local (Windows x64 / Node.js 24 / PostgreSQL 18)

---

## 1. Estado Inicial
Al seleccionar la opción **"Mi Perfil Institucional"** desde el dropdown superior del usuario autenticado en el Header, la aplicación web intentaba navegar hacia la ruta `/perfil`. El navegador mostraba una pantalla de error **`404 - This page could not be found`** generada por Next.js App Router.

Adicionalmente:
- El endpoint `GET /auth/me` del backend devolvía únicamente datos planos del usuario (sin estado, fecha de creación ni objetos relacionales detallados).
- No existía un módulo o vista que adaptara métricas ITSM o datos de cuenta según el rol universitario (Administrador, Coordinador, Técnico o Solicitantes).

---

## 2. Causa Exacta del 404
En la estructura de Next.js App Router dentro del directorio `apps/web/src/app/(dashboard)/`:
- Existían rutas para `dashboard`, `tickets`, `incidentes`, `requerimientos`, `crq`, `sla`, `usuarios`, `reportes` y `configuracion`.
- **No existía la carpeta `perfil/` ni el archivo `perfil/page.tsx`**.
- El componente `Header` (`apps/web/src/components/layout/header.tsx`) ya apuntaba correctamente a `<Link href="/perfil">`, por lo que al no existir el segmento de ruta en el sistema de archivos de Next.js, el servidor respondía con error HTTP 404.

---

## 3. Arquitectura Encontrada
El repositorio opera bajo un monorepo con npm workspaces:
- **Frontend (`apps/web`):** Next.js 16.4.0 (App Router con route groups `(auth)` y `(dashboard)`), React 19, TypeScript, TailwindCSS v4, Lucide React e integración de sesión por contexto `AuthProvider` (`apps/web/src/context/auth-context.tsx`).
- **Backend (`apps/api`):** NestJS 12 sobre Node.js 24 y TypeScript. Autenticación JWT mediante `@nestjs/jwt`, `@nestjs/passport` y Passport JWT Strategy (`JwtStrategy`), con decorador `@CurrentUser` y control de acceso RBAC con `@Roles` y `RolesGuard`.
- **Capa de Datos:** Prisma ORM 6.19.3 conectado a PostgreSQL 18 local (`tidesk_db`).

---

## 4. Roles Encontrados Realmente en la Base de Datos
Tras auditar la tabla `roles` en `tidesk_db`, se identificaron exactamente **6 roles institucionales**:
1. **ID 1 – `Administrador`**: Acceso total a gestión institucional, catálogos, políticas SLA y auditoría.
2. **ID 2 – `Coordinador TI`**: Supervisión de mesa de ayuda, asignación de especialistas, aprobaciones CAB y reportes.
3. **ID 3 – `Técnico TI`**: Atención, diagnóstico y resolución de tickets asignados.
4. **ID 4 – `Docente`**: Solicitante docente con acceso a requerimientos e incidentes.
5. **ID 5 – `Estudiante`**: Solicitante estudiante para servicios académicos.
6. **ID 6 – `Administrativo`**: Personal administrativo de facultades y direcciones universitarias.

---

## 5. Ruta Implementada
- **Archivo:** `apps/web/src/app/(dashboard)/perfil/page.tsx`
- **Ruta Pública:** `/perfil`
- **Integración de Layout:** Al estar ubicada dentro del route group `(dashboard)`, hereda automáticamente `apps/web/src/app/(dashboard)/layout.tsx`, manteniendo intactos el `Sidebar` institucional, el `Header` superior y la protección de sesión, sin duplicar contenedores ni marcos de navegación.

---

## 6. Archivos Creados
1. **`apps/api/src/common/helpers/profile-builder.helper.ts`**: Helper modular del backend que ejecuta las consultas agregadas de Prisma para construir el perfil institucional y calcular las métricas personales contextuales según el rol del usuario autenticado.
2. **`apps/web/src/app/(dashboard)/perfil/page.tsx`**: Página interactiva institucional de perfil dinámico por rol, con diseño de dos columnas, badges de rol, tarjeta de identidad, información personal, datos institucionales, información de cuenta y tabla de actividad reciente en tickets.

---

## 7. Archivos Modificados
1. **`apps/api/src/modules/auth/auth.service.ts`**: Se integró `buildUserProfile` en el método `getProfile(userId)` para enriquecer la respuesta de `GET /auth/me`.
2. **`apps/api/src/modules/users/users.service.ts`**: Se añadió el método `getMyProfile(userId)` utilizando `buildUserProfile`.
3. **`apps/api/src/modules/users/users.controller.ts`**: Se incorporó el endpoint `@Get('me')` protegido por `JwtAuthGuard`, posicionado estratégicamente antes de `@Get(':id')`.
4. **`apps/web/src/context/auth-context.tsx`**: Se amplió la interfaz TypeScript `UserProfile` para soportar las propiedades opcionales enriquecidas (`estado`, `createdAt`, `rolDetalle`, `sedeDetalle`, `areaDetalle`, `facultadDetalle`, `carreraDetalle` y `actividad`).
5. **`apps/web/src/lib/api.ts`**: Se añadió la función `api.users.getMe()` para invocar `GET /users/me`.

---

## 8. Endpoint Utilizado
Se mantuvieron y sincronizaron dos canales REST protegidos:
- **`GET /users/me`**: Endpoint canónico REST para consultar el perfil y la actividad del usuario autenticado.
- **`GET /auth/me`**: Endpoint ya integrado en el ciclo de vida del cliente (`api.auth.me()`), enriquecido sin romper retrocompatibilidad.

---

## 9. Sistema de Autenticación Utilizado
Se reutilizó al 100% el sistema de autenticación institucional de TIDESK:
- Token JWT emitido en el login y transmitido vía cabecera `Authorization: Bearer <token>` o cookie HttpOnly `tidesk_token`.
- Validación por medio de `JwtAuthGuard` y `JwtStrategy` (Passport).
- En el frontend, protección de rutas y ciclo de vida gestionados por `AuthProvider` y `AuthRouteProtection` (`auth-context.tsx`).

---

## 10. Forma de Obtener el Usuario Autenticado
**Enfoque de Seguridad Zero-Trust:**
- El identificador del usuario **nunca** se recibe desde la URL ni de parámetros de consulta (`?id=...`, `userId`, etc.).
- Se obtiene estrictamente en el backend mediante el decorador institucional `@CurrentUser('idUsuario')`, el cual extrae el claim `sub` verificado criptográficamente por `JwtStrategy`.
- El frontend no puede suplantar la identidad de otro usuario.

---

## 11. Relaciones Prisma Utilizadas
La construcción del perfil consume de manera segura las siguientes relaciones del modelo `Usuario`:
- `rol`: `Rol` (`idRol`, `nombre`, `descripcion`).
- `sede`: `Sede` (`idSede`, `nombre`, `direccion`).
- `area`: `Area` (`idArea`, `nombre`, `descripcion`).
- `facultad`: `Facultad` (`idFacultad`, `nombre`).
- `carrera`: `Carrera` (`idCarrera`, `nombre`).
- `ticketsSolicitados`: Tickets donde `idUsuarioSolicitante === userId`.
- `asignacionesRecibidas`: Asignaciones donde `idEspecialista === userId` y `activo === true`.
- `asignacionesRealizadas`: Asignaciones donde `asignadoPor === userId`.
- `comentarios`: Intervenciones donde `idUsuario === userId`.
- `historial`: Auditoría donde `idUsuario === userId`.
- `crqAprobaciones`: Solicitudes CAB donde `idAprobador === userId`.
- `ticketSla`: Fechas límite de resolución para cálculo de SLA vencidos o próximos a vencer.

---

## 12. Lógica Aplicada a Cada Rol
Se implementó una clasificación robusta basada en identificadores estables (`idRol`) con respaldo por coincidencia semántica:
1. **Administrador (`idRol === 1`):** Perfil institucional completo. En actividad, muestra la gestión administrativa y auditoría registrada personalmente a su nombre, indicando explícitamente que las estadísticas globales del campus corresponden al Dashboard general.
2. **Coordinador TI (`idRol === 2`):** Métricas de coordinación operativa: asignaciones delegadas a técnicos, aprobaciones de cambios (CRQ) supervisadas e intervenciones registradas.
3. **Técnico TI (`idRol === 3`):** Métricas operativas técnicas exclusivas: asignaciones activas bajo su cargo, tickets en atención, tickets en espera, resueltos, cerrados y cumplimiento SLA (vencidos y próximos a vencer).
4. **Docente Solicitante (`idRol === 4`):** Información académica (Facultad, Carrera, Sede) y seguimiento exclusivo de sus requerimientos e incidentes solicitados.
5. **Estudiante Solicitante (`idRol === 5`):** Información universitaria (Código institucional, Carrera, Facultad, Sede) y conteo de sus solicitudes en curso, resueltas y cerradas.
6. **Administrativo Solicitante (`idRol === 6`):** Información de su área administrativa/dependencia y trazabilidad de sus trámites.
7. **Fallback para Roles Futuros:** Cualquier nuevo rol no previsto adopta un comportamiento seguro como solicitante (`SOLICITANTE`), mostrando sus datos personales/institucionales y tickets creados por él, evitando roturas o errores 500.

---

## 13. Métricas Utilizadas por Rol (100% Reales de PostgreSQL)
* **Administrador:** `ticketsCreados`, `intervencionesComentarios`, `accionesRegistradas`, `asignacionesGestionadas`.
* **Coordinador TI:** `asignacionesRealizadas`, `cambiosCrqSupervisados`, `intervencionesComentarios`, `ticketsCreados`.
* **Técnico TI:** `asignadosActivos`, `enAtencion`, `enEspera`, `resueltos`, `cerrados`, `slaVencidos`, `slaProximosVencer`.
* **Solicitantes (Docente, Estudiante, Administrativo):** `totalTickets`, `pendientes`, `enAtencion`, `resueltos`, `cerrados`, con desglose por tipo (`requerimientos`, `incidentes`, `cambios`).

---

## 14. Cambios de Frontend
- Creación de la página `/perfil` (`apps/web/src/app/(dashboard)/perfil/page.tsx`).
- Estilos con la paleta oficial UNDC (`#06285C`, `#176BDA`, `#FFD21E`, `#009B60`).
- Implementación de Skeleton Loader para el estado de carga (`animate-pulse`).
- Implementación de estado de error controlado con botón de reintento ("Reintentar Carga").
- Integración de tabla de últimos 5 tickets reales con enlace directo a `/tickets/:idTicket`.
- Manejo defensivo contra valores vacíos: muestra `"No registrado"` o `"No asignada"` (nunca `null` ni `undefined`).

---

## 15. Cambios de Backend
- Implementación de `buildUserProfile` en `profile-builder.helper.ts`.
- Exposición de `GET /users/me` en `UsersController`.
- Enriquecimiento de `GET /auth/me` en `AuthService`.
- Prevención de exposición de campos sensibles (`passwordHash`, `password`, secretos).

---

## 16. Cambios en Base de Datos
> **DECLARACIÓN EXPLÍCITA:**  
> **NO SE MODIFICÓ LA BASE DE DATOS POSTGRESQL.**  
> No se ejecutó ningún `ALTER TABLE`, `DROP`, `TRUNCATE` ni migración destructiva. Todos los datos, usuarios, contraseñas, tickets e histórico de auditoría existentes en `tidesk_db` se conservan intactos.

---

## 17. Cambios en schema.prisma
> **DECLARACIÓN EXPLÍCITA:**  
> **NO SE MODIFICÓ EL ARCHIVO `schema.prisma`.**  
> El modelo institucional existente de 24 tablas resultó completamente idóneo y suficiente para implementar todas las funcionalidades requeridas.

---

## 18. Pruebas Ejecutadas
Se diseñó y ejecutó una suite automatizada de pruebas exhaustivas (`scratch/run_full_profile_tests.js`) evaluando los 18 escenarios obligatorios.

---

## 19. Resultado de Cada Prueba

| N° | Nombre de la Prueba | Criterio Evaluado | Estado |
|---|---|---|---|
| **1** | Administrador General | Identidad, rol Admin y métricas de gestión personal sin colisión con Dashboard global | **FUNCIONAL** |
| **2** | Coordinador TI | Identidad, rol Coord, asignaciones realizadas y supervisión de cambios CRQ | **FUNCIONAL** |
| **3** | Técnico de Soporte | Identidad, tickets asignados activos, en atención, resueltos y alertas SLA propias | **FUNCIONAL** |
| **4** | Docente Solicitante | Vinculación académica (Facultad/Carrera) y solicitudes propias | **FUNCIONAL** |
| **5** | Estudiante Solicitante | Código institucional, datos universitarios y solicitudes propias | **FUNCIONAL** |
| **6** | Administrativo Solicitante | Área de adscripción y métricas de solicitudes propias | **FUNCIONAL** |
| **7** | Cambio de Sesión | Aislamiento estricto de tokens; cambio de usuario no arrastra datos anteriores | **FUNCIONAL** |
| **8** | Recarga Directa (F5) | Navegación directa a `http://localhost:3000/perfil` sin generar 404 | **FUNCIONAL** |
| **9** | Acceso Sin Sesión | Intento sin token redirige automáticamente a `/login` | **FUNCIONAL** |
| **10** | Usuario Sin Área | Manejo seguro de `idArea: null` (ej. Docente), sin excepciones | **FUNCIONAL** |
| **11** | Usuario Sin Facultad | Manejo seguro de `idFacultad: null` (ej. Admin), sin excepciones | **FUNCIONAL** |
| **12** | Usuario Sin Carrera | Manejo seguro de `idCarrera: null` (ej. Admin), sin excepciones | **FUNCIONAL** |
| **13** | API Inactiva | Simulación de fallo de red con UI de error y botón de reintento | **FUNCIONAL** |
| **14** | Seguridad e IDOR | Imposibilidad de consultar otros perfiles vía `?id=...` o manipulación de parámetros | **FUNCIONAL** |
| **15** | Logout Operativo | Dropdown permite navegar a `/perfil` y cerrar sesión sin interferencias | **FUNCIONAL** |
| **16** | Validación TypeScript | Compilación limpia sin errores en `apps/api` y `apps/web` (`tsc --noEmit`) | **FUNCIONAL** |
| **17** | Backend Seguro | Exclusión garantizada de `passwordHash`, contraseñas o tokens en el JSON | **FUNCIONAL** |
| **18** | Métricas Auténticas | Conteos agregados directamente desde PostgreSQL 18 (cero mocks o Math.random) | **FUNCIONAL** |

**Resumen de la Batería:** 18 de 18 pruebas evaluadas como **FUNCIONAL**.

---

## 20. Errores Encontrados y Corregidos Durante el Proceso
1. **Error inicial de coincidencia por rol:** Inicialmente se utilizó `rolNombre.toLowerCase().includes('admin')`, lo que provocaba que el rol `'Administrativo'` coincidiera erróneamente con `'admin'`. Se corrigió implementando discriminadores precisos (`idRol === 1 || rolNombre.toLowerCase().startsWith('administrador') || rolNombre.toLowerCase() === 'admin'`), permitiendo que el rol Administrativo se categorice correctamente como solicitante.
2. **Ruta relativa en suite de pruebas:** Se ajustó la ruta absoluta del archivo en el script de verificación para evitar resolución incorrecta en directorios temporales de scratch.

---

## 21. Limitaciones Reales
- **Edición de Información:** Conforme a las especificaciones de la Fase 10, el módulo de perfil es de **solo lectura**. No permite la auto-modificación de roles, sedes, áreas o datos académicos, ya que estos son gestionados centralmente por la Dirección de TI y Recursos Humanos de la UNDC.
- **Fotografía de Perfil:** Al no existir campo de fotografía en `Usuario` dentro de `schema.prisma`, se emplean iniciales institucionales con degradado institucional, respetando la regla de no alterar el esquema de base de datos.

---

## 22. Recomendaciones Futuras
1. **Actualización de teléfono opcional:** Si la institución lo autoriza a futuro, se puede habilitar un endpoint específico `PATCH /users/me/phone` para que los usuarios puedan actualizar su teléfono de contacto de forma autónoma.
2. **Subida de foto de perfil institucional:** Si se decide incorporar avatares personalizados en una futura versión, se recomienda coordinar la adición de una columna `foto_url` en `schema.prisma` y almacenar los archivos en el almacenamiento local o institucional ya configurado (`STORAGE_DRIVER=local`).

