export type ProductTypeEnum = 'HOTEL' | 'FLIGHT' | 'BUS' | 'TRAIN' | 'ACTIVITY' | 'TRANSFER';

export interface UniversalSearchInput {
  productType: ProductTypeEnum;
  destination: string;
  origin?: string;
  checkIn: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  options?: Record<string, any>;
}

export interface UniversalRateItem {
  rateKey: string;
  name: string;
  boardName?: string;
  boardCode?: string;
  netPrice: number;
  grossPrice?: number;
  currency: string;
  cancellationPolicy: string;
  cancellationAmount?: number;
  cancellationFrom?: string;
  allotment?: number;
  rawSupplierData?: any;
}

export interface UniversalProductItem {
  id: string;
  productType: ProductTypeEnum;
  name: string;
  category: string;
  starRating?: number;
  address: string;
  destination: string;
  latitude: number;
  longitude: number;
  images: string[];
  facilities: string[];
  availableRates: UniversalRateItem[];
  minPrice: number;
  currency: string;
  cancellationPolicy: string;
  provider: string;
}

export interface UniversalSearchResult {
  productType: ProductTypeEnum;
  searchId: string;
  totalCount: number;
  items: UniversalProductItem[];
  destination: string;
  provider: string;
}

export interface UniversalProductDetail {
  id: string;
  productType: ProductTypeEnum;
  name: string;
  description: string;
  category: string;
  starRating?: number;
  address: string;
  destination: string;
  latitude: number;
  longitude: number;
  images: string[];
  facilities: string[];
  rates: UniversalRateItem[];
  minPrice: number;
  currency: string;
  cancellationPolicy: string;
  provider: string;
}

export interface CheckPriceInput {
  rateKey: string;
  productType?: ProductTypeEnum;
  productId?: string;
}

export interface CheckPriceResult {
  status: 'AVAILABLE' | 'PRICE_CHANGED' | 'UNAVAILABLE';
  rateKey: string;
  netPrice: number;
  grossPrice?: number;
  currency: string;
  cancellationPolicy: string;
  productType?: ProductTypeEnum;
  productId?: string;
  productName?: string;
  rateName?: string;
  boardName?: string;
  message?: string;
}

export interface UniversalBookingRequest {
  rateKey: string;
  productType: ProductTypeEnum;
  productId: string;
  productName: string;
  categoryName?: string;
  address?: string;
  destinationName?: string;
  checkIn: string;
  checkOut: string;
  rateName: string;
  boardName?: string;
  price: number;
  currency?: string;
  cancellationPolicy?: string;
  acceptPriceChange?: boolean;
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  paxDetails: Array<{
    roomId?: number;
    type: 'AD' | 'CH';
    title?: string;
    name: string;
    surname: string;
    age?: number;
  }>;
  customerNotes?: string;
  idempotencyKey?: string;
}

export interface UniversalBookingResponse {
  chaloFarvaBookingId: string;
  bookingReference: string;
  supplierReference: string;
  productType: ProductTypeEnum;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'FAILED' | 'TEST_ONLY';
  productId: string;
  productName: string;
  checkIn: string;
  checkOut: string;
  rateName: string;
  boardName?: string;
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  guests: any[];
  totalPrice: number;
  currency: string;
  cancellationPolicy: string;
  createdAt: string;
  idempotent?: boolean;
  priceChanged?: boolean;
  oldPrice?: number;
  newPrice?: number;
}

export interface UniversalCancellationRequest {
  bookingIdOrReference: string;
  reason?: string;
  simulation?: boolean;
}

export interface UniversalCancellationResponse {
  status: 'CANCELLED' | 'CANCELLATION_PENDING' | 'FAILED';
  bookingId?: string;
  bookingReference: string;
  supplierReference: string;
  cancellationFee: number;
  currency: string;
  message: string;
}

export interface ITravelProvider {
  readonly providerId: string;
  readonly providerName: string;
  readonly supportedProductTypes: ProductTypeEnum[];

  search?(input: UniversalSearchInput): Promise<UniversalSearchResult>;
  getDetails?(productId: string): Promise<UniversalProductDetail | null>;
  checkPrice?(input: CheckPriceInput): Promise<CheckPriceResult>;
  createBooking?(request: UniversalBookingRequest): Promise<UniversalBookingResponse>;
  getBooking?(bookingId: string): Promise<UniversalBookingResponse | null>;
  cancelBooking?(request: UniversalCancellationRequest): Promise<UniversalCancellationResponse>;
}
