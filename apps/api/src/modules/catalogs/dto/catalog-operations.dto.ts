import { IsNotEmpty, IsOptional, IsString, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSedeDto {
  @ApiProperty({ example: 'Sede San Luis - Cañete' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la sede es requerido.' })
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'Av. Panamericana Sur Km 138, San Luis', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccion?: string;
}

export class CreateAreaDto {
  @ApiProperty({ example: 'Ciberseguridad y Auditoría TI' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del área es requerido.' })
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'Monitoreo de seguridad informática y protección de datos', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  descripcion?: string;
}

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Seguridad de la Información' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido.' })
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ example: 'Incidentes y requerimientos de seguridad digital', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  descripcion?: string;
}

export class CreateSubcategoriaDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Debe seleccionar una categoría válida.' })
  idCategoria: number;

  @ApiProperty({ example: 'Sincronización de calificaciones Moodle' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la subcategoría es requerido.' })
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ example: 'Soporte en integración de notas del aula virtual', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  descripcion?: string;
}

export class CreateServicioDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Debe seleccionar un área responsable válida.' })
  idArea: number;

  @ApiProperty({ example: 'Emisión de certificados digitales institucionales' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del servicio es requerido.' })
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'Provisión y configuración de firma digital para funcionarios', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  descripcion?: string;
}

export class ConfirmPasswordDto {
  @ApiProperty({ description: 'Contraseña actual del Administrador General para confirmar la eliminación' })
  @IsString()
  @IsNotEmpty({ message: 'Debe ingresar su contraseña actual para confirmar la eliminación.' })
  password: string;
}

