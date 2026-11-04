import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador', 'Coordinador TI', 'Técnico TI')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Obtener métricas analíticas consolidadas de tickets, SLA y CSAT' })
  async getAnalytics(@Query() query: any) {
    return this.reportsService.getAnalytics(query);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar consolidado de tickets a Excel (.xlsx) con formato institucional' })
  async exportExcel(@Res() res: Response, @Query() query: any) {
    return this.reportsService.exportExcel(res, query);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar tickets en formato CSV compatible con hojas de cálculo' })
  async exportCsv(@Res() res: Response, @Query() query: any) {
    return this.reportsService.exportCsv(res, query);
  }
}
