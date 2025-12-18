import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InventoryMovement, InventoryMovementDocument } from './schemas/inventory-movement.schema';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(InventoryMovement.name) private movementModel: Model<InventoryMovementDocument>,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {}

  // Product methods
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productModel.findOne({
      $or: [
        { code: createProductDto.code },
        { barcode: createProductDto.barcode }
      ]
    });

    if (existingProduct) {
      throw new Error('El código o código de barras ya existe');
    }

    const product = new this.productModel(createProductDto);
    return (product as ProductDocument).save();
  }

  async getProducts(query: any): Promise<{ products: Product[]; total: number }> {
    const { page = 1, limit = 10, search, category, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (status) filter.status = status;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category')
        .populate('supplier')
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .populate('supplier');
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    
    return product;
  }

  async updateProduct(id: string, updateProductDto: any): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('category')
      .populate('supplier');
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Producto no encontrado');
    }
  }

  async updateStock(productId: string, updateStockDto: UpdateStockDto): Promise<Product> {
    const product = await this.getProduct(productId);
    
    let newStock = product.stock;
    if (updateStockDto.type === 'in') {
      newStock += updateStockDto.quantity;
    } else if (updateStockDto.type === 'out') {
      newStock -= updateStockDto.quantity;
      if (newStock < 0) {
        throw new Error('Stock insuficiente');
      }
    } else {
      newStock = updateStockDto.quantity;
    }

    // Registrar movimiento
    const movement = new this.movementModel({
      product: productId,
      type: updateStockDto.type,
      quantity: updateStockDto.quantity,
      previousStock: product.stock,
      newStock,
      reason: updateStockDto.reason,
      reference: updateStockDto.reference,
      unitCost: updateStockDto.unitCost,
      totalCost: updateStockDto.unitCost ? updateStockDto.unitCost * updateStockDto.quantity : undefined,
      date: new Date(),
    });
    await movement.save();

    // Actualizar producto
    product.stock = newStock;
    
    if (updateStockDto.type === 'in') {
      product.totalPurchased += updateStockDto.quantity;
    } else if (updateStockDto.type === 'out') {
      product.totalSold += updateStockDto.quantity;
    }

    return (product as ProductDocument).save();
  }

  async getProductKardex(productId: string, query: any): Promise<InventoryMovement[]> {
    const { startDate, endDate } = query;
    const dateFilter: any = { product: productId };

    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.movementModel
      .find(dateFilter)
      .populate('user')
      .sort({ date: -1 })
      .exec();
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async createCategory(createCategoryDto: any): Promise<Category> {
    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productModel
      .find({
        stock: { $lte: { $min: ['$minStock', { $multiply: ['$minStock', 1.1] }] } }
      })
      .populate('category')
      .exec();
  }

  async getMovements(query: any): Promise<{ movements: InventoryMovement[]; total: number }> {
    const { page = 1, limit = 10, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (type) filter.type = type;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [movements, total] = await Promise.all([
      this.movementModel
        .find(filter)
        .populate('product')
        .populate('user')
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .exec(),
      this.movementModel.countDocuments(filter),
    ]);

    return { movements, total };
  }
}