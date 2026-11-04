# 03_AUDITORIA_BASE_DATOS.md
# AUDITORÍA DE BASE DE DATOS Y MODELO RELACIONAL
**Universidad Nacional de Cañete – TIDESK**

---

## 1. Información General
- **Motor:** PostgreSQL 18 (x64)
- **Base de Datos:** `tidesk_db`
- **Charset / Collation:** UTF-8 / Spanish_Peru.1252
- **ORM:** Prisma 6.19.3
- **Total Tablas:** 24 tablas en el esquema `public`

---

## 2. Inventario de Tablas y Relaciones

### Grupo A: Estructura Institucional Universitaria
1. **`sedes`**: Sedes de la UNDC (San Vicente de Cañete, Lunahuaná, Imperial).
2. **`facultades`**: Facultades académicas (Ingeniería, Ciencias Empresariales, Ciencias Sociales).
3. **`carreras`**: Escuelas profesionales (`id_facultad` FK).
4. **`areas`**: Áreas administrativas y unidades de soporte tecnológico.

### Grupo B: Seguridad y Usuarios (RBAC)
5. **`roles`**: Catálogo de perfiles institucionales (Administrador, Coordinador TI, Técnico TI, Docente, Estudiante, Administrativo).
6. **`usuarios`**: Entidad central de identidad. Posee claves foráneas a `id_rol`, `id_sede`, `id_facultad`, `id_carrera`, `id_area`. Clave única en `correo` y `codigo`. Contraseñas protegidas mediante hash **Argon2id**.

### Grupo C: Catálogos ITIL y Parametría
7. **`tipos_ticket`**: Clasificación ITIL (REQ = Requerimiento, INC = Incidente, CRQ = Solicitud de Cambio).
8. **`prioridades`**: Matriz de severidad (Crítica, Alta, Media, Baja).
9. **`estados`**: Ciclo de vida (Pendiente, Asignado, En atención, En espera, Resuelto, Cerrado, Rechazado, Cancelado).
10. **`categorias`**: Familias de incidencias y requerimientos.
11. **`subcategorias`**: Clasificación granular (`id_categoria` FK).
12. **`servicios`**: Servicios de TI (`id_area` FK).
13. **`secuencias_tickets`**: Generador transaccional seguro de correlativos (`REQ-2026-XXXX`).

### Grupo D: Gestión de Tickets, Asignaciones y Evidencias
14. **`tickets`**: Tabla transaccional central con índices compuestos en `[id_tipo_ticket, id_estado, fecha_creacion]` e `[id_area, fecha_creacion]`.
15. **`asignaciones`**: Registro histórico de especialistas con marcas de vigencia (`activo`).
16. **`comentarios`**: Comunicación bidireccional y notas internas técnicas (`comentario_interno`).
17. **`adjuntos`**: Almacenamiento seguro de metadatos de archivos (`nombre_archivo`, `ruta_archivo`, `tipo_archivo`, `tamanio`, `id_ticket`, `id_usuario`).
18. **`historial_ticket`**: Trazabilidad inmutable de eventos y cambios de estado.

### Grupo E: Gestión de Cambios, SLA y Calidad
19. **`crq_detalle`**: Metadatos específicos de cambios técnicos (planes de trabajo, pruebas, reversa, ventana de tiempo).
20. **`crq_aprobaciones`**: Registro de votos del comité CAB.
21. **`politicas_sla`**: Metas de atención por prioridad y tipo de ticket.
22. **`ticket_sla`**: Instancia de métrica por ticket con control de cumplimiento.
23. **`encuestas`**: Evaluación CSAT (1-5 estrellas) tras la resolución.
24. **`notificaciones`**: Alertas en tiempo real para usuarios y especialistas.

---

## 3. Estado de Migraciones y Consistencia
- La base de datos se encuentra 100% sincronizada con el modelo Prisma (`prisma/schema.prisma`).
- Se verificaron restricciones de integridad referencial (Foreign Keys en cascada controlada o restrictiva).
- Todas las secuencias `IDENTITY` funcionan correctamente.
