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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminPassword = verifyAdminPassword;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
async function verifyAdminPassword(prisma, adminUserId, passwordPlain) {
    if (!passwordPlain || typeof passwordPlain !== 'string') {
        throw new common_1.UnauthorizedException('Se requiere la contraseña de confirmación del administrador.');
    }
    const admin = await prisma.usuario.findUnique({
        where: { idUsuario: adminUserId },
        include: { rol: true },
    });
    if (!admin || !admin.estado) {
        throw new common_1.UnauthorizedException('Cuenta de administrador no encontrada o inactiva.');
    }
    if (admin.rol?.nombre !== 'Administrador') {
        throw new common_1.ForbiddenException('Acceso denegado: Se requiere el rol de Administrador General.');
    }
    const isValid = await argon2.verify(admin.passwordHash, passwordPlain);
    if (!isValid) {
        throw new common_1.UnauthorizedException('La contraseña de confirmación es incorrecta.');
    }
}
//# sourceMappingURL=password-verifier.helper.js.map