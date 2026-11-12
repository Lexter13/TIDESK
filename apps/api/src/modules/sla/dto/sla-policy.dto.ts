import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlaPolicyDto {
  @ApiProperty({ example: 'Atención de Baja Prioridad' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la política SLA es requerido.' })
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ example: 4, description: 'ID de la prioridad asociada' })
  @IsInt({ message: 'Debe seleccionar una prioridad válida.' })
  idPrioridad: number;

  @ApiProperty({ example: 1, required: false, description: 'ID del tipo de ticket (opcional)' })
  @IsOptional()
  @IsInt()
  idTipoTicket?: number | null;

  @ApiProperty({ example: 120, description: 'Tiempo máximo de primera respuesta en minutos' })
  @IsInt()
  @Min(1)
  tiempoPrimeraRespuestaMin: number;

  @ApiProperty({ example: 1440, description: 'Tiempo máximo de resolución en minutos' })
  @IsInt()
  @Min(5)
  tiempoResolucionMin: number;
}

export class UpdateSlaPolicyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idPrioridad?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idTipoTicket?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  tiempoPrimeraRespuestaMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  tiempoResolucionMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}

