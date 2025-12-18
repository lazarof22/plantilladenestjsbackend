import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    private inventoryService: InventoryService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    // Calcular totales
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of createPurchaseDto.items) {
      const product = await this.inventoryService.getProduct(item.product);
      
      const itemTotal = (item.unitCost * item.quantity) - (item.discount || 0);
      const itemTax = itemTotal * (item.taxRate || product.taxRate || 0) / 100;
      
      subtotal += itemTotal;
      taxAmount += itemTax;
    }

    const total = subtotal + taxAmount;

    // Generar número de compra
    const lastPurchase = await this.purchaseModel
      .findOne()
      .sort({ createdAt: -1 });
    
    const purchaseNumber = `COMP-${(lastPurchase ? parseInt(lastPurchase.purchaseNumber.split('-')[1]) + 1 : 1).toString().padStart(6, '0')}`;

    const purchaseData = {
      ...createPurchaseDto,
      purchaseNumber,
      date: new Date(),
      subtotal,
      taxAmount,
      total,
      status: 'completed',
    };

    const purchase = new this.purchaseModel(purchaseData);
    const savedPurchase = await purchase.save();

    // Actualizar stock
    for (const item of createPurchaseDto.items) {
      await this.inventoryService.updateStock(
        item.product,
        {
          quantity: item.quantity,
          type: 'in',
          reason: `Compra ${purchaseNumber}`,
          unitCost: item.unitCost,
        }
      );
    }

    return savedPurchase.populate(['supplier', 'items.product', 'createdBy']);
  }

  async findAll(query: any): Promise<{ purchases: Purchase[]; total: number }> {
    const { page = 1, limit = 10, startDate, endDate, supplier, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (supplier) filter.supplier = supplier;
    if (status) filter.status = status;

    const [purchases, total] = await Promise.all([
      this.purchaseModel
        .find(filter)
        .populate('supplier')
        .populate('items.product')
        .populate('createdBy')
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .exec(),
      this.purchaseModel.countDocuments(filter),
    ]);

    return { purchases, total };
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchaseModel
      .findById(id)
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy');
    
    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }
    
    return purchase;
  }

  async cancel(id: string, reason: string): Promise<Purchase> {
    const purchase = await this.findOne(id);
    
    if (purchase.status === 'cancelled') {
      throw new Error('La compra ya está cancelada');
    }

    // Revertir stock
    for (const item of purchase.items) {
      await this.inventoryService.updateStock(
        item.product.toString(),
        {
          quantity: item.quantity,
          type: 'out',
          reason: `Cancelación compra ${purchase.purchaseNumber}: ${reason}`,
          unitCost: item.unitCost,
        }
      );
    }

    purchase.status = 'cancelled';
    return (purchase as PurchaseDocument).save();
  }
}