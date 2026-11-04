import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@undc.edu.pe', description: 'Correo institucional del usuario' })
  @IsEmail({}, { message: 'El correo debe tener un formato válido institucional' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @ApiProperty({ example: 'Admin2026!', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe contener al menos 6 caracteres' })
  password: string;
}
