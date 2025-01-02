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

// Enum for Marital Status
export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  PARTNER = 'PARTNER',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

// DTO for Next of Kin
export class NextOfKinDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsPhoneNumber()
  homePhone?: string;

  @IsOptional()
  @IsPhoneNumber()
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
  @IsPhoneNumber()
  homePhone?: string;

  @IsOptional()
  @IsPhoneNumber()
  cellPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsDate()
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
