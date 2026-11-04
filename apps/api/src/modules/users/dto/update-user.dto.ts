import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellidos?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idRol?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idSede?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idFacultad?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idCarrera?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  idArea?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
