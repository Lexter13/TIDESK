import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'TEC-003', required: false })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ example: 'Juan Carlos' })
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  nombres: string;

  @ApiProperty({ example: 'Pérez Gómez' })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  apellidos: string;

  @ApiProperty({ example: 'juan.perez@undc.edu.pe' })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @ApiProperty({ example: 'ClaveSegura2026!' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: '987112233', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: 3, description: 'ID del rol asignado' })
  @IsInt()
  idRol: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  idSede?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  idFacultad?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  idCarrera?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  idArea?: number;
}
