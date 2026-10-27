import { Injectable, Logger, ConflictException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterSupplierDto, LoginSupplierDto, UpdateSupplierProfileDto } from './dto/supplier.dto';
import * as bcrypt from 'bcrypt';

export interface SupplierInventoryItem {
  inventoryId: string;
  supplierId: string;
  title: string;
  category: 'HOTEL' | 'BUS' | 'ACTIVITY' | 'RESTAURANT';
  basePriceInr: number;
  availableCapacity: number;
  approvalStatus: 'AUTO_PUBLISHED' | 'PENDING_ADMIN_REVIEW' | 'APPROVED';
  createdAt: string;
}

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  private readonly mockInventoryStore = new Map<string, SupplierInventoryItem[]>([
    ['supp_001', [
      { inventoryId: 'inv_101', supplierId: 'supp_001', title: 'Deluxe Sea View Room', category: 'HOTEL', basePriceInr: 3500, availableCapacity: 10, approvalStatus: 'APPROVED', createdAt: '2026-03-10T10:00:00Z' },
      { inventoryId: 'inv_102', supplierId: 'supp_001', title: 'Executive Suite', category: 'HOTEL', basePriceInr: 6500, availableCapacity: 4, approvalStatus: 'APPROVED', createdAt: '2026-03-10T10:00:00Z' },
    ]],
    ['supp_002', [
      { inventoryId: 'inv_201', supplierId: 'supp_002', title: 'Ahmedabad - Somnath AC Sleeper Bus', category: 'BUS', basePriceInr: 850, availableCapacity: 32, approvalStatus: 'APPROVED', createdAt: '2026-03-12T11:00:00Z' },
    ]],
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerSupplier(dto: RegisterSupplierDto) {
    const companyName = dto.companyName || dto.businessName || 'Supplier Partner';
    const phone = dto.phoneNumber || dto.phone || '';

    this.logger.log(`[SuppliersService] Registering supplier: ${dto.email} (${companyName})`);

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { supplier: true },
    });

    if (user && user.supplier) {
      throw new ConflictException('A supplier account with this email address already exists.');
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: companyName,
          phoneNumber: phone || null,
          role: 'SUPPLIER',
          status: 'ACTIVE',
          isEmailVerified: true,
        },
        include: { supplier: true },
      });
    } else {
      // User exists as customer/other, upgrade role to SUPPLIER
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPPLIER' },
        include: { supplier: true },
      });
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        userId: user.id,
        businessName: companyName,
        legalName: companyName,
        businessType: dto.businessType || 'HOTEL',
        email: dto.email,
        phone: phone,
        city: dto.city || 'Ahmedabad',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
    });

    const payload = {
      email: user.email,
      sub: user.id,
      role: 'SUPPLIER',
      supplierId: supplier.id,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      supplier: {
        id: supplier.id,
        userId: user.id,
        companyName: supplier.businessName,
        businessType: supplier.businessType,
        email: supplier.email,
        phone: supplier.phone,
        city: supplier.city,
        status: supplier.status,
        verificationStatus: supplier.verificationStatus,
        createdAt: supplier.createdAt.toISOString(),
      },
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async loginSupplier(dto: LoginSupplierDto) {
    this.logger.log(`[SuppliersService] Logging in supplier: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { supplier: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.supplier) {
      throw new ForbiddenException('Account is not registered as a supplier');
    }

    const supplier = user.supplier;
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      supplierId: supplier.id,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      supplier: {
        id: supplier.id,
        userId: user.id,
        companyName: supplier.businessName,
        businessType: supplier.businessType,
        email: supplier.email,
        phone: supplier.phone,
        city: supplier.city,
        status: supplier.status,
        verificationStatus: supplier.verificationStatus,
        createdAt: supplier.createdAt.toISOString(),
      },
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async resolveSupplier(supplierIdOrUserId: string) {
    if (!supplierIdOrUserId) return null;

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(supplierIdOrUserId);
    if (!isUuid) {
      return null;
    }

    // 1. Try finding by supplier ID
    let supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierIdOrUserId },
    });

    // 2. If not found, try finding by userId
    if (!supplier) {
      supplier = await this.prisma.supplier.findUnique({
        where: { userId: supplierIdOrUserId },
      });
    }

    return supplier;
  }

  async getSupplierProfile(userIdOrSupplierId: string) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);

    if (supplier) {
      return {
        id: supplier.id,
        userId: supplier.userId,
        companyName: supplier.businessName,
        legalName: supplier.legalName,
        businessType: supplier.businessType,
        description: supplier.description,
        email: supplier.email,
        phone: supplier.phone,
        website: supplier.website,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        country: supplier.country,
        status: supplier.status,
        verificationStatus: supplier.verificationStatus,
        createdAt: supplier.createdAt.toISOString(),
        updatedAt: supplier.updatedAt.toISOString(),
      };
    }

    // Legacy mock profile fallback
    return {
      id: userIdOrSupplierId,
      userId: userIdOrSupplierId,
      companyName: userIdOrSupplierId === 'supp_002' ? 'GSRTC Volvo Express' : 'Lords Inn Somnath Resort',
      legalName: 'Lords Hospitality Pvt Ltd',
      businessType: userIdOrSupplierId === 'supp_002' ? 'BUS' : 'HOTEL',
      email: 'vendor@lordsinn.com',
      phone: '+91 98765 43210',
      city: 'Somnath',
      state: 'Gujarat',
      country: 'India',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      createdAt: new Date().toISOString(),
    };
  }

  async updateSupplierProfile(userIdOrSupplierId: string, dto: UpdateSupplierProfileDto) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);

    if (!supplier) {
      throw new NotFoundException(`Supplier record not found for ${userIdOrSupplierId}`);
    }

    const companyName = dto.companyName || dto.businessName;
    const phone = dto.phoneNumber || dto.phone;

    const updated = await this.prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        ...(companyName && { businessName: companyName }),
        ...(phone && { phone }),
        ...(dto.city && { city: dto.city }),
        ...(dto.gstin && { legalName: `GSTIN: ${dto.gstin}` }),
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      companyName: updated.businessName,
      legalName: updated.legalName,
      businessType: updated.businessType,
      email: updated.email,
      phone: updated.phone,
      city: updated.city,
      status: updated.status,
      verificationStatus: updated.verificationStatus,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async getSupplierDashboard(supplierIdOrUserId: string) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (supplier) {
      // Query database counts for this supplier's isolated inventory
      const [hotelsCount, restaurantsCount, activitiesCount] = await Promise.all([
        this.prisma.hotel.count({ where: { supplierId: supplier.id } }),
        this.prisma.restaurant.count({ where: { supplierId: supplier.id } }),
        this.prisma.activity.count({ where: { supplierId: supplier.id } }),
      ]);

      const mockCount = (this.mockInventoryStore.get(supplier.id) || []).length;
      const totalInventory = hotelsCount + restaurantsCount + activitiesCount + mockCount;

      // Real DB Booking Metrics
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        pendingCount,
        confirmedCount,
        inProgressCount,
        completedCount,
        cancelledCount,
        rejectedCount,
        todayCount,
        upcomingCount,
        totalBookings,
        revenueAggregate,
      ] = await Promise.all([
        this.prisma.booking.count({ where: { supplierId: supplier.id, status: 'PENDING' } }),
        this.prisma.booking.count({ where: { supplierId: supplier.id, status: 'CONFIRMED' } }),
        this.prisma.booking.count({ where: { supplierId: supplier.id, status: 'IN_PROGRESS' } }),
        this.prisma.booking.count({ where: { supplierId: supplier.id, status: 'COMPLETED' } }),
        this.prisma.booking.count({ where: { supplierId: supplier.id, status: 'CANCELLED' } }),
        this.prisma.booking.count({ where: { supplierId: supplier.id, status: 'REJECTED' } }),
        this.prisma.booking.count({ where: { supplierId: supplier.id, createdAt: { gte: todayStart } } }),
        this.prisma.booking.count({
          where: {
            supplierId: supplier.id,
            status: { in: ['PENDING', 'CONFIRMED'] },
            startDate: { gte: new Date() },
          },
        }),
        this.prisma.booking.count({ where: { supplierId: supplier.id } }),
        this.prisma.booking.aggregate({
          where: {
            supplierId: supplier.id,
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
          },
          _sum: { totalAmountInr: true },
        }),
      ]);

      const totalRevenueInr = Number(revenueAggregate._sum.totalAmountInr || 0);

      return {
        supplierId: supplier.id,
        companyName: supplier.businessName,
        businessType: supplier.businessType,
        verificationStatus: supplier.verificationStatus,
        status: supplier.status,
        activeInventoryCount: totalInventory,
        hotelsCount,
        restaurantsCount,
        activitiesCount,
        pendingBookingsCount: pendingCount,
        confirmedBookingsCount: confirmedCount,
        inProgressBookingsCount: inProgressCount,
        completedBookingsCount: completedCount,
        cancelledBookingsCount: cancelledCount,
        rejectedBookingsCount: rejectedCount,
        bookingsTodayCount: todayCount,
        upcomingBookingsCount: upcomingCount,
        totalBookingsCount: totalBookings,
        totalRevenueThisMonthInr: totalRevenueInr,
        pendingSettlementInr: totalRevenueInr * 0.85,
        recentAlerts: [
          `Tenant active with ${totalInventory} inventory listing(s)`,
          pendingCount > 0 ? `${pendingCount} new booking(s) pending your review` : 'All bookings up to date',
        ],
      };
    }

    // Fallback for legacy sandbox supplier IDs
    const mockInventory = this.mockInventoryStore.get(supplierIdOrUserId) || [];
    return {
      supplierId: supplierIdOrUserId,
      companyName: supplierIdOrUserId === 'supp_002' ? 'GSRTC Volvo Express' : 'Lords Inn Somnath Resort',
      verificationStatus: 'APPROVED',
      activeInventoryCount: mockInventory.length,
      pendingBookingsCount: 0,
      confirmedBookingsCount: 0,
      inProgressBookingsCount: 0,
      completedBookingsCount: 0,
      cancelledBookingsCount: 0,
      rejectedBookingsCount: 0,
      bookingsTodayCount: 0,
      upcomingBookingsCount: 0,
      totalBookingsCount: 0,
      totalRevenueThisMonthInr: 0,
      pendingSettlementInr: 0,
      recentAlerts: ['No active database bookings for sandbox supplier ID'],
    };
  }

  async getSupplierInventory(supplierIdOrUserId: string): Promise<SupplierInventoryItem[]> {
    this.logger.log(`[SuppliersService] Fetching isolated tenant inventory for ${supplierIdOrUserId}`);
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    const items: SupplierInventoryItem[] = [];

    if (supplier) {
      // Fetch DB Hotels for this supplier
      const dbHotels = await this.prisma.hotel.findMany({
        where: { supplierId: supplier.id },
      });
      dbHotels.forEach(h => {
        items.push({
          inventoryId: h.id,
          supplierId: supplier.id,
          title: h.name,
          category: 'HOTEL',
          basePriceInr: Number(h.pricePerNight),
          availableCapacity: 10,
          approvalStatus: 'APPROVED',
          createdAt: h.createdAt.toISOString(),
        });
      });

      // Fetch DB Restaurants for this supplier
      const dbRest = await this.prisma.restaurant.findMany({
        where: { supplierId: supplier.id },
      });
      dbRest.forEach(r => {
        items.push({
          inventoryId: r.id,
          supplierId: supplier.id,
          title: r.name,
          category: 'RESTAURANT',
          basePriceInr: Number(r.averageCost),
          availableCapacity: 25,
          approvalStatus: 'APPROVED',
          createdAt: r.createdAt.toISOString(),
        });
      });

      // Fetch DB Activities for this supplier
      const dbAct = await this.prisma.activity.findMany({
        where: { supplierId: supplier.id },
      });
      dbAct.forEach(a => {
        items.push({
          inventoryId: a.id,
          supplierId: supplier.id,
          title: a.title,
          category: 'ACTIVITY',
          basePriceInr: Number(a.priceInr),
          availableCapacity: 15,
          approvalStatus: 'APPROVED',
          createdAt: a.createdAt.toISOString(),
        });
      });

      // Include mock inventory if any
      const mockItems = this.mockInventoryStore.get(supplier.id) || [];
      items.push(...mockItems);

      return items;
    }

    // Fallback for legacy sandbox IDs
    return this.mockInventoryStore.get(supplierIdOrUserId) || [];
  }

  async addInventoryItem(supplierIdOrUserId: string, itemData: Partial<SupplierInventoryItem>): Promise<SupplierInventoryItem> {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);
    const targetId = supplier ? supplier.id : supplierIdOrUserId;

    const inventoryId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newItem: SupplierInventoryItem = {
      inventoryId,
      supplierId: targetId,
      title: itemData.title || 'New Travel Service',
      category: itemData.category || 'HOTEL',
      basePriceInr: itemData.basePriceInr || 2000,
      availableCapacity: itemData.availableCapacity || 10,
      approvalStatus: 'APPROVED',
      createdAt: new Date().toISOString(),
    };

    const current = this.mockInventoryStore.get(targetId) || [];
    current.push(newItem);
    this.mockInventoryStore.set(targetId, current);

    this.logger.log(`[SuppliersService] Added inventory item ${inventoryId} for Supplier ${targetId}`);
    return newItem;
  }

  async updateInventoryPrice(supplierIdOrUserId: string, inventoryId: string, newPriceInr: number): Promise<SupplierInventoryItem> {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);
    const targetId = supplier ? supplier.id : supplierIdOrUserId;

    const current = this.mockInventoryStore.get(targetId) || [];
    const item = current.find(i => i.inventoryId === inventoryId);
    if (item) {
      item.basePriceInr = newPriceInr;
      this.mockInventoryStore.set(targetId, current);
      this.logger.log(`[SuppliersService] Updated price for Inventory ${inventoryId} to ₹${newPriceInr}`);
      return item;
    }

    throw new NotFoundException(`Inventory ${inventoryId} not found for supplier ${targetId}.`);
  }

  // ==========================================
  // 1. HOTEL MANAGEMENT (SUPPLIER-OWNED)
  // ==========================================

  async getSupplierHotels(userIdOrSupplierId: string) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    return this.prisma.hotel.findMany({
      where: { supplierId: supplier.id },
      include: { destination: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSupplierHotel(userIdOrSupplierId: string, dto: any) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    let destination = null;
    if (dto.destinationId) {
      destination = await this.prisma.destination.findUnique({ where: { id: dto.destinationId } });
    }
    if (!destination && dto.destinationSlug) {
      destination = await this.prisma.destination.findUnique({ where: { slug: dto.destinationSlug } });
    }

    if (!destination && dto.city) {
      destination = await this.prisma.destination.findFirst({
        where: { OR: [{ slug: dto.city.toLowerCase() }, { name: { contains: dto.city, mode: 'insensitive' } }] },
      });
    }
    if (!destination) {
      destination = await this.prisma.destination.findFirst();
    }
    if (!destination) {
      throw new NotFoundException(`Destination not found for provided ID/slug.`);
    }

    const slug = `${dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const lat = dto.lat ?? dto.latitude;
    const lng = dto.lng ?? dto.longitude;

    return this.prisma.hotel.create({
      data: {
        destinationId: destination.id,
        supplierId: supplier.id,
        name: dto.name,
        slug,
        description: dto.description || null,
        address: dto.address || null,
        latitude: lat !== undefined && lat !== null ? Number(lat) : null,
        longitude: lng !== undefined && lng !== null ? Number(lng) : null,
        category: dto.category || 'Resort',
        starRating: dto.starRating ? Number(dto.starRating) : 3,
        pricePerNight: Number(dto.pricePerNight),
        currency: dto.currency || 'INR',
        image: dto.image || null,
        amenities: dto.amenities || [],
        isVerified: true,
        status: dto.status || 'ACTIVE',
      },
      include: { destination: true },
    });
  }

  private isValidUuid(id: string): boolean {
    return !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  }

  async getSupplierHotelById(userIdOrSupplierId: string, hotelId: string) {
    if (!this.isValidUuid(hotelId)) {
      throw new NotFoundException(`Hotel with ID '${hotelId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const hotel = await this.prisma.hotel.findFirst({
      where: { id: hotelId, supplierId: supplier.id },
      include: { destination: true },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID '${hotelId}' not found or does not belong to supplier.`);
    }

    return hotel;
  }

  async updateSupplierHotel(userIdOrSupplierId: string, hotelId: string, dto: any) {
    if (!this.isValidUuid(hotelId)) {
      throw new NotFoundException(`Hotel with ID '${hotelId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const hotel = await this.prisma.hotel.findFirst({
      where: { id: hotelId, supplierId: supplier.id },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID '${hotelId}' not found or does not belong to supplier.`);
    }

    const lat = dto.lat ?? dto.latitude;
    const lng = dto.lng ?? dto.longitude;

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(lat !== undefined && { latitude: lat !== null ? Number(lat) : null }),
        ...(lng !== undefined && { longitude: lng !== null ? Number(lng) : null }),
        ...(dto.category && { category: dto.category }),
        ...(dto.starRating !== undefined && { starRating: Number(dto.starRating) }),
        ...(dto.pricePerNight !== undefined && { pricePerNight: Number(dto.pricePerNight) }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.amenities && { amenities: dto.amenities }),
        ...(dto.status && { status: dto.status }),
      },
      include: { destination: true },
    });
  }

  async deleteSupplierHotel(userIdOrSupplierId: string, hotelId: string) {
    if (!this.isValidUuid(hotelId)) {
      throw new NotFoundException(`Hotel with ID '${hotelId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const hotel = await this.prisma.hotel.findFirst({
      where: { id: hotelId, supplierId: supplier.id },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID '${hotelId}' not found or does not belong to supplier.`);
    }

    // Soft-deactivate
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: { status: 'INACTIVE' },
    });
  }

  // ==========================================
  // 2. RESTAURANT MANAGEMENT (SUPPLIER-OWNED)
  // ==========================================

  async getSupplierRestaurants(userIdOrSupplierId: string) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    return this.prisma.restaurant.findMany({
      where: { supplierId: supplier.id },
      include: { destination: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSupplierRestaurant(userIdOrSupplierId: string, dto: any) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    let destination = null;
    if (dto.destinationId) {
      destination = await this.prisma.destination.findUnique({ where: { id: dto.destinationId } });
    }
    if (!destination && dto.destinationSlug) {
      destination = await this.prisma.destination.findUnique({ where: { slug: dto.destinationSlug } });
    }
    if (!destination && dto.city) {
      destination = await this.prisma.destination.findFirst({
        where: { OR: [{ slug: dto.city.toLowerCase() }, { name: { contains: dto.city, mode: 'insensitive' } }] },
      });
    }
    if (!destination) {
      destination = await this.prisma.destination.findFirst();
    }
    if (!destination) {
      throw new NotFoundException(`Destination not found for provided ID/slug.`);
    }

    const slug = `${dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const lat = dto.lat ?? dto.latitude;
    const lng = dto.lng ?? dto.longitude;
    const avgCost = dto.avgCostForTwo ?? dto.averageCost;
    const cuisine = dto.cuisine ?? dto.cuisineType;

    return this.prisma.restaurant.create({
      data: {
        destinationId: destination.id,
        supplierId: supplier.id,
        name: dto.name,
        slug,
        description: dto.description || null,
        address: dto.address || null,
        latitude: lat !== undefined && lat !== null ? Number(lat) : null,
        longitude: lng !== undefined && lng !== null ? Number(lng) : null,
        cuisineType: cuisine || 'Gujarati Kathiyawadi',
        priceRange: dto.priceRange || 'MODERATE',
        averageCost: avgCost ? Number(avgCost) : 500.00,
        currency: dto.currency || 'INR',
        openingTime: dto.openingHours || dto.openingTime || '09:00 AM',
        closingTime: dto.closingHours || dto.closingTime || '11:00 PM',
        image: dto.image || null,
        rating: 4.5,
        isVerified: true,
        status: dto.status || 'ACTIVE',
      },
      include: { destination: true },
    });
  }

  async getSupplierRestaurantById(userIdOrSupplierId: string, restaurantId: string) {
    if (!this.isValidUuid(restaurantId)) {
      throw new NotFoundException(`Restaurant with ID '${restaurantId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, supplierId: supplier.id },
      include: { destination: true },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID '${restaurantId}' not found or does not belong to supplier.`);
    }

    return restaurant;
  }

  async updateSupplierRestaurant(userIdOrSupplierId: string, restaurantId: string, dto: any) {
    if (!this.isValidUuid(restaurantId)) {
      throw new NotFoundException(`Restaurant with ID '${restaurantId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, supplierId: supplier.id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID '${restaurantId}' not found or does not belong to supplier.`);
    }

    const lat = dto.lat ?? dto.latitude;
    const lng = dto.lng ?? dto.longitude;
    const avgCost = dto.avgCostForTwo ?? dto.averageCost;
    const cuisine = dto.cuisine ?? dto.cuisineType;

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(lat !== undefined && { latitude: lat !== null ? Number(lat) : null }),
        ...(lng !== undefined && { longitude: lng !== null ? Number(lng) : null }),
        ...(cuisine && { cuisineType: cuisine }),
        ...(dto.priceRange && { priceRange: dto.priceRange }),
        ...(avgCost !== undefined && { averageCost: Number(avgCost) }),
        ...(dto.openingHours && { openingTime: dto.openingHours }),
        ...(dto.openingTime && { openingTime: dto.openingTime }),
        ...(dto.closingHours && { closingTime: dto.closingHours }),
        ...(dto.closingTime && { closingTime: dto.closingTime }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.status && { status: dto.status }),
      },
      include: { destination: true },
    });
  }

  async deleteSupplierRestaurant(userIdOrSupplierId: string, restaurantId: string) {
    if (!this.isValidUuid(restaurantId)) {
      throw new NotFoundException(`Restaurant with ID '${restaurantId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, supplierId: supplier.id },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID '${restaurantId}' not found or does not belong to supplier.`);
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { status: 'INACTIVE' },
    });
  }

  // ==========================================
  // 3. ACTIVITY MANAGEMENT (SUPPLIER-OWNED)
  // ==========================================

  async getSupplierActivities(userIdOrSupplierId: string) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    return this.prisma.activity.findMany({
      where: { supplierId: supplier.id },
      include: { destination: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSupplierActivity(userIdOrSupplierId: string, dto: any) {
    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    let destination = null;
    if (dto.destinationId) {
      destination = await this.prisma.destination.findUnique({ where: { id: dto.destinationId } });
    }
    if (!destination && dto.destinationSlug) {
      destination = await this.prisma.destination.findUnique({ where: { slug: dto.destinationSlug } });
    }
    if (!destination && dto.city) {
      destination = await this.prisma.destination.findFirst({
        where: { OR: [{ slug: dto.city.toLowerCase() }, { name: { contains: dto.city, mode: 'insensitive' } }] },
      });
    }
    if (!destination) {
      destination = await this.prisma.destination.findFirst();
    }
    if (!destination) {
      throw new NotFoundException(`Destination not found for provided ID/slug.`);
    }

    const title = dto.title || dto.name || 'Activity Experience';
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const lat = dto.lat ?? dto.latitude;
    const lng = dto.lng ?? dto.longitude;
    const price = dto.pricePerPerson ?? dto.priceInr ?? dto.price;

    return this.prisma.activity.create({
      data: {
        destinationId: destination.id,
        supplierId: supplier.id,
        title,
        slug,
        description: dto.description || null,
        category: dto.category || 'General',
        priceInr: Number(price || 500),
        durationMinutes: dto.durationMinutes ? Number(dto.durationMinutes) : 60,
        bestTimeToVisit: dto.bestTimeToVisit || 'Morning / Evening',
        latitude: lat !== undefined && lat !== null ? Number(lat) : null,
        longitude: lng !== undefined && lng !== null ? Number(lng) : null,
        image: dto.image || null,
        isVerified: true,
        status: dto.status || 'ACTIVE',
      },
      include: { destination: true },
    });
  }

  async getSupplierActivityById(userIdOrSupplierId: string, activityId: string) {
    if (!this.isValidUuid(activityId)) {
      throw new NotFoundException(`Activity with ID '${activityId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, supplierId: supplier.id },
      include: { destination: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${activityId}' not found or does not belong to supplier.`);
    }

    return activity;
  }

  async updateSupplierActivity(userIdOrSupplierId: string, activityId: string, dto: any) {
    if (!this.isValidUuid(activityId)) {
      throw new NotFoundException(`Activity with ID '${activityId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, supplierId: supplier.id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${activityId}' not found or does not belong to supplier.`);
    }

    const lat = dto.lat ?? dto.latitude;
    const lng = dto.lng ?? dto.longitude;
    const price = dto.pricePerPerson ?? dto.priceInr;

    return this.prisma.activity.update({
      where: { id: activityId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(price !== undefined && { priceInr: Number(price) }),
        ...(dto.durationMinutes !== undefined && { durationMinutes: Number(dto.durationMinutes) }),
        ...(dto.bestTimeToVisit && { bestTimeToVisit: dto.bestTimeToVisit }),
        ...(lat !== undefined && { latitude: lat !== null ? Number(lat) : null }),
        ...(lng !== undefined && { longitude: lng !== null ? Number(lng) : null }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.status && { status: dto.status }),
      },
      include: { destination: true },
    });
  }

  async deleteSupplierActivity(userIdOrSupplierId: string, activityId: string) {
    if (!this.isValidUuid(activityId)) {
      throw new NotFoundException(`Activity with ID '${activityId}' not found.`);
    }

    const supplier = await this.resolveSupplier(userIdOrSupplierId);
    if (!supplier) {
      throw new ForbiddenException('Supplier account not found');
    }

    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, supplierId: supplier.id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${activityId}' not found or does not belong to supplier.`);
    }

    return this.prisma.activity.update({
      where: { id: activityId },
      data: { status: 'INACTIVE' },
    });
  }
}


