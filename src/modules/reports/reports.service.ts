import { Injectable } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';
import { InventoryService } from '../inventory/inventory.service';
import { PurchasesService } from '../purchases/purchases.service';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class ReportsService {
  constructor(
    private salesService: SalesService,
    private inventoryService: InventoryService,
    private purchasesService: PurchasesService,
    private accountingService: AccountingService,
  ) {}

  async getDashboardStats() {
    // Implementar estadísticas del dashboard
    const salesReport = await this.salesService.getDailyReport({});
    const lowStockProducts = await this.inventoryService.getLowStockProducts();
    
    return {
      totalSales: salesReport.totalSales,
      totalProducts: 0, // Implementar
      totalCustomers: 0, // Implementar
      lowStockProducts: lowStockProducts.length,
      recentSales: [], // Implementar
      topProducts: salesReport.topProducts,
    };
  }

  async getSalesReport(startDate: string, endDate: string) {
    return this.salesService.getDailyReport({ startDate, endDate });
  }

  async getInventoryReport() {
    const products = await this.inventoryService.getProducts({});
    const totalValue = products.products.reduce((sum, product) => 
      sum + (product.stock * product.purchasePrice), 0);
    
    return {
      totalProducts: products.total,
      totalValue,
      lowStockCount: products.products.filter(p => p.stock <= p.minStock).length,
      outOfStockCount: products.products.filter(p => p.stock === 0).length,
    };
  }
}