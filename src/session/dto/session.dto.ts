import { IsString, IsOptional, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  patientId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assessmentFiles?: string[];
}
