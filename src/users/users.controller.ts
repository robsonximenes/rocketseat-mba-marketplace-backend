import { Body, Controller, Get, Patch, Post, UseGuards, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema, CreateUserDto } from './dto/create-user.dto';
import { updateUserSchema, UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(@CurrentUser() user: any, @Body() body: UpdateUserDto) {
    return this.usersService.update(user.sub, body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) {
    return this.usersService.findProfile(user.sub);
  }
}
