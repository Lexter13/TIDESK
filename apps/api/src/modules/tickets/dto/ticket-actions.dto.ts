import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ example: 3, description: 'ID del nuevo estado' })
  @IsInt()
  idEstado: number;

  @ApiProperty({ example: 'Se inicia atención técnica en sitio.', required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class AssignTicketDto {
  @ApiProperty({ example: 3, description: 'ID del especialista a asignar' })
  @IsInt()
  idEspecialista: number;

  @ApiProperty({ example: 'Asignación por especialidad en redes.', required: false })
  @IsOptional()
  @IsString()
  motivoReasignacion?: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Se realizó reinicio del equipo y prueba de ping.' })
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  comentario: string;

  @ApiProperty({ example: false, default: false, description: 'Si es true, solo técnicos y coordinadores pueden verlo' })
  @IsOptional()
  @IsBoolean()
  comentarioInterno?: boolean;
}

export class ResolveTicketDto {
  @ApiProperty({ example: 'Se reemplazó cable de red dañado y se comprobó enlace gigabit a 1000 Mbps.' })
  @IsString()
  @IsNotEmpty({ message: 'La solución técnica es requerida para resolver el ticket' })
  solucion: string;
}

export class SubmitSurveyDto {
  @ApiProperty({ example: 5, description: 'Calificación del servicio (1 a 5 estrellas)' })
  @IsInt()
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(5, { message: 'La calificación máxima es 5' })
  calificacion: number;

  @ApiProperty({ example: 'Excelente y rápida atención del equipo técnico.', required: false })
  @IsOptional()
  @IsString()
  comentario?: string;
}

export class ApproveCrqDto {
  @ApiProperty({ example: 'APROBADO', enum: ['APROBADO', 'RECHAZADO'] })
  @IsString()
  @IsNotEmpty()
  estadoAprobacion: string;

  @ApiProperty({ example: 'Ventana de mantenimiento aprobada por no coincidir con exámenes.', required: false })
  @IsOptional()
  @IsString()
  comentario?: string;
}
