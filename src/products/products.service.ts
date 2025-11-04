import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, data: { title: string; description: string; priceCents: number; categoryId: string; imageIds?: string[] }) {
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) throw new BadRequestException('Usuário inexistente');

    const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new BadRequestException('Categoria inexistente');

    if (data.imageIds && data.imageIds.length > 0) {
      const images = await this.prisma.productImage.findMany({
        where: { id: { in: data.imageIds } },
      });
      if (images.length !== data.imageIds.length) {
        throw new BadRequestException('Imagens inexistentes');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        priceCents: data.priceCents,
        categoryId: data.categoryId,
        ownerId,
      },
    });

    if (data.imageIds && data.imageIds.length > 0) {
      await this.prisma.productImage.updateMany({
        where: { id: { in: data.imageIds } },
        data: { productId: product.id },
      });
    }

    return product;
  }

  async update(ownerId: string, productId: string, data: any) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto inexistente');
    if (product.ownerId !== ownerId) throw new ForbiddenException('Não pode alterar produto de outro usuário');
    if (product.status === ProductStatus.SOLD) throw new BadRequestException('Não pode editar produto já vendido');

    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new BadRequestException('Categoria inexistente');
    }

    if (data.imageIds) {
      const images = await this.prisma.productImage.findMany({
        where: { id: { in: data.imageIds } },
      });
      if (images.length !== data.imageIds.length) throw new BadRequestException('Imagens inexistentes');

      await this.prisma.productImage.updateMany({
        where: { productId: product.id },
        data: { productId: null },
      });
      await this.prisma.productImage.updateMany({
        where: { id: { in: data.imageIds } },
        data: { productId: product.id },
      });
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        description: data.description,
        priceCents: data.priceCents,
        categoryId: data.categoryId,
      },
    });
  }

  async findOne(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        category: true,
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Produto inexistente');
    return product;
  }

  async list(params: { page: number; perPage: number; status?: ProductStatus; q?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.perPage,
        take: params.perPage,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        page: params.page,
        perPage: params.perPage,
        total,
      },
    };
  }

  async listByUser(userId: string, params: { status?: ProductStatus; q?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário inexistente');

    const where: any = { ownerId: userId };
    if (params.status) where.status = params.status;
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async changeStatus(ownerId: string, productId: string, status: ProductStatus) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto inexistente');
    if (product.ownerId !== ownerId) throw new ForbiddenException('Não pode alterar produto de outro usuário');

    if (status === ProductStatus.CANCELED && product.status === ProductStatus.SOLD) {
      throw new BadRequestException('Não pode cancelar produto vendido');
    }

    if (status === ProductStatus.SOLD && product.status === ProductStatus.CANCELED) {
      throw new BadRequestException('Não pode vender produto cancelado');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { status },
    });
  }
}
