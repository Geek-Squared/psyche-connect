import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaritalStatus } from '@prisma/client';

// DTO for Next of Kin
export class NextOfKinDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  homePhone?: string;

  @IsOptional()
  cellPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}

// DTO for Patient
export class PatientDto {
  // Identifiers
  @IsOptional()
  @IsString()
  id?: string;

  // Personal Information
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  homePhone?: string;

  @IsOptional()
  cellPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsOptional()
  @IsInt()
  age?: number;

  // Medical and Service Details
  @IsOptional()
  @IsString()
  referringDoctor?: string;

  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @IsOptional()
  @IsString()
  reasonForService?: string;

  @IsOptional()
  @IsBoolean()
  isProBono?: boolean;

  // Nested Objects
  @IsOptional()
  @ValidateNested()
  @Type(() => NextOfKinDto)
  nextOfKin?: NextOfKinDto;

  // Audit Fields
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
