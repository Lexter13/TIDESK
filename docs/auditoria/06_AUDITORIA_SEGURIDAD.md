# 06_AUDITORIA_SEGURIDAD.md
# AUDITORÍA DE SEGURIDAD Y CONTROL DE VULNERABILIDADES
**Universidad Nacional de Cañete – TIDESK**

---

## 1. Autenticación y Criptografía
- **Algoritmo de Hashing:** Se utiliza **Argon2id** (`argon2`), estándar de recomendación OWASP y ganador de la Password Hashing Competition. No se utilizan hashes obsoletos (MD5, SHA1) ni almacenamiento en texto claro.
- **Sesiones e Identidad:** Tokens JWT firmados con clave secreta (`JWT_SECRET`) y expiración de 7 días. Transporte mediante Bearer Tokens en headers `Authorization` y soporte de cookies HttpOnly.
- **Validación de Credenciales:** Verificación obligatoria de estado activo del usuario antes de otorgar acceso (`estado: true`).

---

## 2. Protección de Entradas y Consultas a Base de Datos
- **Prevención de SQL Injection (SQLi):** Todas las consultas se canalizan mediante el motor parametrizado de **Prisma ORM**, evitando concatenaciones dinámicas de cadenas en SQL.
- **Validación Estricta de DTOs:** Configuración global de `ValidationPipe` en NestJS con opciones estrictas:
  - `whitelist: true`: Elimina propiedades no declaradas en el DTO.
  - `forbidNonWhitelisted: true`: Rechaza peticiones con datos espurios.
  - `transform: true`: Convierte tipos automáticamente garantizando tipado estricto.

---

## 3. Seguridad en Carga y Descarga de Evidencias (Adjuntos)
- **Ruta de Almacenamiento Aislada:** Los archivos se depositan en `./uploads`, fuera de la carpeta pública de distribución web, previniendo acceso directo por URL sin pasar por el backend.
- **Lista Blanca de Extensiones:** Solo se permiten extensiones verificadas: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.csv`, `.txt`. Se rechazan `.exe`, `.bat`, `.sh`, `.php`, `.js` o scripts ejecutables.
- **Nombres Internos No Predecibles:** Multer renombra los archivos con prefijo y marca de tiempo aleatoria (`tidesk-${timestamp}-${random}.${ext}`) para evitar ataques de colisión o sobrescritura de archivos.
- **Límite de Carga:** Tamaño máximo por archivo fijado en **10 MB** y máximo de 5 archivos simultáneos.
- **Control de Permisos de Descarga:** Endpoint `GET /tickets/attachments/:id/download` verifica la existencia del archivo en disco antes de despacharlo.

---

## 4. Control de Acceso y Prevención de Fugas de Información
- **RBAC a Nivel de Controlador:** `JwtAuthGuard` y `RolesGuard` verifican que solo Administradores y Coordinadores gestionen usuarios o aprueben cambios CAB.
- **Alcance Horizontal de Datos:** Solicitantes únicamente pueden listar y consultar tickets creados por ellos mismos (`where.idUsuarioSolicitante = currentUser.idUsuario`), evitando fuga de información entre alumnos y docentes.
- **Ocultamiento de Notas Internas:** Los comentarios marcados como internos (`comentarioInterno: true`) se filtran en el backend para que no sean visibles ante solicitantes.
