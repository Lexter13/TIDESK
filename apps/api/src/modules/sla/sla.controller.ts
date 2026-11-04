import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SlaService } from './sla.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('SLA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get('policies')
  @ApiOperation({ summary: 'Obtener todas las políticas SLA configuradas en el sistema' })
  async getPolicies() {
    return this.slaService.getPolicies();
  }

  @Patch('policies/:id')
  @UseGuards(RolesGuard)
  @Roles('Administrador', 'Coordinador TI')
  @ApiOperation({ summary: 'Actualizar tiempos y parámetros de una política SLA' })
  async updatePolicy(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.slaService.updatePolicy(id, data);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas y porcentaje de cumplimiento de SLA institucional' })
  async getMetrics() {
    return this.slaService.getSlaMetrics();
  }
}
