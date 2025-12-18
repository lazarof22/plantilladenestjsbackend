import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsArray, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minStock: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxStock: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasExpiry?: boolean;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  images?: string[];
}