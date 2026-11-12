import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos iniciales (Seed) para TIDESK - UNDC...');

  // Limpieza idempotente de transacciones demostrativas previas
  await prisma.encuesta.deleteMany();
  await prisma.comentario.deleteMany();
  await prisma.adjunto.deleteMany();
  await prisma.historialTicket.deleteMany();
  await prisma.ticketSla.deleteMany();
  await prisma.crqAprobacion.deleteMany();
  await prisma.crqDetalle.deleteMany();
  await prisma.asignacion.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.ticket.deleteMany();

  // 1. Sedes
  const sedePrincipal = await prisma.sede.upsert({
    where: { idSede: 1 },
    update: {},
    create: {
      nombre: 'Sede Principal - San Vicente de Cañete',
      direccion: 'Av. Mariscal Benavides 1370, San Vicente de Cañete',
      estado: true,
    },
  });

  const sedeSantaRita = await prisma.sede.upsert({
    where: { idSede: 2 },
    update: {},
    create: {
      nombre: 'Sede Santa Rita - Lunahuaná',
      direccion: 'Carretera Cañete - Yauyos Km 39, Lunahuaná',
      estado: true,
    },
  });

  const sedeImperial = await prisma.sede.upsert({
    where: { idSede: 3 },
    update: {},
    create: {
      nombre: 'Sede Imperial',
      direccion: 'Jr. 28 de Julio 450, Imperial, Cañete',
      estado: true,
    },
  });

  // 2. Facultades
  const facIngenieria = await prisma.facultad.upsert({
    where: { idFacultad: 1 },
    update: {},
    create: {
      nombre: 'Facultad de Ingeniería',
      estado: true,
    },
  });

  const facEmpresariales = await prisma.facultad.upsert({
    where: { idFacultad: 2 },
    update: {},
    create: {
      nombre: 'Facultad de Ciencias Empresariales',
      estado: true,
    },
  });

  const facSociales = await prisma.facultad.upsert({
    where: { idFacultad: 3 },
    update: {},
    create: {
      nombre: 'Facultad de Ciencias Sociales y Humanidades',
      estado: true,
    },
  });

  // 3. Carreras
  const carSistemas = await prisma.carrera.upsert({
    where: { idCarrera: 1 },
    update: {},
    create: {
      idFacultad: facIngenieria.idFacultad,
      nombre: 'Ingeniería de Sistemas',
      estado: true,
    },
  });

  const carCivil = await prisma.carrera.upsert({
    where: { idCarrera: 2 },
    update: {},
    create: {
      idFacultad: facIngenieria.idFacultad,
      nombre: 'Ingeniería Civil',
      estado: true,
    },
  });

  const carAdmin = await prisma.carrera.upsert({
    where: { idCarrera: 3 },
    update: {},
    create: {
      idFacultad: facEmpresariales.idFacultad,
      nombre: 'Administración de Empresas',
      estado: true,
    },
  });

  const carConta = await prisma.carrera.upsert({
    where: { idCarrera: 4 },
    update: {},
    create: {
      idFacultad: facEmpresariales.idFacultad,
      nombre: 'Contabilidad',
      estado: true,
    },
  });

  const carTurismo = await prisma.carrera.upsert({
    where: { idCarrera: 5 },
    update: {},
    create: {
      idFacultad: facSociales.idFacultad,
      nombre: 'Turismo y Hotelería',
      estado: true,
    },
  });

  // 4. Áreas de soporte y atención
  const areaSoporte = await prisma.area.upsert({
    where: { idArea: 1 },
    update: {},
    create: {
      nombre: 'Soporte Técnico y Mesa de Ayuda',
      descripcion: 'Atención a usuarios, diagnóstico de hardware, software y periféricos',
      estado: true,
    },
  });

  const areaRedes = await prisma.area.upsert({
    where: { idArea: 2 },
    update: {},
    create: {
      nombre: 'Redes, Conectividad y Telecomunicaciones',
      descripcion: 'Administración de infraestructura WiFi, switches, routers y fibra óptica',
      estado: true,
    },
  });

  const areaInfra = await prisma.area.upsert({
    where: { idArea: 3 },
    update: {},
    create: {
      nombre: 'Infraestructura de Servidores y Cloud',
      descripcion: 'Gestión de servidores, copias de seguridad, almacenamiento y datacenter',
      estado: true,
    },
  });

  const areaDesarrollo = await prisma.area.upsert({
    where: { idArea: 4 },
    update: {},
    create: {
      nombre: 'Sistemas Académicos y Desarrollo',
      descripcion: 'Mantenimiento del Sistema de Gestión Académica SGA, Moodle y portales web',
      estado: true,
    },
  });

  // 5. Roles
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso total a gestión institucional, catálogos, políticas SLA y auditoría',
      estado: true,
    },
  });

  const rolCoordinador = await prisma.rol.upsert({
    where: { nombre: 'Coordinador TI' },
    update: {},
    create: {
      nombre: 'Coordinador TI',
      descripcion: 'Supervisión de mesa de ayuda, asignación de especialistas, aprobaciones CAB y reportes',
      estado: true,
    },
  });

  const rolTecnico = await prisma.rol.upsert({
    where: { nombre: 'Técnico TI' },
    update: {},
    create: {
      nombre: 'Técnico TI',
      descripcion: 'Atención, diagnóstico y resolución de tickets asignados',
      estado: true,
    },
  });

  const rolDocente = await prisma.rol.upsert({
    where: { nombre: 'Docente' },
    update: {},
    create: {
      nombre: 'Docente',
      descripcion: 'Solicitante docente con acceso a creación de requerimientos e incidentes',
      estado: true,
    },
  });

  const rolEstudiante = await prisma.rol.upsert({
    where: { nombre: 'Estudiante' },
    update: {},
    create: {
      nombre: 'Estudiante',
      descripcion: 'Solicitante estudiante con acceso a mesa de ayuda para servicios académicos',
      estado: true,
    },
  });

  const rolAdministrativo = await prisma.rol.upsert({
    where: { nombre: 'Administrativo' },
    update: {},
    create: {
      nombre: 'Administrativo',
      descripcion: 'Personal administrativo de facultades y direcciones universitarias',
      estado: true,
    },
  });

  // 6. Tipos de Ticket
  const tipoReq = await prisma.tipoTicket.upsert({
    where: { codigo: 'REQ' },
    update: {},
    create: {
      codigo: 'REQ',
      nombre: 'Requerimiento de Servicio',
      descripcion: 'Solicitud de provisión de servicios estándar de TI (cuentas, accesos, software, equipos)',
      estado: true,
    },
  });

  const tipoInc = await prisma.tipoTicket.upsert({
    where: { codigo: 'INC' },
    update: {},
    create: {
      codigo: 'INC',
      nombre: 'Incidente Tecnológico',
      descripcion: 'Interrupción o degradación no planificada de un servicio institucional',
      estado: true,
    },
  });

  const tipoCrq = await prisma.tipoTicket.upsert({
    where: { codigo: 'CRQ' },
    update: {},
    create: {
      codigo: 'CRQ',
      nombre: 'Solicitud de Cambio',
      descripcion: 'Trabajo programado, mantenimiento de infraestructura o modificación controlada',
      estado: true,
    },
  });

  // 7. Prioridades
  const prioCritica = await prisma.prioridad.upsert({
    where: { idPrioridad: 1 },
    update: {},
    create: {
      nombre: 'Crítica',
      nivel: 1,
      descripcion: 'Impacto total en servicios institucionales esenciales o campus completo',
      estado: true,
    },
  });

  const prioAlta = await prisma.prioridad.upsert({
    where: { idPrioridad: 2 },
    update: {},
    create: {
      nombre: 'Alta',
      nivel: 2,
      descripcion: 'Afecta a departamentos o facultades completas sin alternativa de contingencia',
      estado: true,
    },
  });

  const prioMedia = await prisma.prioridad.upsert({
    where: { idPrioridad: 3 },
    update: {},
    create: {
      nombre: 'Media',
      nivel: 3,
      descripcion: 'Problema localizado que afecta a varios usuarios pero permite operación parcial',
      estado: true,
    },
  });

  const prioBaja = await prisma.prioridad.upsert({
    where: { idPrioridad: 4 },
    update: {},
    create: {
      nombre: 'Baja',
      nivel: 4,
      descripcion: 'Duda, consulta o requerimiento individual sin urgencia operativa',
      estado: true,
    },
  });

  // 8. Estados
  const estadosData = [
    { id: 1, nombre: 'Pendiente', desc: 'Ticket registrado a la espera de asignación y evaluación' },
    { id: 2, nombre: 'Asignado', desc: 'Especialista asignado responsable de la atención' },
    { id: 3, nombre: 'En atención', desc: 'Atención técnica en curso por el especialista' },
    { id: 4, nombre: 'En espera', desc: 'Pausado por espera de información del usuario o repuestos' },
    { id: 5, nombre: 'Resuelto', desc: 'Solución aplicada y documentada por el técnico' },
    { id: 6, nombre: 'Cerrado', desc: 'Confirmación final por el solicitante o por política de cierre' },
    { id: 7, nombre: 'Rechazado', desc: 'Solicitud no procedente o duplicada' },
    { id: 8, nombre: 'Cancelado', desc: 'Cancelado por el solicitante antes del inicio de atención' },
  ];

  for (const est of estadosData) {
    await prisma.estado.upsert({
      where: { idEstado: est.id },
      update: {},
      create: {
        idEstado: est.id,
        nombre: est.nombre,
        descripcion: est.desc,
        estado: true,
      },
    });
  }

  // 9. Categorías y Subcategorías
  const catAulaVirtual = await prisma.categoria.upsert({
    where: { idCategoria: 1 },
    update: {},
    create: {
      nombre: 'Aula Virtual (Moodle)',
      descripcion: 'Plataforma educativa institucional y recursos de docencia virtual',
      estado: true,
    },
  });

  const catCorreo = await prisma.categoria.upsert({
    where: { idCategoria: 2 },
    update: {},
    create: {
      nombre: 'Correo Institucional (Microsoft 365)',
      descripcion: 'Cuentas @undc.edu.pe, Teams, OneDrive y servicios ofimáticos',
      estado: true,
    },
  });

  const catLaboratorio = await prisma.categoria.upsert({
    where: { idCategoria: 3 },
    update: {},
    create: {
      nombre: 'Equipos y Laboratorios de Cómputo',
      descripcion: 'PCs, estaciones de trabajo, impresoras y periféricos de laboratorios',
      estado: true,
    },
  });

  const catRedes = await prisma.categoria.upsert({
    where: { idCategoria: 4 },
    update: {},
    create: {
      nombre: 'Redes y Conectividad WiFi',
      descripcion: 'Puntos de acceso WiFi institucional, cableado estructurado e internet',
      estado: true,
    },
  });

  const catSga = await prisma.categoria.upsert({
    where: { idCategoria: 5 },
    update: {},
    create: {
      nombre: 'Sistemas Académicos (SGA)',
      descripcion: 'Gestión de matrículas, actas de notas, constancias y mesa de partes digital',
      estado: true,
    },
  });

  // Subcategorías
  await prisma.subcategoria.upsert({
    where: { idSubcategoria: 1 },
    update: {},
    create: {
      idCategoria: catAulaVirtual.idCategoria,
      nombre: 'Acceso y contraseña Moodle',
      descripcion: 'Restablecimiento de acceso al aula virtual',
      estado: true,
    },
  });

  await prisma.subcategoria.upsert({
    where: { idSubcategoria: 2 },
    update: {},
    create: {
      idCategoria: catCorreo.idCategoria,
      nombre: 'Creación de cuenta institucional',
      descripcion: 'Alta de credenciales para nuevos docentes y administrativos',
      estado: true,
    },
  });

  await prisma.subcategoria.upsert({
    where: { idSubcategoria: 3 },
    update: {},
    create: {
      idCategoria: catLaboratorio.idCategoria,
      nombre: 'Instalación de software especializado',
      descripcion: 'Programas de ingeniería, licencias y software estadístico',
      estado: true,
    },
  });

  await prisma.subcategoria.upsert({
    where: { idSubcategoria: 4 },
    update: {},
    create: {
      idCategoria: catRedes.idCategoria,
      nombre: 'Falla de cobertura WiFi',
      descripcion: 'Intermitencia o falta de señal en aulas y pabellones',
      estado: true,
    },
  });

  await prisma.subcategoria.upsert({
    where: { idSubcategoria: 5 },
    update: {},
    create: {
      idCategoria: catSga.idCategoria,
      nombre: 'Cierre y rectificación de actas',
      descripcion: 'Problemas en consolidación de actas finales docentes',
      estado: true,
    },
  });

  // 10. Servicios de TI
  const srvCuenta = await prisma.servicio.upsert({
    where: { idServicio: 1 },
    update: {},
    create: {
      idArea: areaSoporte.idArea,
      nombre: 'Habilitación de cuenta y buzón institucional',
      descripcion: 'Generación de credenciales oficiales para la comunidad universitaria',
      estado: true,
    },
  });

  const srvSw = await prisma.servicio.upsert({
    where: { idServicio: 2 },
    update: {},
    create: {
      idArea: areaSoporte.idArea,
      nombre: 'Instalación y soporte de software licenciado',
      descripcion: 'Despliegue de herramientas docentes y paquetes informáticos',
      estado: true,
    },
  });

  const srvWifi = await prisma.servicio.upsert({
    where: { idServicio: 3 },
    update: {},
    create: {
      idArea: areaRedes.idArea,
      nombre: 'Mantenimiento de conectividad inalámbrica y cableada',
      descripcion: 'Revisión técnica de puntos de red y switches en pabellones',
      estado: true,
    },
  });

  // 11. Políticas SLA (minutos)
  await prisma.politicaSla.upsert({
    where: { idSla: 1 },
    update: {},
    create: {
      idSla: 1,
      idTipoTicket: tipoInc.idTipoTicket,
      idPrioridad: prioCritica.idPrioridad,
      nombre: 'Incidente Crítico Institucional',
      tiempoPrimeraRespuestaMin: 15,
      tiempoResolucionMin: 120, // 2 horas
      estado: true,
    },
  });

  await prisma.politicaSla.upsert({
    where: { idSla: 2 },
    update: {},
    create: {
      idSla: 2,
      idTipoTicket: tipoInc.idTipoTicket,
      idPrioridad: prioAlta.idPrioridad,
      nombre: 'Incidente de Alta Prioridad',
      tiempoPrimeraRespuestaMin: 30,
      tiempoResolucionMin: 240, // 4 horas
      estado: true,
    },
  });

  await prisma.politicaSla.upsert({
    where: { idSla: 3 },
    update: {},
    create: {
      idSla: 3,
      idTipoTicket: tipoReq.idTipoTicket,
      idPrioridad: prioMedia.idPrioridad,
      nombre: 'Requerimiento Estándar',
      tiempoPrimeraRespuestaMin: 60,
      tiempoResolucionMin: 960, // 16 horas laborales (2 días)
      estado: true,
    },
  });

  await prisma.politicaSla.upsert({
    where: { idSla: 4 },
    update: {},
    create: {
      idSla: 4,
      idTipoTicket: tipoReq.idTipoTicket,
      idPrioridad: prioBaja.idPrioridad,
      nombre: 'Atención de Baja Prioridad',
      tiempoPrimeraRespuestaMin: 120,
      tiempoResolucionMin: 1440, // 24 horas
      estado: true,
    },
  });

  // 12. Usuarios del Sistema con contraseñas Argon2id
  const passAdmin = await argon2.hash('Admin2026!');
  const passCoord = await argon2.hash('Coord2026!');
  const passTecnico = await argon2.hash('Tecnico2026!');
  const passUser = await argon2.hash('Usuario2026!');

  const userAdmin = await prisma.usuario.upsert({
    where: { correo: 'admin@undc.edu.pe' },
    update: {},
    create: {
      codigo: 'ADM-001',
      nombres: 'Administrador',
      apellidos: 'General TI',
      correo: 'admin@undc.edu.pe',
      passwordHash: passAdmin,
      telefono: '987654321',
      idRol: rolAdmin.idRol,
      idSede: sedePrincipal.idSede,
      idArea: areaSoporte.idArea,
      estado: true,
    },
  });

  const userCoord = await prisma.usuario.upsert({
    where: { correo: 'coordinador.ti@undc.edu.pe' },
    update: {},
    create: {
      codigo: 'CRD-001',
      nombres: 'Carlos',
      apellidos: 'Vargas Mendoza',
      correo: 'coordinador.ti@undc.edu.pe',
      passwordHash: passCoord,
      telefono: '987654322',
      idRol: rolCoordinador.idRol,
      idSede: sedePrincipal.idSede,
      idArea: areaSoporte.idArea,
      estado: true,
    },
  });

  const userTecnico1 = await prisma.usuario.upsert({
    where: { correo: 'tecnico.sistemas@undc.edu.pe' },
    update: {},
    create: {
      codigo: 'TEC-001',
      nombres: 'Marlon',
      apellidos: 'Barrientos Farfán',
      correo: 'tecnico.sistemas@undc.edu.pe',
      passwordHash: passTecnico,
      telefono: '987654323',
      idRol: rolTecnico.idRol,
      idSede: sedePrincipal.idSede,
      idArea: areaSoporte.idArea,
      estado: true,
    },
  });

  const userTecnico2 = await prisma.usuario.upsert({
    where: { correo: 'tecnico.redes@undc.edu.pe' },
    update: {},
    create: {
      codigo: 'TEC-002',
      nombres: 'Jorge',
      apellidos: 'Quispe Alvarado',
      correo: 'tecnico.redes@undc.edu.pe',
      passwordHash: passTecnico,
      telefono: '987654324',
      idRol: rolTecnico.idRol,
      idSede: sedePrincipal.idSede,
      idArea: areaRedes.idArea,
      estado: true,
    },
  });

  const userDocente = await prisma.usuario.upsert({
    where: { correo: 'docente.ciencias@undc.edu.pe' },
    update: {},
    create: {
      codigo: 'DOC-20261',
      nombres: 'Mirtha',
      apellidos: 'Ríos Huamán',
      correo: 'docente.ciencias@undc.edu.pe',
      passwordHash: passUser,
      telefono: '987654325',
      idRol: rolDocente.idRol,
      idSede: sedePrincipal.idSede,
      idFacultad: facIngenieria.idFacultad,
      idCarrera: carSistemas.idCarrera,
      estado: true,
    },
  });

  const userEstudiante = await prisma.usuario.upsert({
    where: { correo: 'estudiante.sistemas@undc.edu.pe' },
    update: {},
    create: {
      codigo: 'EST-20262',
      nombres: 'Luis',
      apellidos: 'Alonso Flores',
      correo: 'estudiante.sistemas@undc.edu.pe',
      passwordHash: passUser,
      telefono: '987654326',
      idRol: rolEstudiante.idRol,
      idSede: sedePrincipal.idSede,
      idFacultad: facIngenieria.idFacultad,
      idCarrera: carSistemas.idCarrera,
      estado: true,
    },
  });

  // 13. Inicialización de Secuencias de Tickets
  const anioActual = new Date().getFullYear();
  await prisma.secuenciaTicket.upsert({
    where: { tipoTicket_anio: { tipoTicket: 'REQ', anio: anioActual } },
    update: {},
    create: { tipoTicket: 'REQ', anio: anioActual, ultimoNumero: 2 },
  });

  await prisma.secuenciaTicket.upsert({
    where: { tipoTicket_anio: { tipoTicket: 'INC', anio: anioActual } },
    update: {},
    create: { tipoTicket: 'INC', anio: anioActual, ultimoNumero: 2 },
  });

  await prisma.secuenciaTicket.upsert({
    where: { tipoTicket_anio: { tipoTicket: 'CRQ', anio: anioActual } },
    update: {},
    create: { tipoTicket: 'CRQ', anio: anioActual, ultimoNumero: 1 },
  });

  // 14. Tickets demostrativos iniciales con trazabilidad completa
  // Ticket 1: REQ Resuelto
  const ticketReq1 = await prisma.ticket.upsert({
    where: { codigo: `REQ-${anioActual}-0001` },
    update: {},
    create: {
      codigo: `REQ-${anioActual}-0001`,
      idTipoTicket: tipoReq.idTipoTicket,
      idUsuarioSolicitante: userDocente.idUsuario,
      idArea: areaSoporte.idArea,
      idServicio: srvCuenta.idServicio,
      idCategoria: catCorreo.idCategoria,
      idSubcategoria: 2,
      idPrioridad: prioMedia.idPrioridad,
      idEstado: 5, // Resuelto
      titulo: 'Creación de correo institucional para nuevo docente adscrito',
      descripcion: 'Se solicita la creación de buzón oficial @undc.edu.pe y acceso a Microsoft Teams para el dictado del semestre académico.',
      fechaCreacion: new Date(Date.now() - 3600 * 1000 * 48),
      fechaAsignacion: new Date(Date.now() - 3600 * 1000 * 46),
      fechaInicioAtencion: new Date(Date.now() - 3600 * 1000 * 40),
      fechaResolucion: new Date(Date.now() - 3600 * 1000 * 12),
      solucion: 'Se generaron las credenciales institucionales, buzón configurado en Microsoft 365 y enviadas las pautas de ingreso por mensaje seguro.',
    },
  });

  await prisma.asignacion.create({
    data: {
      idTicket: ticketReq1.idTicket,
      idEspecialista: userTecnico1.idUsuario,
      asignadoPor: userCoord.idUsuario,
      fechaAsignacion: new Date(Date.now() - 3600 * 1000 * 46),
      activo: true,
    },
  });

  await prisma.comentario.create({
    data: {
      idTicket: ticketReq1.idTicket,
      idUsuario: userTecnico1.idUsuario,
      comentario: 'Cuenta provista con éxito. Se validó autenticación multifactor (MFA).',
      comentarioInterno: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 12),
    },
  });

  await prisma.encuesta.create({
    data: {
      idTicket: ticketReq1.idTicket,
      idUsuario: userDocente.idUsuario,
      calificacion: 5,
      comentario: 'Excelente y oportuna atención del especialista.',
    },
  });

  // Ticket 2: INC En atención
  const ticketInc1 = await prisma.ticket.upsert({
    where: { codigo: `INC-${anioActual}-0001` },
    update: {},
    create: {
      codigo: `INC-${anioActual}-0001`,
      idTipoTicket: tipoInc.idTipoTicket,
      idUsuarioSolicitante: userEstudiante.idUsuario,
      idArea: areaRedes.idArea,
      idServicio: srvWifi.idServicio,
      idCategoria: catRedes.idCategoria,
      idSubcategoria: 4,
      idPrioridad: prioAlta.idPrioridad,
      idEstado: 3, // En atención
      titulo: 'Intermitencia y caída de conectividad WiFi en Pabellón B',
      descripcion: 'Los estudiantes del 4to piso no pueden conectarse al punto de acceso UNDC-Estudiantes durante sesiones de laboratorio.',
      fechaCreacion: new Date(Date.now() - 3600 * 1000 * 4),
      fechaAsignacion: new Date(Date.now() - 3600 * 1000 * 3),
      fechaInicioAtencion: new Date(Date.now() - 3600 * 1000 * 2),
    },
  });

  await prisma.asignacion.create({
    data: {
      idTicket: ticketInc1.idTicket,
      idEspecialista: userTecnico2.idUsuario,
      asignadoPor: userCoord.idUsuario,
      fechaAsignacion: new Date(Date.now() - 3600 * 1000 * 3),
      activo: true,
    },
  });

  await prisma.comentario.create({
    data: {
      idTicket: ticketInc1.idTicket,
      idUsuario: userTecnico2.idUsuario,
      comentario: 'Diagnóstico en campo: Access Point AP-PB-402 presenta saturación de DHCP. Reiniciando switch de acceso perimetral.',
      comentarioInterno: true,
      createdAt: new Date(Date.now() - 3600 * 1000 * 2),
    },
  });

  // Ticket 3: INC Pendiente
  await prisma.ticket.upsert({
    where: { codigo: `INC-${anioActual}-0002` },
    update: {},
    create: {
      codigo: `INC-${anioActual}-0002`,
      idTipoTicket: tipoInc.idTipoTicket,
      idUsuarioSolicitante: userDocente.idUsuario,
      idArea: areaDesarrollo.idArea,
      idCategoria: catSga.idCategoria,
      idSubcategoria: 5,
      idPrioridad: prioCritica.idPrioridad,
      idEstado: 1, // Pendiente
      titulo: 'Falla al consolidar actas de notas del semestre en SGA',
      descripcion: 'El sistema emite error 500 al presionar el botón de cierre de notas para el curso de Arquitectura de Computadoras.',
      fechaCreacion: new Date(Date.now() - 3600 * 1000 * 1),
    },
  });

  // Ticket 4: CRQ Gestión de Cambios (Trabajo Programado)
  const ticketCrq1 = await prisma.ticket.upsert({
    where: { codigo: `CRQ-${anioActual}-0001` },
    update: {},
    create: {
      codigo: `CRQ-${anioActual}-0001`,
      idTipoTicket: tipoCrq.idTipoTicket,
      idUsuarioSolicitante: userTecnico1.idUsuario,
      idArea: areaInfra.idArea,
      idPrioridad: prioMedia.idPrioridad,
      idEstado: 1, // Pendiente
      titulo: 'Mantenimiento y actualización de seguridad del Servidor Bastion JETCASH',
      descripcion: 'Actualización periódica de parches del kernel, renovación de certificados TLS y verificación de túneles SSH.',
      fechaCreacion: new Date(Date.now() - 3600 * 1000 * 8),
    },
  });

  const crqDetalle = await prisma.crqDetalle.upsert({
    where: { idTicket: ticketCrq1.idTicket },
    update: {},
    create: {
      idTicket: ticketCrq1.idTicket,
      tipoTrabajo: 'Mantenimiento Preventivo de Servidores',
      motivo: 'Mitigación de vulnerabilidades de seguridad reportadas en el servidor bastión institucional.',
      descripcionTecnica: 'Parcheo de paquetes openssh-server, reinicio de servicios dependientes y auditoría de iptables.',
      fechaProgramada: new Date(),
      horaInicio: '22:00:00',
      horaFinEstimada: '23:30:00',
      impacto: 'Medio (Admin interna 30 min)',
      riesgo: 'Bajo',
      usuariosAfectados: 15,
      planTrabajo: '1. Notificar a coordinadores. 2. Snapshot de VM. 3. Aplicar parches. 4. Validar puertos.',
      planPruebas: 'Comprobar handshake SSH y conectividad a base de datos de producción.',
      planReversa: 'Restaurar snapshot de máquina virtual previo a la intervención.',
    },
  });

  await prisma.crqAprobacion.create({
    data: {
      idCrq: crqDetalle.idCrq,
      idAprobador: userCoord.idUsuario,
      estadoAprobacion: 'PENDIENTE',
      comentario: 'En revisión por el comité de cambios (CAB) antes de la ventana horaria.',
    },
  });

  // Historial de auditoría inicial
  await prisma.historialTicket.create({
    data: {
      idTicket: ticketReq1.idTicket,
      idUsuario: userDocente.idUsuario,
      accion: 'Creación del Ticket',
      campoModificado: 'estado',
      valorAnterior: null,
      valorNuevo: 'Pendiente',
      fecha: ticketReq1.fechaCreacion,
    },
  });

  await prisma.historialTicket.create({
    data: {
      idTicket: ticketReq1.idTicket,
      idUsuario: userCoord.idUsuario,
      accion: 'Asignación de Especialista',
      campoModificado: 'id_especialista',
      valorAnterior: null,
      valorNuevo: `${userTecnico1.nombres} ${userTecnico1.apellidos}`,
      fecha: new Date(Date.now() - 3600 * 1000 * 46),
    },
  });

  await prisma.historialTicket.create({
    data: {
      idTicket: ticketReq1.idTicket,
      idUsuario: userTecnico1.idUsuario,
      accion: 'Resolución del Ticket',
      campoModificado: 'estado',
      valorAnterior: 'En atención',
      valorNuevo: 'Resuelto',
      fecha: new Date(Date.now() - 3600 * 1000 * 12),
    },
  });

  console.log('✅ Carga de Seed completada satisfactoriamente.');
  console.log('---------------------------------------------------------');
  console.log('Credenciales de Acceso Inicial para Pruebas:');
  console.log('1. Administrador: admin@undc.edu.pe       / Admin2026!');
  console.log('2. Coordinador TI: coordinador.ti@undc.edu.pe / Coord2026!');
  console.log('3. Técnico Soporte: tecnico.sistemas@undc.edu.pe / Tecnico2026!');
  console.log('4. Solicitante Docente: docente.ciencias@undc.edu.pe / Usuario2026!');
  console.log('5. Solicitante Alumno: estudiante.sistemas@undc.edu.pe / Usuario2026!');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
