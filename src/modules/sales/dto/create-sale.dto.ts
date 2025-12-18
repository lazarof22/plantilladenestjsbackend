import { IsString, IsNumber, IsArray, IsOptional, IsEnum, Min, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SaleItemDto {
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
  unitPrice: number;

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

export class CreateSaleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customer?: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({ enum: ['cash', 'card', 'transfer', 'credit'] })
  @IsEnum(['cash', 'card', 'transfer', 'credit'])
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
  @IsNumber()
  @Min(0)
  @IsOptional()
  amountPaid?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  paymentDetails?: Record<string, any>;
}