import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  @ApiOperation({ summary: 'Crear nuevo producto' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.inventoryService.createProduct(createProductDto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Obtener todos los productos' })
  getProducts(@Query() query: any) {
    return this.inventoryService.getProducts(query);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  getProduct(@Param('id') id: string) {
    return this.inventoryService.getProduct(id);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Actualizar producto' })
  updateProduct(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.inventoryService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Eliminar producto' })
  deleteProduct(@Param('id') id: string) {
    return this.inventoryService.deleteProduct(id);
  }

  @Post('products/:id/stock')
  @ApiOperation({ summary: 'Actualizar stock de producto' })
  updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.inventoryService.updateStock(id, updateStockDto);
  }

  @Get('products/:id/kardex')
  @ApiOperation({ summary: 'Obtener kardex de producto' })
  getProductKardex(@Param('id') id: string, @Query() query: any) {
    return this.inventoryService.getProductKardex(id, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  getCategories() {
    return this.inventoryService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Crear nueva categoría' })
  createCategory(@Body() createCategoryDto: any) {
    return this.inventoryService.createCategory(createCategoryDto);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Obtener productos con stock bajo' })
  getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get('movements')
  @ApiOperation({ summary: 'Obtener movimientos de inventario' })
  getMovements(@Query() query: any) {
    return this.inventoryService.getMovements(query);
  }
}