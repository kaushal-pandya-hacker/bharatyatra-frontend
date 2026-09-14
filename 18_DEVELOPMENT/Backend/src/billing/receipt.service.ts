import { Injectable, Logger } from '@nestjs/common';

export interface PaymentReceiptRecord {
  receiptNumber: string;
  paymentReference: string;
  bookingReference: string;
  amountInr: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  documentPath: string;
}

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);
  private readonly receiptStore = new Map<string, PaymentReceiptRecord>();
  private receiptCounter = 50001;

  async generateReceipt(paymentData: any): Promise<PaymentReceiptRecord> {
    const receiptNumber = `REC-2026-${this.receiptCounter++}`;
    const paymentDate = new Date().toISOString();
    const documentPath = `12_DOCUMENTS/Receipts/${receiptNumber}.pdf`;

    const receipt: PaymentReceiptRecord = {
      receiptNumber,
      paymentReference: paymentData.paymentOrderId || paymentData.gatewayOrderId || 'rzp_pord_123',
      bookingReference: paymentData.bookingId || 'bk_123',
      amountInr: paymentData.totalAmountInr || paymentData.amountInr || 4820,
      paymentMethod: paymentData.paymentMethod || 'UPI',
      paymentDate,
      status: 'CAPTURED',
      documentPath,
    };

    this.receiptStore.set(receiptNumber, receipt);
    this.logger.log(`[ReceiptService] Generated payment receipt ${receiptNumber} for Booking ${receipt.bookingReference} (Amount: ₹${receipt.amountInr})`);

    return receipt;
  }

  async getReceipt(receiptNumber: string): Promise<PaymentReceiptRecord | undefined> {
    return this.receiptStore.get(receiptNumber);
  }
}
