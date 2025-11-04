import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createProductSchema, CreateProductDto } from './dto/create-product.dto';
import { updateProductSchema, UpdateProductDto } from './dto/update-product.dto';
import { listProductsSchema } from './dto/list-products.dto';
import { ProductStatus } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(listProductsSchema))
  async list(@Query() query: any) {
    const parsed = listProductsSchema.parse(query);
    return this.productsService.list(parsed);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(createProductSchema))
  async create(@CurrentUser() user: any, @Body() body: CreateProductDto) {
    return this.productsService.create(user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateProductSchema))
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(user.sub, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async changeStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { status: ProductStatus }) {
    return this.productsService.changeStatus(user.sub, id, body.status);
  }

  @Get('user/:userId')
  async listByUser(@Param('userId') userId: string, @Query('status') status?: ProductStatus, @Query('q') q?: string) {
    return this.productsService.listByUser(userId, { status, q });
  }
}
