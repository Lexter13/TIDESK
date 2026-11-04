# 08_PRUEBAS_FUNCIONALES.md
# MATRIZ Y REGISTRO DE PRUEBAS FUNCIONALES END-TO-END
**Universidad Nacional de Cañete – TIDESK**

---

## 1. Escenario Principal: Ciclo de Vida Completo de Requerimiento (REQ)

| Paso | Acción Realizada | Actor / Rol | Resultado Obtenido | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Registro dinámico de docente en módulo Usuarios | Administrador (`admin@undc.edu.pe`) | Docente `carlos.vargas8191@undc.edu.pe` creado con Facultad de Ingeniería y Carrera de Ing. de Sistemas. | **PASÓ (201)** |
| **2** | Inicio de sesión con nueva cuenta docente | Docente registrado | Login exitoso, emisión de token JWT y redirección autorizada. | **PASÓ (200)** |
| **3** | Creación de Requerimiento con título y detalle | Docente | Ticket `REQ-2026-0003` creado y numerado correlativamente. | **PASÓ (201)** |
| **4** | Carga de archivo de evidencia adjunta | Docente | Archivo `silabo_requerimiento.txt` subido y asociado en `adjuntos` con tamaño e ID registrados. | **PASÓ (201)** |
| **5** | Visualización de ticket en bandeja general | Coordinador TI (`coordinador.ti@undc.edu.pe`) | Ticket visible en bandeja general y pestaña "Sin Asignar". | **PASÓ (200)** |
| **6** | Asignación de especialista técnico | Coordinador TI | Técnico Marlon Barrientos Farfán asignado con motivo formal. Historial actualizado. | **PASÓ (201)** |
| **7** | Inicio de atención y diagnóstico | Técnico Soporte (`tecnico.sistemas@undc.edu.pe`) | Estado cambia a "En atención", cronómetro SLA activo. | **PASÓ (200)** |
| **8** | Registro de solución técnica | Técnico Soporte | Solución documentada; ticket promovido a "Resuelto". | **PASÓ (200)** |
| **9** | Confirmación y cierre formal | Docente | Cierre confirmado con motivo de conformidad. Estado final: "Cerrado". | **PASÓ (200)** |
| **10**| Verificación de métricas en Analytics | Administrador | Ticket contabilizado en estadísticas de resolución de `GET /reports/analytics`. | **PASÓ (200)** |

---

## 2. Pruebas de Seguridad y Validaciones Negativas

| Prueba | Descripción | Resultado Esperado | Resultado Real | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **P-NEG-01** | Subida de archivo ejecutable `.exe` | Rechazo con código 400 | `BadRequestException: Tipo de archivo no permitido` | **PASÓ** |
| **P-NEG-02** | Acceso a listado de usuarios por Solicitante | Rechazo con código 403 | `ForbiddenException` por `RolesGuard` | **PASÓ** |
| **P-NEG-03** | Intento de duplicidad de correo en usuario | Rechazo con código 409 | `ConflictException: El correo ya está registrado` | **PASÓ** |
| **P-NEG-04** | Intento de resolver ticket por Solicitante | Rechazo con código 403 | `ForbiddenException: Solo especialistas pueden resolver` | **PASÓ** |
| **P-NEG-05** | Consulta de tickets ajenos por Estudiante | Filtro estricto por sesión | Retorna únicamente tickets propios | **PASÓ** |
