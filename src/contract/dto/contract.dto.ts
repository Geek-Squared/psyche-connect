import { IsString, IsDate, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class ContractDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  patientId: string;

  @IsString()
  terms: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  signedAt?: Date;

  @IsString()
  @IsUrl()
  documentUrl: string;
}
