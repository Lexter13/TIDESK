"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = null;
        const host = this.configService.get('SMTP_HOST');
        const port = this.configService.get('SMTP_PORT', 587);
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        if (host && user) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
            this.logger.log(`Servicio de correo conectado a servidor SMTP: ${host}:${port}`);
        }
        else {
            this.logger.log('SMTP no configurado en .env; operando en modo simulador institucional (logs limpios en servidor).');
        }
    }
    async sendMail(to, subject, htmlContent) {
        const fromAddress = this.configService.get('SMTP_FROM', '"Mesa de Ayuda UNDC" <mesadeayuda@undc.edu.pe>');
        this.logger.log(`📧 [NOTIFICACIÓN CORREO UNDC] Destinatario: ${to} | Asunto: "${subject}"`);
        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: fromAddress,
                    to,
                    subject,
                    html: htmlContent,
                });
                this.logger.log(`✓ Correo enviado con éxito a ${to}`);
            }
            catch (err) {
                this.logger.error(`Error al enviar correo vía SMTP a ${to}: ${err.message}`);
            }
        }
    }
    async notifyTicketCreated(ticket) {
        const solicitanteEmail = ticket.solicitante?.correo;
        if (!solicitanteEmail)
            return;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #06285C; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">TIDESK – Mesa de Ayuda</h1>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #FFD21E;">Universidad Nacional de Cañete</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #06285C; font-size: 16px;">Confirmación de Registro de Ticket</h2>
          <p>Estimado(a) <strong>${ticket.solicitante.nombres} ${ticket.solicitante.apellidos}</strong>,</p>
          <p>Su solicitud ha sido registrada exitosamente con el código:</p>
          <div style="background-color: #f4f7fb; border-left: 4px solid #06285C; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #06285C;">${ticket.codigo}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #555;">${ticket.titulo}</p>
          </div>
          <p style="font-size: 13px; color: #666;">
            Nuestro equipo de TI ha sido notificado y se encuentra evaluando su requerimiento conforme a las políticas de servicio.
          </p>
        </div>
        <div style="background-color: #f9f9f9; padding: 12px; text-align: center; font-size: 11px; color: #888;">
          © ${new Date().getFullYear()} Dirección de Tecnologías de la Información – Universidad Nacional de Cañete
        </div>
      </div>
    `;
        await this.sendMail(solicitanteEmail, `[TIDESK] Solicitud Registrada: ${ticket.codigo}`, html);
    }
    async notifyTicketResolved(ticket) {
        const solicitanteEmail = ticket.solicitante?.correo;
        if (!solicitanteEmail)
            return;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #009B60; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">TIDESK – Ticket Resuelto</h1>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #FFD21E;">Universidad Nacional de Cañete</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #009B60; font-size: 16px;">Su ticket ha sido resuelto</h2>
          <p>Estimado(a) <strong>${ticket.solicitante.nombres} ${ticket.solicitante.apellidos}</strong>,</p>
          <p>El ticket <strong>${ticket.codigo}</strong> ha sido atendido por el área de soporte con la siguiente solución:</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #009B60; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534;">${ticket.solucion || 'Atención completada satisfactoriamente.'}</p>
          </div>
          <p style="font-size: 13px; color: #555;">
            Por favor, ingrese al portal de Mesa de Ayuda para responder la breve encuesta de satisfacción y validar el cierre definitivo del caso.
          </p>
        </div>
      </div>
    `;
        await this.sendMail(solicitanteEmail, `[TIDESK] Solicitud Resuelta: ${ticket.codigo}`, html);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map