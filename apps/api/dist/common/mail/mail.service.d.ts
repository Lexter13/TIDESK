import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, htmlContent: string): Promise<void>;
    notifyTicketCreated(ticket: any): Promise<void>;
    notifyTicketResolved(ticket: any): Promise<void>;
}
