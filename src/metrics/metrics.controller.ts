import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get('sold')
  sold(@CurrentUser() user: any) {
    return this.metricsService.productsSoldLast30Days(user.sub);
  }

  @Get('available')
  available(@CurrentUser() user: any) {
    return this.metricsService.productsAvailableLast30Days(user.sub);
  }

  @Get('views')
  views(@CurrentUser() user: any) {
    return this.metricsService.viewsLast30Days(user.sub);
  }

  @Get('views-per-day')
  viewsPerDay(@CurrentUser() user: any) {
    return this.metricsService.viewsPerDayLast30Days(user.sub);
  }

  @Get('product/:productId/views-last-7-days')
  productViews(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.metricsService.productViewsLast7Days(productId, user.sub);
  }
}
