import { Injectable, Logger } from '@nestjs/common';

export interface InvoiceLineItem {
  description: string;
  category: string; // HOTEL | BUS | ACTIVITY | RESTAURANT
  unitPriceInr: number;
  quantity: number;
  totalPriceInr: number;
}

export interface CustomerInvoiceRecord {
  invoiceNumber: string;
  invoiceDate: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  lineItems: InvoiceLineItem[];
  subtotalInr: number;
  cgstInr: number;
  sgstInr: number;
  totalTaxInr: number;
  discountInr: number;
  platformFeeInr: number;
  finalTotalInr: number;
  currency: string;
  paymentStatus: string;
  documentPath: string;
}

@Injectable()
export class CustomerInvoiceService {
  private readonly logger = new Logger(CustomerInvoiceService.name);
  private readonly invoiceStore = new Map<string, CustomerInvoiceRecord>();
  private invoiceCounter = 10001;

  async generateInvoice(bookingData: any, paymentData: any): Promise<CustomerInvoiceRecord> {
    const invoiceNumber = `INV-2026-${this.invoiceCounter++}`;
    const invoiceDate = new Date().toISOString();

    const subtotal = paymentData.subtotalInr || 4000;
    const tax = paymentData.taxInr || 720;
    const cgst = Number((tax / 2).toFixed(2));
    const sgst = Number((tax / 2).toFixed(2));
    const discount = paymentData.discountInr || 0;
    const platformFee = paymentData.platformFeeInr || 100;
    const finalTotal = Number((subtotal + tax + platformFee - discount).toFixed(2));

    const lineItems: InvoiceLineItem[] = bookingData.items || [
      {
        description: 'Somnath Beach Resort Stay (2 Nights)',
        category: 'HOTEL',
        unitPriceInr: 2000,
        quantity: 2,
        totalPriceInr: 4000,
      },
    ];

    const documentPath = `12_DOCUMENTS/Invoices/${invoiceNumber}.pdf`;

    const invoice: CustomerInvoiceRecord = {
      invoiceNumber,
      invoiceDate,
      bookingId: bookingData.bookingId || 'bk_123',
      customerName: bookingData.customerName || 'Gujarat Traveler',
      customerEmail: bookingData.customerEmail || 'traveler@chalo-farva.com',
      lineItems,
      subtotalInr: subtotal,
      cgstInr: cgst,
      sgstInr: sgst,
      totalTaxInr: tax,
      discountInr: discount,
      platformFeeInr: platformFee,
      finalTotalInr: finalTotal,
      currency: 'INR',
      paymentStatus: 'PAID',
      documentPath,
    };

    this.invoiceStore.set(invoiceNumber, invoice);
    this.logger.log(`[CustomerInvoiceService] Generated customer invoice ${invoiceNumber} for Booking ${invoice.bookingId} (Total: ₹${finalTotal})`);

    return invoice;
  }

  async getInvoice(invoiceNumber: string): Promise<CustomerInvoiceRecord | undefined> {
    return this.invoiceStore.get(invoiceNumber);
  }
}
