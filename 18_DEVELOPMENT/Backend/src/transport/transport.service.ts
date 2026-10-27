import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';
import {
  TransportTypeEnum,
  UniversalTransportSearchInput,
  NormalizedTransportSearchResult,
  NormalizedTransportItem,
  TransportRevalidateInput,
  TransportRevalidateResult,
  TransportBookingRequest,
  TransportBookingResult,
  TransportCancellationRequest,
  TransportCancellationResult,
} from '../providers/interfaces/transport-provider.interface';

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerRegistry: UniversalProviderRegistry,
  ) {}

  async search(input: UniversalTransportSearchInput): Promise<NormalizedTransportSearchResult> {
    if (!input.type || !input.origin || !input.destination) {
      throw new BadRequestException('Origin, destination, and transport type are required for search.');
    }

    const provider = this.providerRegistry.getTransportProvider(input.type);
    const result = await provider.search(input);

    // Audit search asynchronously
    try {
      await this.prisma.transportSearch.create({
        data: {
          transportType: input.type,
          origin: input.origin,
          destination: input.destination,
          departureDate: new Date(input.departureDate || Date.now()),
          returnDate: input.returnDate ? new Date(input.returnDate) : null,
          passengersCount: input.passengers || input.adults || 1,
          cabinClass: input.cabinClass || 'ECONOMY',
          resultCount: result.items.length,
          rawRequest: JSON.stringify(input),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to audit transport search: ${err.message}`);
    }

    return result;
  }

  async getDetails(type: TransportTypeEnum, id: string): Promise<NormalizedTransportItem | null> {
    const provider = this.providerRegistry.getTransportProvider(type);
    const details = await provider.getDetails(id);
    if (!details) {
      throw new NotFoundException(`Transport item '${id}' not found for type '${type}'.`);
    }
    return details;
  }

  async revalidate(input: TransportRevalidateInput, type: TransportTypeEnum): Promise<TransportRevalidateResult> {
    const provider = this.providerRegistry.getTransportProvider(type);
    return await provider.revalidate(input);
  }

  async checkout(request: TransportBookingRequest, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<TransportBookingResult> {
    const provider = this.providerRegistry.getTransportProvider(request.type, request.providerId);

    // 1. Idempotency Check
    const idempotencyKey = request.idempotencyKey || `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const existing = await this.prisma.booking.findUnique({
      where: { idempotencyKey },
      include: { transportDetail: { include: { segments: true, passengers: true } } },
    });

    if (existing && existing.transportDetail) {
      this.logger.log(`[TransportService] Idempotency match found for key '${idempotencyKey}'`);
      return {
        chaloFarvaBookingId: existing.id,
        bookingReference: existing.bookingReference,
        supplierBookingId: existing.transportDetail.supplierReference || undefined,
        pnr: existing.transportDetail.pnr || undefined,
        providerId: existing.transportDetail.providerId,
        providerName: existing.transportDetail.providerName,
        type: existing.transportDetail.transportType as TransportTypeEnum,
        status: existing.status === 'CONFIRMED' ? 'CONFIRMED' : 'BOOKING_PENDING',
        confirmationMode: existing.transportDetail.confirmationMode as 'DIRECT' | 'REQUEST_CONFIRMATION',
        totalPrice: Number(existing.totalAmountInr),
        currency: existing.currency,
        segments: existing.transportDetail.segments.map(s => ({
          segmentOrder: s.segmentOrder,
          carrierCode: s.carrierCode,
          carrierName: s.carrierName,
          flightOrTrainNumber: s.flightOrTrainNumber,
          originCode: s.originCode,
          originName: s.originName,
          destinationCode: s.destinationCode,
          destinationName: s.destinationName,
          departureTime: s.departureTime.toISOString(),
          arrivalTime: s.arrivalTime.toISOString(),
          durationMinutes: s.durationMinutes,
          cabinClass: s.cabinClass || undefined,
          baggageAllowance: s.baggageAllowance || undefined,
          aircraftOrBusType: s.aircraftOrBusType || undefined,
        })),
        passengers: existing.transportDetail.passengers.map(p => ({
          passengerType: p.passengerType as 'ADULT' | 'CHILD' | 'INFANT',
          title: p.title || undefined,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender || undefined,
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toISOString() : undefined,
          nationality: p.nationality || undefined,
          seatNumber: p.seatNumber || undefined,
        })),
        createdAt: existing.createdAt.toISOString(),
        message: 'Idempotent response retrieved.',
      };
    }

    // 2. Revalidate live fare
    const reval = await provider.revalidate({
      transportId: request.transportId,
      passengersCount: request.passengers.length,
      rateKey: request.revalidateKey,
    });

    if (reval.priceChanged && !request.acceptPriceChange) {
      throw new ConflictException({
        errorCode: 'PRICE_CHANGED',
        message: 'Transport fare has changed. Explicit confirmation required.',
        oldFare: reval.oldFare,
        newFare: reval.newFare,
        currency: reval.currency,
      });
    }

    const agreedPrice = request.agreedFare || reval.newFare;
    const taxes = Math.round(agreedPrice * 0.1);
    const serviceFee = 100;
    const totalAmount = agreedPrice + taxes + serviceFee;

    const bookingReference = `CF-${request.type.substring(0, 3)}-${Date.now()}`;

    // 3. Create Master Booking in Database
    const booking = await this.prisma.booking.create({
      data: {
        bookingReference: bookingReference,
        userId: userId,
        bookingType: request.type,
        inventoryType: request.type,
        inventoryId: request.transportId,
        status: 'PAYMENT_PENDING',
        quantity: request.passengers.length,
        adultCount: request.passengers.filter(p => p.passengerType === 'ADULT').length || 1,
        childCount: request.passengers.filter(p => p.passengerType === 'CHILD').length || 0,
        unitPrice: agreedPrice,
        subtotal: agreedPrice,
        taxes: taxes,
        totalAmountInr: totalAmount,
        currency: request.currency || 'INR',
        idempotencyKey: idempotencyKey,
        customerNotes: `Contact: ${request.contactEmail}, Phone: ${request.contactPhone}`,
      },
    });

    // 4. Call Supplier Adapter Booking Method
    let supplierRes: TransportBookingResult;
    try {
      supplierRes = await provider.createBooking({
        ...request,
        agreedFare: totalAmount,
        idempotencyKey: booking.id,
      });
    } catch (err: any) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'FAILED', rejectionReason: err.message },
      });
      throw new BadRequestException(`Supplier booking failed: ${err.message}`);
    }

    // 5. Store Transport Details, Segments, and Passengers
    const details = await this.prisma.transportBookingDetail.create({
      data: {
        bookingId: booking.id,
        transportType: request.type,
        providerId: provider.providerId,
        providerName: provider.providerName,
        supplierReference: supplierRes.supplierBookingId || null,
        pnr: supplierRes.pnr || null,
        originCode: supplierRes.segments[0]?.originCode || 'ORIGIN',
        originName: supplierRes.segments[0]?.originName || 'Origin',
        destinationCode: supplierRes.segments[supplierRes.segments.length - 1]?.destinationCode || 'DEST',
        destinationName: supplierRes.segments[supplierRes.segments.length - 1]?.destinationName || 'Destination',
        departureTime: new Date(supplierRes.segments[0]?.departureTime || Date.now()),
        arrivalTime: new Date(supplierRes.segments[supplierRes.segments.length - 1]?.arrivalTime || Date.now()),
        durationMinutes: supplierRes.segments.reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
        fareClass: supplierRes.segments[0]?.cabinClass || 'ECONOMY',
        seatNumbers: request.passengers.map(p => p.seatNumber).filter(Boolean) as string[],
        boardingPoint: request.boardingPoint || null,
        droppingPoint: request.droppingPoint || null,
        confirmationMode: supplierRes.confirmationMode,
        rawSupplierData: JSON.stringify(supplierRes),
      },
    });

    for (const seg of supplierRes.segments) {
      await this.prisma.transportSegment.create({
        data: {
          transportBookingId: details.id,
          segmentOrder: seg.segmentOrder,
          carrierCode: seg.carrierCode,
          carrierName: seg.carrierName,
          flightOrTrainNumber: seg.flightOrTrainNumber,
          originCode: seg.originCode,
          originName: seg.originName,
          destinationCode: seg.destinationCode,
          destinationName: seg.destinationName,
          departureTime: new Date(seg.departureTime),
          arrivalTime: new Date(seg.arrivalTime),
          durationMinutes: seg.durationMinutes,
          cabinClass: seg.cabinClass,
          baggageAllowance: seg.baggageAllowance,
          aircraftOrBusType: seg.aircraftOrBusType,
        },
      });
    }

    for (const pax of request.passengers) {
      await this.prisma.transportPassenger.create({
        data: {
          transportBookingId: details.id,
          passengerType: pax.passengerType,
          title: pax.title || null,
          firstName: pax.firstName,
          lastName: pax.lastName,
          gender: pax.gender || null,
          dateOfBirth: pax.dateOfBirth ? new Date(pax.dateOfBirth) : null,
          nationality: pax.nationality || 'IN',
          seatNumber: pax.seatNumber || null,
          idDocumentNumberMasked: pax.idDocumentNumberMasked ? `***${pax.idDocumentNumberMasked.slice(-4)}` : null,
        },
      });
    }

    // 6. Update Booking Status
    const finalStatus = supplierRes.status === 'CONFIRMED' ? 'CONFIRMED' : 'BOOKING_PENDING';
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { status: finalStatus },
    });

    return {
      chaloFarvaBookingId: booking.id,
      bookingReference: bookingReference,
      supplierBookingId: supplierRes.supplierBookingId,
      pnr: supplierRes.pnr,
      providerId: provider.providerId,
      providerName: provider.providerName,
      type: request.type,
      status: supplierRes.status,
      confirmationMode: supplierRes.confirmationMode,
      totalPrice: totalAmount,
      currency: request.currency || 'INR',
      segments: supplierRes.segments,
      passengers: request.passengers,
      createdAt: booking.createdAt.toISOString(),
      message: supplierRes.message,
    };
  }

  async cancel(request: TransportCancellationRequest): Promise<TransportCancellationResult> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: request.chaloFarvaBookingId }, { bookingReference: request.chaloFarvaBookingId }],
      },
      include: { transportDetail: true },
    });

    if (!booking || !booking.transportDetail) {
      throw new NotFoundException(`Transport booking '${request.chaloFarvaBookingId}' not found.`);
    }

    const provider = this.providerRegistry.getTransportProvider(booking.transportDetail.transportType as TransportTypeEnum);
    const cancelRes = await provider.cancelBooking({
      chaloFarvaBookingId: booking.id,
      pnrOrSupplierRef: booking.transportDetail.pnr || booking.transportDetail.supplierReference || undefined,
      reason: request.reason,
    });

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: cancelRes.status === 'CANCELLED' ? 'CANCELLED' : 'CANCEL_REQUESTED',
        cancellationReason: request.reason || 'Customer cancellation request',
        cancelledAt: new Date(),
      },
    });

    return cancelRes;
  }

  async getHealthChecks() {
    const providers = this.providerRegistry.getAllTransportProviders();
    const results = await Promise.all(
      providers.map(async p => {
        const health = await p.healthCheck();
        return {
          providerId: p.providerId,
          providerName: p.providerName,
          supportedType: p.supportedType,
          capabilities: p.capabilities,
          ...health,
        };
      }),
    );
    return results;
  }
}
