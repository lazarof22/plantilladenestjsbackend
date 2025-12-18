import { IsString, IsNumber, IsArray, IsOptional, IsEnum, Min, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PurchaseItemDto {
  @ApiProperty()
  @IsString()
  product: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @ApiProperty({ enum: ['cash', 'credit', 'transfer'] })
  @IsEnum(['cash', 'credit', 'transfer'])
  paymentMethod: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  expectedDelivery?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  paymentTerms?: Record<string, any>;
}