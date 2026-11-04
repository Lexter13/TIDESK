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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../../prisma/prisma.service");
const profile_builder_helper_1 = require("../../common/helpers/profile-builder.helper");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const { correo, password } = loginDto;
        const user = await this.prisma.usuario.findUnique({
            where: { correo },
            include: {
                rol: true,
                sede: true,
                area: true,
                facultad: true,
                carrera: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
        }
        if (!user.estado) {
            throw new common_1.UnauthorizedException('La cuenta se encuentra inactiva. Contacte al Administrador.');
        }
        const isMatch = await argon2.verify(user.passwordHash, password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
        }
        await this.prisma.usuario.update({
            where: { idUsuario: user.idUsuario },
            data: { ultimoAcceso: new Date() },
        });
        const payload = {
            sub: user.idUsuario,
            email: user.correo,
            role: user.rol.nombre,
            nombres: user.nombres,
            apellidos: user.apellidos,
        };
        const token = this.jwtService.sign(payload);
        return {
            accessToken: token,
            user: {
                idUsuario: user.idUsuario,
                codigo: user.codigo,
                nombres: user.nombres,
                apellidos: user.apellidos,
                nombreCompleto: `${user.nombres} ${user.apellidos}`,
                correo: user.correo,
                telefono: user.telefono,
                rol: user.rol.nombre,
                idRol: user.idRol,
                sede: user.sede?.nombre,
                area: user.area?.nombre,
                facultad: user.facultad?.nombre,
                carrera: user.carrera?.nombre,
                ultimoAcceso: user.ultimoAcceso,
            },
        };
    }
    async getProfile(userId) {
        try {
            return await (0, profile_builder_helper_1.buildUserProfile)(this.prisma, userId);
        }
        catch {
            throw new common_1.UnauthorizedException('Usuario no encontrado.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map