import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  MEDICAL_AID = 'MEDICAL_AID',
}

export class BillDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  patientId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
