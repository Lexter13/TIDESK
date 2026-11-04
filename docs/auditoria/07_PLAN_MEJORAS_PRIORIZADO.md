# 07_PLAN_MEJORAS_PRIORIZADO.md
# PLAN DE MEJORAS PRIORIZADO (ITSM ROADMAP)
**Universidad Nacional de Cañete – TIDESK**

---

## 1. Fase Inmediata (Completada en esta Auditoría)
- [x] **Conexión y estabilidad PostgreSQL 18:** Configuración de `tidesk_db`, modelos Prisma y datos iniciales preservados.
- [x] **Corrección de bugs críticos:** Solución a error `NaN` en filtros del módulo de analítica y reportes de NestJS.
- [x] **Gestión Dinámica de Usuarios:** Selector adaptativo en frontend según rol institucional (Facultades y Carreras para perfiles académicos; Áreas operativas para soporte y administrativos) con opción de edición y toggle de activación.
- [x] **Módulo de Evidencias y Adjuntos:** Carga múltiple, almacenamiento controlado en `./uploads`, soporte de fotografías (JPG/PNG), documentos (PDF/DOCX) y hojas de cálculo (XLSX/CSV), tanto al crear ticket como en el seguimiento técnico.
- [x] **Bandejas Inteligentes de Tickets:** Pestañas estilo GLPI / ServiceDesk Plus (Todos, Mis tickets, Asignados, Sin asignar, Vencidos) con cálculo visual de SLA.

---

## 2. Fase Mediana (Propuestas de Valor Institucional)
1. **Base de Conocimiento (Knowledge Base / KB):**
   - Catálogo de soluciones a incidentes frecuentes y guías de autoayuda para estudiantes y docentes (configuración de correo en celulares, conexión WiFi campus, acceso a biblioteca virtual).
   - *Impacto:* Reducción de hasta un 30% en tickets de nivel 1.
2. **Plantillas de Respuestas Rápidas (Canned Responses):**
   - Respuestas predefinidas por el equipo de mesa de ayuda para agilizar la interacción.
3. **Control de Inventario de Activos TI (CMDB Ligera):**
   - Vincular tickets a activos institucionales (laptops de docentes, proyectores de aulas, switches de campus).

---

## 3. Fase Futura (Preparación para Producción)
1. **Migración de Almacenamiento a S3 / Cloud Storage:**
   - Desacoplar la carpeta `./uploads` hacia un bucket privado institucional (ej. Amazon S3 o Google Cloud Storage) mediante la abstracción implementada.
2. **Servidor de Correo SMTP Institucional Activo:**
   - Activar el envío de alertas reales de apertura y cierre de tickets hacia las casillas `@undc.edu.pe`.
