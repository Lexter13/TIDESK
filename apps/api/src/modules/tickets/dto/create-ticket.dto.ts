import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CrqDetalleDto {
  @ApiProperty({ example: 'Mantenimiento Preventivo de Servidores' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  tipoTrabajo: string;

  @ApiProperty({ example: 'Actualización periódica de kernel' })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiProperty({ example: 'Parches de seguridad y reinicio de servicios' })
  @IsOptional()
  @IsString()
  descripcionTecnica?: string;

  @ApiProperty({ example: '2026-10-15', required: false })
  @IsOptional()
  @IsString()
  fechaProgramada?: string;

  @ApiProperty({ example: '22:00:00', required: false })
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiProperty({ example: '23:30:00', required: false })
  @IsOptional()
  @IsString()
  horaFinEstimada?: string;

  @ApiProperty({ example: 'Medio', required: false })
  @IsOptional()
  @IsString()
  impacto?: string;

  @ApiProperty({ example: 'Bajo', required: false })
  @IsOptional()
  @IsString()
  riesgo?: string;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsInt()
  usuariosAfectados?: number;

  @ApiProperty({ example: '1. Notificar. 2. Backup. 3. Aplicar parches.', required: false })
  @IsOptional()
  @IsString()
  planTrabajo?: string;

  @ApiProperty({ example: 'Probar conectividad y servicios web.', required: false })
  @IsOptional()
  @IsString()
  planPruebas?: string;

  @ApiProperty({ example: 'Restaurar snapshot de máquina virtual.', required: false })
  @IsOptional()
  @IsString()
  planReversa?: string;
}

export class CreateTicketDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de ticket (1: REQ, 2: INC, 3: CRQ)' })
  @IsInt()
  idTipoTicket: number;

  @ApiProperty({ example: 'Falla de conectividad en Laboratorio 2' })
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El título no puede superar 200 caracteres' })
  titulo: string;

  @ApiProperty({ example: 'Los equipos de la fila central no tienen acceso a la red.' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción detallada es requerida' })
  descripcion: string;

  @ApiProperty({ example: 1, description: 'ID del área responsable' })
  @IsInt()
  idArea: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  idServicio?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  idCategoria?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  idSubcategoria?: number;

  @ApiProperty({ example: 3, description: 'ID de la prioridad (1: Crítica, 2: Alta, 3: Media, 4: Baja)' })
  @IsInt()
  idPrioridad: number;

  @ApiProperty({ required: false, description: 'ID de solicitante (solo para Coordinador/Admin creando a nombre de otro)' })
  @IsOptional()
  @IsInt()
  idUsuarioSolicitante?: number;

  @ApiProperty({ type: CrqDetalleDto, required: false, description: 'Datos adicionales obligatorios si el ticket es tipo CRQ' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CrqDetalleDto)
  crqDetalle?: CrqDetalleDto;
}
