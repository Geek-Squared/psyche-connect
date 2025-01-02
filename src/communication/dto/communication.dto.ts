// src/communication/dto/communication.dto.ts
import { IsString, IsBoolean, IsEnum, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum CommunicationType {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export class CommunicationDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  patientId: string;

  @IsEnum(CommunicationType)
  type: CommunicationType;

  @IsString()
  message: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  sentAt?: Date;

  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;
}
