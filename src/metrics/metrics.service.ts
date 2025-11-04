import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';
import { subDays, startOfDay } from 'date-fns';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async userExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário inexistente');
    return user;
  }

  async productsSoldLast30Days(userId: string) {
    await this.userExists(userId);
    const from = subDays(new Date(), 30);
    return this.prisma.product.count({
      where: {
        ownerId: userId,
        status: ProductStatus.SOLD,
        updatedAt: { gte: from },
      },
    });
  }

  async productsAvailableLast30Days(userId: string) {
    await this.userExists(userId);
    const from = subDays(new Date(), 30);
    return this.prisma.product.count({
      where: {
        ownerId: userId,
        status: ProductStatus.AVAILABLE,
        createdAt: { gte: from },
      },
    });
  }

  async viewsLast30Days(userId: string) {
    await this.userExists(userId);
    const from = subDays(new Date(), 30);
    return this.prisma.productView.count({
      where: {
        product: { ownerId: userId },
        createdAt: { gte: from },
      },
    });
  }

  async viewsPerDayLast30Days(userId: string) {
    await this.userExists(userId);
    const from = subDays(new Date(), 30);

    const views = await this.prisma.productView.findMany({
      where: {
        product: { ownerId: userId },
        createdAt: { gte: from },
      },
      select: {
        createdAt: true,
      },
    });

    const byDay: Record<string, number> = {};
    views.forEach((v) => {
      const day = startOfDay(v.createdAt).toISOString();
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return byDay;
  }

  async productViewsLast7Days(productId: string, ownerId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto inexistente');
    if (product.ownerId !== ownerId) throw new NotFoundException('Produto não pertence ao usuário');

    const from = subDays(new Date(), 7);
    return this.prisma.productView.count({
      where: {
        productId,
        createdAt: { gte: from },
      },
    });
  }
}
