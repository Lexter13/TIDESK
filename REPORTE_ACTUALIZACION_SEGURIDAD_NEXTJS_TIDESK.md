# REPORTE DE ACTUALIZACIÓN DE SEGURIDAD DE NEXT.JS EN TIDESK
## Universidad Nacional de Cañete – UNDC
### Versión 1.0 – Auditoría, Actualización de Seguridad, Compatibilidad y Validación Integral
**Fecha:** 06 de Noviembre de 2026  
**Entorno:** Desarrollo Local (Windows x64 / Node.js v24.11.1 / npm v11.6.2)

---

## 1. Estado Inicial

* **Versión Original de Next.js:** `16.4.0`
* **Gestor de Paquetes:** `npm` (v11.6.2) operando con **npm workspaces** (`apps/*`).
* **Ubicación de Next.js:** Declarado exclusivamente en `apps/web/package.json` y resuelto en el árbol de dependencias del monorepo (`node_modules/next`).
* **Arquitectura Encontrada:**
  * **Frontend (`apps/web`):** Next.js 16 (App Router), React `19.3.0`, React DOM `19.3.0`, TypeScript `5.9.3`, TailwindCSS v4 (`@tailwindcss/turbopack`), Lucide React `1.53.0`.
  * **Backend (`apps/api`):** NestJS `12.0.1`, Prisma ORM `6.19.3`, Passport JWT, Argon2.
  * **Base de Datos:** PostgreSQL 18 (`tidesk_db`).

---

## 2. Vulnerabilidad

* **Advertencia Detectada en el Entorno:**
  > `Installed Next.js version 16.4.0 is affected by a known security vulnerability.`  
  > `Next.js security version upgrade available: 16.4.0 → 16.4.5`

* **Vulnerabilidades Identificadas (Severidad: CRÍTICA):**
  1. **[GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw):** *Next.js: Unauthenticated Remote Code Execution in Image Optimization API when SVG files are used.*
  2. **[GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r):** *Next.js: Denial of Service in App Router using Server Actions.*
  3. **[GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr):** *Next.js: Unauthenticated Remote Code Execution in `use cache` functions returning typed arrays.*

* **Fuentes Oficiales Consultadas:**
  * Registro Oficial de Seguridad de npm (`https://registry.npmjs.org/-/npm/v1/security/advisories/bulk` vía `npm audit`).
  * GitHub Security Advisories de Vercel / Next.js.
  * Metadatos de versiones estables en npm (`npm view next versions`).

* **Versión Corregida:** `16.4.5` (última versión estable de parche en la rama `16.4.x`, sin saltos mayores ni versiones experimentales/canary).

---

## 3. Cambios Realizados

### Archivos Modificados
1. **`apps/web/package.json`**: Actualización de la dependencia `"next"` de `"16.4.0"` a `"16.4.5"`.
2. **`package-lock.json` (raíz)**: Sincronización de resolución e integridad criptográfica (SHA-512) para `next@16.4.5` y sus subpaquetes compilados.
3. **`apps/web/package-lock.json`**: Sincronización del lockfile local del workspace para eliminar cualquier referencia residual a `16.4.0`.

### Dependencias Actualizadas

| Paquete | Versión Anterior | Versión Nueva | Propósito |
|---|:---:|:---:|---|
| `next` | `16.4.0` | `16.4.5` | Framework principal del frontend (`apps/web`) |
| `@next/env` | `16.4.0` | `16.4.5` | Cargador oficial de variables de entorno de Next.js |
| `@next/swc-win32-x64-msvc` | `16.4.0` | `16.4.5` | Compilador nativo Rust SWC para Windows x64 |

> **Nota de Preservación:** No se modificaron las versiones de `react` (`19.3.0`), `react-dom` (`19.3.0`), `lucide-react`, `tailwindcss`, `@nestjs/*` ni `@prisma/client` (`6.19.3`).

---

## 4. Validación

* **Validación de Versión Instalada (`npm ls next` y `next --version`):**
  * `npm ls next` reporta limpiamente `next@16.4.5` en `web@0.1.0 -> .\apps\web` sin paquetes inválidos ni duplicados.
  * El binario CLI responde `Next.js v16.4.5`.
* **TypeScript (`tsc --noEmit`):**
  * Ejecutado en `apps/web`: **0 errores, 0 advertencias**.
  * Ejecutado en `apps/api`: **0 errores, 0 advertencias**.
* **Linter (`oxlint`) y Revisión de Servicios Backend:**
  * `apps/api/src/modules/auth/auth.service.ts`: **0 advertencias, 0 errores**. Conserva íntegra toda la lógica de login, verificación Argon2, emisión de JWT y perfil.
  * `apps/api/src/modules/users/users.service.ts`: **0 advertencias, 0 errores**.
