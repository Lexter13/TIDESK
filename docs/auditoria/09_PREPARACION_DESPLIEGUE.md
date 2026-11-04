# 09_PREPARACION_DESPLIEGUE.md
# PLAN TÉCNICO DE PREPARACIÓN PARA FUTURO DESPLIEGUE
**Universidad Nacional de Cañete – TIDESK**

> **AVISO IMPORTANTE:** En cumplimiento estricto de las restricciones del propietario, **NO se ha realizado ningún despliegue a producción**, ni ejecución de migraciones en Neon, ni publicación en Vercel o GitHub. Este documento constituye la guía técnica preparada para cuando el propietario autorice expresamente dicho procedimiento.

---

## 1. Topología Recomendada para Producción

```mermaid
graph LR
    User[Usuarios UNDC] -->|HTTPS| Vercel[Vercel: Frontend Next.js 16]
    Vercel -->|API REST / HTTPS| RenderApp[Backend NestJS 12: Render / AWS ECS / VPS]
    RenderApp -->|Pool SSL / TCP 5432| NeonDB[(PostgreSQL 18 Serverless en Neon)]
    RenderApp -->|SDK S3 / IAM| BucketS3[(Almacenamiento de Evidencias en S3)]
```

---

## 2. Puntos Clave de Compatibilidad Arquitectónica

### A. Backend NestJS vs. Vercel Serverless
- **Diagnóstico:** NestJS posee tareas programadas `@Cron` (verificación de vencimientos SLA en segundo plano) y procesos de larga duración que no se recomiendan ejecutar en Vercel Functions por el límite de timeout y el ciclo de vida efímero sin estado.
- **Recomendación:** Desplegar el frontend Next.js en **Vercel** y el backend NestJS en una plataforma de contenedores persistentes como **Render, Railway, Fly.io o VPS Institucional Linux**.

### B. Base de Datos Neon (PostgreSQL Serverless)
- Neon soporta conexiones agrupadas (Connection Pooling) con PgBouncer en el puerto `6543` y conexión directa en `5432`.
- En `schema.prisma` se debe utilizar:
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```

### C. Almacenamiento de Evidencias en Producción
- En local, las evidencias se almacenan en `./uploads`.
- Para producción en la nube, se debe activar la variable `STORAGE_DRIVER=s3` conectando un bucket de AWS S3 o Cloudflare R2 con credenciales `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_S3_BUCKET`.

---

## 3. Matriz de Variables de Entorno para Producción

| Variable | Descripción | Entorno Local Actual | Producción Futura (Ejemplo) |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Entorno de ejecución | `development` | `production` |
| `PORT` | Puerto de escucha | `4000` | `4000` |
| `FRONTEND_URL` | Origen permitido CORS | `http://localhost:3000` | `https://tidesk.undc.edu.pe` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://postgres:***@localhost:5432/tidesk_db` | `postgresql://user:***@ep-***.neon.tech/tidesk_db?sslmode=require` |
| `JWT_SECRET` | Clave secreta firma JWT | Secreto local | Clave criptográfica aleatoria de 64 caracteres |
| `STORAGE_DRIVER` | Driver de almacenamiento | `local` | `s3` |
| `SMTP_ENABLED` | Servidor de correo real | `false` | `true` |
