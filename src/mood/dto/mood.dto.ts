import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class MoodEntryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  patientId: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  mood: string;

  @IsOptional()
  @IsString()
  journal?: string;
}
