import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sales.schema';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private inventoryService: InventoryService,
  ) { }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Validar stock y calcular totales
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of createSaleDto.items) {
      const product = await this.inventoryService.getProduct(item.product);

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
      const itemTax = itemTotal * (item.taxRate || product.taxRate || 0) / 100;

      subtotal += itemTotal;
      taxAmount += itemTax;
    }

    const total = subtotal + taxAmount;

    // Generar número de factura
    const lastSale = await this.saleModel
      .findOne()
      .sort({ createdAt: -1 });

    const invoiceNumber = `FAC-${(lastSale ? parseInt(lastSale.invoiceNumber.split('-')[1]) + 1 : 1).toString().padStart(6, '0')}`;

    const saleData = {
      ...createSaleDto,
      invoiceNumber,
      date: new Date(),
      subtotal,
      taxAmount,
      total,
      status: 'completed',
      amountPaid: createSaleDto.amountPaid || total,
      changeAmount: (createSaleDto.amountPaid || total) - total,
    };

    const sale = new this.saleModel(saleData);
    const savedSale = await sale.save();

    // Actualizar stock
    for (const item of createSaleDto.items) {
      await this.inventoryService.updateStock(
        item.product,
        {
          quantity: item.quantity,
          type: 'out',
          reason: `Venta ${invoiceNumber}`,
        }
      );
    }

    // Actualizar cliente si existe
    if (createSaleDto.customer) {
      await this.customerModel.findByIdAndUpdate(createSaleDto.customer, {
        $inc: { totalPurchases: total },
        lastPurchaseDate: new Date(),
      });
    }

    return savedSale.populate(['customer', 'items.product', 'createdBy']);
  }

  async findAll(query: any): Promise<{ sales: Sale[]; total: number }> {
    const { page = 1, limit = 10, startDate, endDate, customer, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (customer) filter.customer = customer;
    if (status) filter.status = status;

    const [sales, total] = await Promise.all([
      this.saleModel
        .find(filter)
        .populate('customer')
        .populate('items.product')
        .populate('createdBy')
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .exec(),
      this.saleModel.countDocuments(filter),
    ]);

    return { sales, total };
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleModel
      .findById(id)
      .populate('customer')
      .populate('items.product')
      .populate('createdBy');

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return sale;
  }

  async cancel(id: string, reason: string): Promise<Sale> {
    const sale = await this.findOne(id);

    if (sale.status === 'cancelled') {
      throw new Error('La venta ya está cancelada');
    }

    // Revertir stock de cada item
    for (const item of sale.items) {
      await this.inventoryService.updateStock(
        item.product.toString(),
        {
          quantity: item.quantity,
          type: 'in',
          reason: `Cancelación venta ${sale.invoiceNumber}: ${reason}`,
        }
      );
    }

    // Revertir datos del cliente si existe
    if (sale.customer) {
      await this.customerModel.findByIdAndUpdate(sale.customer, {
        $inc: { totalPurchases: -sale.total },
      });
    }

    sale.status = 'cancelled';
    return (sale as SaleDocument).save();
  }

  async getCustomers(query: any): Promise<{ customers: Customer[]; total: number }> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { identification: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .exec(),
      this.customerModel.countDocuments(filter),
    ]);

    return { customers, total };
  }

  async createCustomer(createCustomerDto: any): Promise<Customer> {
    const customer = new this.customerModel(createCustomerDto);
    return customer.save();
  }

  async getDailyReport(query: any): Promise<any> {
    const { date } = query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const sales = await this.saleModel.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed',
    }).populate('items.product');

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = sales.reduce((sum, sale) =>
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    const salesByPaymentMethod = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
      return acc;
    }, {});

    const topProducts = this.calculateTopProducts(sales);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalSales,
      totalItems,
      numberOfSales: sales.length,
      averageSale: sales.length > 0 ? totalSales / sales.length : 0,
      salesByPaymentMethod,
      topProducts,
    };
  }

  private calculateTopProducts(sales: Sale[]): any[] {
    const productSales = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            product: item.product,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.total;
      });
    });

    return Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }
}