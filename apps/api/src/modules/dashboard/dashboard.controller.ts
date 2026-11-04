import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener indicadores, gráficos y tickets recientes del Dashboard' })
  @ApiQuery({ name: 'periodo', required: false, enum: ['hoy', '7dias', 'este_mes', 'mes_anterior'] })
  @ApiQuery({ name: 'idTipoTicket', required: false })
  @ApiQuery({ name: 'idPrioridad', required: false })
  @ApiQuery({ name: 'idArea', required: false })
  @ApiQuery({ name: 'idSede', required: false })
  async getStats(@Query() query: any, @CurrentUser() currentUser: any) {
    return this.dashboardService.getStats(query, currentUser);
  }
}
