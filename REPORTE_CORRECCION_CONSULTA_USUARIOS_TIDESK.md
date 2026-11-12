# REPORTE — CORRECCIÓN DE LA CONSULTA DE USUARIOS EN TIDESK
**Fecha:** 09/11/2026 · **Entorno:** Local (NestJS 12, Prisma 6.19.3, PostgreSQL 18 `tidesk_db`, Next.js 16.4.5)

---

## 1. Causa raíz

**El `select` de Prisma no era el problema.** La consulta original con `select` es válida, coincide con `schema.prisma` y devuelve los 8 usuarios reales con sus relaciones.

El error estaba en el **frontend**, al armar el *query string*:

```ts
// apps/web/src/app/(dashboard)/usuarios/page.tsx → loadData()
api.users.getAll({ page, limit: 15, search: search.trim() || undefined, rol: rolFilter || undefined })

// apps/web/src/lib/api.ts → users.getAll()
new URLSearchParams(params)   // ← convierte undefined en el TEXTO "undefined"
```

Resultado real enviado al backend:
```
GET /api/v1/users?page=1&limit=15&search=undefined&rol=undefined
```

En `UsersService.findAll`, `params.search === "undefined"` es un valor *truthy*, así que se agregaba este filtro:
```ts
where.OR = [{ nombres: { contains: "undefined" } }, { apellidos: ... }, { correo: ... }, { codigo: ... }]
```
Ningún usuario contiene la palabra "undefined", así que **`count({ where })` y `findMany({ where })` devolvían 0**.

### Por qué parecía que el culpable era el `select`
El *workaround* aplicado en `users.service.ts` cambió la consulta por `this.prisma.usuario.findMany()` **sin argumentos**. Así no solo se quitó el `select`: también se quitaron `where`, `skip`, `take`, `orderBy` y las relaciones. Por eso:

| Síntoma | Explicación |
|---|---|
| La tabla mostraba usuarios sin el `select` | `findMany()` ya no aplicaba el `where` contaminado con "undefined" |
| No se veían registros con el `select` | El `select` iba junto con el `where` que filtraba por "undefined" |
| `Total de cuentas registradas: 0` | `count({ where })` seguía aplicando el filtro "undefined" |
| Columna Rol vacía | `findMany()` sin `select`/`include` no trae la relación `rol`, así que `u.rol?.nombre` era `undefined` |

## 2. Archivo y función afectados
- **Origen del error:** `apps/web/src/lib/api.ts` → `api.users.getAll()`
- **Consulta afectada (workaround temporal):** `apps/api/src/modules/users/users.service.ts` → `UsersService.findAll()`

## 3. Corrección implementada

| Archivo | Cambio |
|---|---|
| `apps/api/src/modules/users/users.service.ts` | **Se restauró la consulta original** con `where`, `skip`, `take`, `orderBy` y `select`. El archivo quedó **idéntico al de `HEAD`** (`git diff` sin cambios). |
| `apps/web/src/lib/api.ts` | `users.getAll()` ahora quita los parámetros `undefined`, `null` o `''` antes de construir el `URLSearchParams` (+6 líneas, solo afecta a usuarios). |
| `apps/web/src/app/(dashboard)/usuarios/page.tsx` | Texto de respaldo en la columna Rol: `{u.rol?.nombre \|\| 'Sin rol asignado'}` (1 línea, sin cambios de estilo). |

No hubo que modificar el contador: `total` ya venía de `prisma.usuario.count({ where })`. Este es el total real de cuentas, que es distinto de `items.length`, la cantidad de registros de la página actual.

## 4. Validaciones (API compilada levantada en el puerto 4099, sesión de administrador, solo lectura)

| # | Validación | Evidencia | Estado |
|---|---|---|:---:|
| 1 | Prisma devuelve usuarios reales | `total=8, items=8`, datos de PostgreSQL | **FUNCIONAL** |
| 2 | El `select` funciona | Llegan `rol`, `sede`, `area`, `facultad` y `carrera` anidados | **FUNCIONAL** |
| 3 | El *query string* anterior reproducía el fallo | `search=undefined` → `total=0, items=0` | Causa confirmada |
| 4 | El contador refleja el total real | `limit=3` → `items=3` pero `total=8`, `totalPages=3` | **FUNCIONAL** |
| 5 | La columna Rol muestra nombres reales | Administrador, Coordinador TI, Técnico TI, Docente, Estudiante | **FUNCIONAL** |
| 6 | Búsqueda | `search=vargas` → 2 resultados correctos | **FUNCIONAL** |
| 7 | Paginación | Página 3 con `limit=3` → 2 registros (CRD-001, ADM-001) | **FUNCIONAL** |
| 8 | Filtro `idRol` en el backend | `idRol=4` → 2 docentes | **FUNCIONAL** |
| 9 | Selector "Todos los Roles" de la UI | La UI envía `rol=Docente` (nombre), pero el backend solo entiende `idRol`, así que devuelve los 8. **Error preexistente, ajeno a esta corrección.** | **PARCIAL** |
| 10 | Relaciones opcionales nulas | DOC-20261 `area=null`, ADM-001 `facultad=null, carrera=null`, sin errores; la UI ya usa `?.` | **FUNCIONAL** |
| 11 | Sin `passwordHash` en la respuesta | `passwordHash expuesto=false` en todas las llamadas | **FUNCIONAL** |
| 12 | TypeScript (`tsc --noEmit`) | `apps/api` y `apps/web`: código de salida 0 | **FUNCIONAL** |
| 13 | Build del backend (`nest build`) | Exitoso | **FUNCIONAL** |
| 14 | Consola del navegador | No se abrió un navegador en esta sesión | **NO VERIFICADO** |

## 5. Garantías
- **No se modificó la base de datos:** no hubo escrituras, migraciones, `db push`, `DROP` ni `TRUNCATE`. Todas las pruebas fueron consultas de lectura.
- **No se modificó `schema.prisma`.**
- **No se tocaron otros módulos:** el filtrado de parámetros vacíos se agregó solo en `api.users.getAll`. Autenticación, roles, permisos, estilos, Sidebar, Header y Dashboard siguen intactos.
- No se agregaron dependencias, no hubo despliegue ni push.

## 6. Pendiente recomendado (requiere tu aprobación)
El selector de rol del directorio envía el **nombre** del rol (`rol=Docente`), pero el backend solo filtra por `idRol`. Para corregirlo sin tocar el backend, basta con que las opciones del `<select>` usen `catalogs.roles` (idRol/nombre) y envíen `idRol`. Es un cambio de pocas líneas en `usuarios/page.tsx`.

