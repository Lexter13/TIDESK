# 02_INVENTARIO_MODULOS.md
# INVENTARIO Y MATRIZ DE MÓDULOS DE TIDESK
**Universidad Nacional de Cañete (UNDC)**

---

## Matriz de Auditoría Módulo por Módulo

| Módulo | Frontend | Backend | Endpoints | Tablas BD | Estado Funcional | Observaciones / Brechas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Autenticación** | `(auth)/login` | `modules/auth` | `POST /auth/login`<br>`GET /auth/me`<br>`POST /auth/logout` | `usuarios`, `roles` | **FUNCIONAL** | Autenticación con Argon2 y JWT. Sesiones operativas. |
| **2. Dashboard** | `(dashboard)/dashboard` | `modules/dashboard` | `GET /dashboard/stats` | `tickets`, `estados`, `prioridades` | **FUNCIONAL** | Métricas en tiempo real calculadas sobre registros reales. |
| **3. Usuarios** | `(dashboard)/usuarios` | `modules/users` | `GET /users`<br>`POST /users`<br>`PATCH /users/:id`<br>`PATCH /users/:id/toggle-status` | `usuarios`, `roles`, `sedes`, `facultades`, `carreras`, `areas` | **PARCIAL** | El backend tiene CRUD completo; el frontend carecía de campos condicionales y selector de carreras/áreas. |
| **4. Roles & Permisos** | N/A (Integrado) | `common/guards` | Guards `@Roles()` | `roles` | **FUNCIONAL** | Control de acceso basado en roles (RBAC) en endpoints del backend. |
| **5. Tickets (General)** | `(dashboard)/tickets` | `modules/tickets` | `GET /tickets`<br>`POST /tickets`<br>`GET /tickets/:id` | `tickets`, `secuencias_tickets` | **FUNCIONAL** | Soporta filtros, paginación y códigos correlativos (`REQ-...`, `INC-...`, `CRQ-...`). |
| **6. Requerimientos (REQ)** | `(dashboard)/requerimientos` | `modules/tickets` | `GET /tickets?idTipoTicket=1` | `tickets`, `servicios`, `categorias` | **FUNCIONAL** | Vista especializada con catálogo de requerimientos. |
| **7. Incidentes (INC)** | `(dashboard)/incidentes` | `modules/tickets` | `GET /tickets?idTipoTicket=2` | `tickets`, `prioridades` | **FUNCIONAL** | Gestión de incidentes con criticidad e impacto. |
| **8. Cambios (CRQ)** | `(dashboard)/crq` | `modules/tickets` | `GET /tickets?idTipoTicket=3`<br>`POST /tickets/:id/approve-crq` | `tickets`, `crq_detalle`, `crq_aprobaciones` | **FUNCIONAL** | Flujo de comité CAB con votación de aprobación. |
| **9. Asignaciones** | `tickets/[id]` | `modules/tickets` | `POST /tickets/:id/assignments`<br>`POST /tickets/:id/take` | `asignaciones`, `usuarios` | **FUNCIONAL** | Permite auto-asignación técnica o asignación por Coordinador. |
| **10. Comentarios** | `tickets/[id]` | `modules/tickets` | `POST /tickets/:id/comments` | `comentarios` | **FUNCIONAL** | Distinción entre notas públicas y notas internas técnicas. |
| **11. Adjuntos / Evidencias**| `tickets/nuevo`, `[id]` | No existía | `POST /tickets/:id/attachments`<br>`GET /tickets/attachments/:id/download` | `adjuntos` | **NO IMPLEMENTADO** | Faltaba el servicio Multer y endpoints de carga y descarga segura. |
| **12. Historial de Auditoría**| `tickets/[id]` | `modules/tickets` | Incluido en `GET /tickets/:id` | `historial_ticket` | **FUNCIONAL** | Registro automático de eventos y cambios de estado en cada ticket. |
| **13. SLA** | `(dashboard)/sla` | `modules/sla` | `GET /sla/policies`<br>`PATCH /sla/policies/:id`<br>`GET /sla/metrics` | `politicas_sla`, `ticket_sla` | **FUNCIONAL** | Políticas por prioridad y cronjob de evaluación de vencimientos. |
| **14. Notificaciones** | Barra superior | `modules/notifications` | `GET /notifications`<br>`PATCH /notifications/:id/read` | `notificaciones` | **FUNCIONAL** | Alertas en tiempo real por cambios de asignación y estado. |
| **15. Encuestas (CSAT)** | `tickets/[id]` | `modules/tickets` | `POST /tickets/:id/survey` | `encuestas` | **FUNCIONAL** | Calificación de satisfacción del usuario post-cierre. |
| **16. Reportes & Exportación**| `(dashboard)/reportes` | `modules/reports` | `GET /reports/analytics`<br>`GET /reports/export/excel` | Vistas agregadas | **FUNCIONAL** | Exportación de analíticas a Excel (`ExcelJS`). |
| **17. Configuración** | `(dashboard)/configuracion` | Varios | Consulta de perfiles y catálogos | Catálogos | **FUNCIONAL** | Información del perfil y políticas del sistema. |
| **18. Seguridad** | Global | Global | Guards, Argon2, Helmet/CORS | Todo | **FUNCIONAL** | DTOs estrictos, protección contra SQLi (Prisma) y control de sesión. |
