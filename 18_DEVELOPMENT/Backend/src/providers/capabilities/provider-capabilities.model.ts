export interface ProviderCapabilities {
  seatHold: boolean;
  priceRevalidation: boolean;
  instantConfirmation: boolean;
  refundApi: boolean;
  webhookSupport: boolean;
  sandboxAvailable: boolean;
}

export const DEFAULT_HOTEL_CAPABILITIES: ProviderCapabilities = {
  seatHold: false,
  priceRevalidation: true,
  instantConfirmation: true,
  refundApi: true,
  webhookSupport: true,
  sandboxAvailable: true,
};

export const DEFAULT_BUS_CAPABILITIES: ProviderCapabilities = {
  seatHold: true,
  priceRevalidation: true,
  instantConfirmation: true,
  refundApi: true,
  webhookSupport: true,
  sandboxAvailable: true,
};

export const DEFAULT_PAYMENT_CAPABILITIES: ProviderCapabilities = {
  seatHold: false,
  priceRevalidation: false,
  instantConfirmation: true,
  refundApi: true,
  webhookSupport: true,
  sandboxAvailable: true,
};
