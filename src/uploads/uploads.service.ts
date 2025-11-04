import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async createImageRecord(url: string) {
    return this.prisma.productImage.create({
      data: { url },
    });
  }
}
