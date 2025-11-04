import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string; phone: string; password: string }) {
    const emailExists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) throw new BadRequestException('E-mail já cadastrado');

    const phoneExists = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (phoneExists) throw new BadRequestException('Telefone já cadastrado');

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashed,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async update(userId: string, data: { name?: string; email?: string; phone?: string; password?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (data.email && data.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (emailExists) throw new BadRequestException('E-mail já cadastrado');
    }

    if (data.phone && data.phone !== user.phone) {
      const phoneExists = await this.prisma.user.findUnique({ where: { phone: data.phone } });
      if (phoneExists) throw new BadRequestException('Telefone já cadastrado');
    }

    let password = undefined;
    if (data.password) {
      password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        ...(password ? { password } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário inexistente');
    return user;
  }
}
