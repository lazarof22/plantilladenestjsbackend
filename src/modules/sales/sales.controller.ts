import { Controller, Get, Post, Body, Param, UseGuards, Query, Put } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva venta' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ventas' })
  findAll(@Query() query: any) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener venta por ID' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancelar venta' })
  cancel(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.salesService.cancel(id, body.reason);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  getCustomers(@Query() query: any) {
    return this.salesService.getCustomers(query);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  createCustomer(@Body() createCustomerDto: any) {
    return this.salesService.createCustomer(createCustomerDto);
  }

  @Get('reports/daily')
  @ApiOperation({ summary: 'Reporte de ventas diarias' })
  getDailyReport(@Query() query: any) {
    return this.salesService.getDailyReport(query);
  }
}