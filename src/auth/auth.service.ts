import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
        patient:
          dto.role === 'PATIENT'
            ? {
                create: {
                  email: dto.email,
                  name: dto.name,
                  homePhone: dto.phone,
                  medicalHistory: dto.medicalHistory,
                  dateOfBirth: new Date(dto.birthDate),
                },
              }
            : undefined,
      },
      include: {
        patient: true,
      },
    });
    delete user.password;
    return user;
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await this.comparePasswords(
      dto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.email, user.role);
  }

  async changePassword(userId: string, dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatch = await this.comparePasswords(
      dto.currentPassword,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await this.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password updated successfully' };
  }

  private async signToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    return {
      access_token: token,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
