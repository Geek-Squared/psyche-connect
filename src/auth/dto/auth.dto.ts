// src/auth/dto/auth.dto.ts
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Role  } from '@prisma/client';

export class AuthDto {
  // Common fields for both signup and login
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  // Fields specific to signup
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either ADMIN or PATIENT' })
  role?: Role;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @IsOptional()
  @IsString()
  referralSource?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword?: string;
}
