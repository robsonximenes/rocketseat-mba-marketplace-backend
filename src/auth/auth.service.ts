import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) throw new UnauthorizedException('Credenciais inválidas');

    return user;
  }

  async login(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwt.sign(payload);
  }
}