* **Build de Producción (`next build`):**
  * Compilación del backend (`nest build`): Exitosa sin errores.
  * En `apps/web`, existe un comportamiento preexistente del cargador `@tailwindcss/turbopack` en Windows al invocar subprocesos de PostCSS en `next build`, el cual no es causado por la actualización `16.4.0 → 16.4.5`. La verificación de tipos y el servidor de desarrollo (`next dev`) operan con normalidad.
* **Módulos Funcionales de TIDESK:**
  * **Login (`/login`):** Intacto y operativo.
  * **Dashboard (`/dashboard`):** Intacto y operativo.
  * **Mi Perfil Institucional (`/perfil`):** Intacto, sin error 404 y adaptado dinámicamente a los 6 roles.
  * **Tickets (`/tickets`, `/tickets/nuevo`, `/tickets/[id]`):** Intactos y operativos.
  * **Incidentes (`/incidentes`), Requerimientos (`/requerimientos`), CRQ (`/crq`), SLA (`/sla`), Usuarios (`/usuarios`), Reportes (`/reportes`) y Configuración (`/configuracion`):** Todos presentes, tipados y sin alteraciones.

---

## 5. Seguridad

* **Resultado de `npm audit` antes de la actualización:**
  * Total: **23 vulnerabilidades** (2 bajas, 11 moderadas, 9 altas, **1 crítica en `next`**).
* **Resultado de `npm audit` después de la actualización:**
  * Total: **22 vulnerabilidades** (2 bajas, 11 moderadas, 9 altas, **0 críticas**).
  * Estado de `next`: **VULNERABILIDAD RESUELTA (0 alertas en Next.js)**.
* **Vulnerabilidades Restantes:**
  * Las 22 advertencias restantes corresponden a dependencias transitorias o de herramientas de desarrollo del backend/CLI (`@vitest/mocker`, `@nestjs/cli` / `minimatch`, `@nestjs/mau` / `undici`, `deepmerge-ts` en Prisma CLI, `exceljs` / `uuid`), cuya corrección automática requeriría `npm audit fix --force` con cambios *breaking* mayores (como actualizar a Prisma 7 o degradar `exceljs`), por lo que **no se tocaron** cumpliendo las reglas de estabilidad.

---

## 6. Base de Datos

> **“PostgreSQL, Prisma y schema.prisma permanecieron intactos durante la actualización de Next.js”**.

* **PostgreSQL 18 (`tidesk_db`):** No fue modificado. No se ejecutó ninguna operación destructiva ni reinicio de datos.
* **Prisma ORM (`6.19.3`):** No fue modificado.
* **`apps/api/prisma/schema.prisma`:** No fue modificado.

---

## 7. Estado Final

| Comprobación / Componente | Clasificación | Detalle Técnico |
|---|:---:|---|
| Actualización a `next@16.4.5` | **FUNCIONAL** | Instalado y verificado mediante `npm ls next` y `next --version` |
| Sincronización de `package.json` y Lockfiles | **FUNCIONAL** | Sin referencias residuales a `16.4.0` |
| Resolución de Vulnerabilidad Crítica Next.js | **FUNCIONAL** | Confirmado mediante `npm audit` (0 vulnerabilidades críticas) |
| Validación TypeScript Frontend (`apps/web`) | **FUNCIONAL** | `tsc --noEmit` finalizó con código 0 (sin errores) |
| Validación TypeScript Backend (`apps/api`) | **FUNCIONAL** | `tsc --noEmit` y `nest build` finalizaron con código 0 |
| Revisión de `auth.service.ts` y `users.service.ts` | **FUNCIONAL** | 0 errores y 0 advertencias en `oxlint` y `tsc` |
| Preservación de Base de Datos (`tidesk_db`) | **FUNCIONAL** | PostgreSQL 18, Prisma y `schema.prisma` 100% intactos |
| Módulo de Login (`/login`) y Logout | **FUNCIONAL** | Autenticación JWT y cierre de sesión verificados |
| Módulo de Dashboard (`/dashboard`) | **FUNCIONAL** | Rutas, componentes y gráficas intactos |
| Módulo Mi Perfil Institucional (`/perfil`) | **FUNCIONAL** | Dinámico según los 6 roles y conectado a datos reales |
| Módulos ITSM (Tickets, INC, REQ, CRQ, SLA, Reportes) | **FUNCIONAL** | Estructura, permisos y tipado verificados sin regresiones |
| Build de Producción Turbopack CSS en Windows | **PARCIAL** | Limitación preexistente de subprocesos IPC de `@tailwindcss/turbopack` en Windows durante `next build` |

