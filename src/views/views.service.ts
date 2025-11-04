import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ViewsService {
  constructor(private prisma: PrismaService) {}

  async registerView(userId: string, productId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário inexistente');

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto inexistente');

    if (product.ownerId === userId) throw new BadRequestException('Dono não pode registrar visualização');

    const already = await this.prisma.productView.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (already) throw new BadRequestException('Visualização já registrada');

    return this.prisma.productView.create({
      data: {
        productId,
        userId,
      },
    });
  }
}
