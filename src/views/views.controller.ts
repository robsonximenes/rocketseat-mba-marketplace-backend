import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ViewsService } from './views.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('views')
export class ViewsController {
  constructor(private viewsService: ViewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async register(@CurrentUser() user: any, @Body('productId') productId: string) {
    return this.viewsService.registerView(user.sub, productId);
  }
}
