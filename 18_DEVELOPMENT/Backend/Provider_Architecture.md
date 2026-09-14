# Provider Adapter Architecture — Chalo Farva

## Standardized Interfaces & Development Mocks
All third-party integrations operate behind clean interfaces in `src/providers/interfaces/`:
- `HotelProvider` -> `MockHotelProvider` (`DEVELOPMENT MOCK`)
- `BusProvider` -> `MockBusProvider` (`DEVELOPMENT MOCK`)
- `PaymentProvider` -> `MockPaymentProvider` (`DEVELOPMENT MOCK`)
- `WeatherProvider` -> `MockWeatherProvider` (`DEVELOPMENT MOCK`)
- `NotificationProvider` -> `MockNotificationProvider` (`DEVELOPMENT MOCK`)

All mock data includes an explicit `isDevelopmentMock: true` marker.
