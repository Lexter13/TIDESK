# 04_MATRIZ_ROLES_PERMISOS.md
# MATRIZ INSTITUCIONAL DE ROLES Y PERMISOS (RBAC)
**Universidad Nacional de Cañete – TIDESK**

---

## 1. Perfiles de Usuario

1. **Administrador:** Acceso irrestricto al sistema, configuración institucional, gestión completa de usuarios, visualización de todos los tickets, reasignación y reportes ejecutivos.
2. **Coordinador TI:** Gestión de la mesa de ayuda, asignación de especialistas, aprobación de solicitudes de cambio (CAB), métricas y reportes analíticos.
3. **Técnico TI (Especialista):** Atención directa de tickets, auto-asignación ("Tomar ticket"), notas técnicas internas, registro de solución, adjuntar evidencias técnicas y reasignación autorizada.
4. **Docente:** Registro de requerimientos e incidencias de aulas/laboratorios, seguimiento de tickets propios, adjuntar evidencias, confirmación y encuesta CSAT.
5. **Estudiante:** Registro de solicitudes estudiantiles (cuentas, Teams, laboratorios), seguimiento propio, adjuntos y evaluación de calidad.
6. **Administrativo:** Solicitudes ofimáticas, conectividad de oficinas, telefonía, seguimiento propio y encuestas.

---

## 2. Matriz de Autorización por Funcionalidad

| Operación / Módulo | Administrador | Coordinador TI | Técnico TI | Docente | Estudiante | Administrativo |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Inicio de Sesión / JWT** | SÍ | SÍ | SÍ | SÍ | SÍ | SÍ |
| **Ver Dashboard Global** | SÍ | SÍ | SÍ (Personal) | NO | NO | NO |
| **Crear Requerimiento (REQ)** | SÍ | SÍ | SÍ | SÍ | SÍ | SÍ |
| **Crear Incidente (INC)** | SÍ | SÍ | SÍ | SÍ | SÍ | SÍ |
| **Crear Cambio (CRQ)** | SÍ | SÍ | SÍ | NO | NO | NO |
| **Aprobar Cambio (CAB)** | SÍ | SÍ | NO | NO | NO | NO |
| **Ver Todos los Tickets** | SÍ | SÍ | SÍ | NO (Solo propios)| NO (Solo propios)| NO (Solo propios)|
| **Asignar Especialista** | SÍ | SÍ | NO | NO | NO | NO |
| **Tomar Ticket** | SÍ | SÍ | SÍ | NO | NO | NO |
| **Comentarios Públicos** | SÍ | SÍ | SÍ | SÍ (En propios)| SÍ (En propios)| SÍ (En propios)|
| **Notas Internas Técnicas** | SÍ | SÍ | SÍ | NO | NO | NO |
| **Subir Evidencias / Adjuntos**| SÍ | SÍ | SÍ | SÍ (En propios)| SÍ (En propios)| SÍ (En propios)|
| **Descargar Evidencias** | SÍ | SÍ | SÍ | SÍ (En propios)| SÍ (En propios)| SÍ (En propios)|
| **Registrar Solución Técnica**| SÍ | SÍ | SÍ | NO | NO | NO |
| **Cerrar Ticket** | SÍ | SÍ | NO | SÍ (Confirmación)| SÍ (Confirmación)| SÍ (Confirmación)|
| **Enviar Encuesta CSAT** | NO | NO | NO | SÍ | SÍ | SÍ |
| **Administración Usuarios** | SÍ | NO (Solo lectura)| NO | NO | NO | NO |
| **Exportar Reportes a Excel** | SÍ | SÍ | NO | NO | NO | NO |
| **Modificar Políticas SLA** | SÍ | SÍ | NO | NO | NO | NO |
