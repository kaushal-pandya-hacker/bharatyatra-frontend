export type BookingStatus = 
  | 'SEARCHED' | 'SELECTED' | 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED'
  | 'BOOKING_PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCEL_REQUESTED'
  | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';

export type PaymentStatus = 
  | 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED'
  | 'CANCELLED' | 'REFUND_PENDING' | 'PARTIALLY_REFUNDED' | 'REFUNDED';

export interface Booking {
  bookingId: string;
  bookingReference: string;
  tripId?: string;
  userId: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netPayableAmount: number;
  bookingStatus: BookingStatus;
  createdAt: string;
}

export interface Payment {
  paymentId: string;
  orderId: string;
  bookingId: string;
  gatewayName: string;
  gatewayTransactionId?: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
}
