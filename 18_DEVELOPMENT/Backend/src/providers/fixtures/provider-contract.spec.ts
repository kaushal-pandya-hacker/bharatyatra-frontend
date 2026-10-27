import { Test, TestingModule } from '@nestjs/testing';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';

describe('Provider Fixture Contract & Verification Tests', () => {
  let flightAdapter: TboFlightAdapter;
  let busAdapter: EtravelsmartBusAdapter;
  let trainAdapter: TrainProviderAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TboFlightAdapter,
        EtravelsmartBusAdapter,
        TrainProviderAdapter,
      ],
    }).compile();

    flightAdapter = module.get<TboFlightAdapter>(TboFlightAdapter);
    busAdapter = module.get<EtravelsmartBusAdapter>(EtravelsmartBusAdapter);
    trainAdapter = module.get<TrainProviderAdapter>(TrainProviderAdapter);
  });

  it('1. Flight Adapter contract should return normalized search results', async () => {
    const searchRes = await flightAdapter.search({
      type: 'FLIGHT',
      origin: 'BOM',
      destination: 'DEL',
      departureDate: '2026-10-15',
      adults: 2,
    });

    expect(searchRes).toBeDefined();
    expect(searchRes.type).toBe('FLIGHT');
    expect(searchRes.items.length).toBeGreaterThan(0);
    expect(searchRes.items[0].providerName).toContain('TBO Air');

    const health = await flightAdapter.healthCheck();
    expect(health.isHealthy).toBe(true);
  });

  it('2. Bus Adapter contract should return normalized bus items', async () => {
    const busRes = await busAdapter.search({
      type: 'BUS',
      origin: 'Ahmedabad',
      destination: 'Surat',
      departureDate: '2026-10-15',
      adults: 1,
    });

    expect(busRes).toBeDefined();
    expect(busRes.type).toBe('BUS');
    expect(busRes.items.length).toBeGreaterThan(0);
    expect(busRes.items[0].providerName).toContain('Etravelsmart');

    const health = await busAdapter.healthCheck();
    expect(health.isHealthy).toBe(true);
  });

  it('3. Train Adapter should operate under confirmation mode', async () => {
    const trainRes = await trainAdapter.search({
      type: 'TRAIN',
      origin: 'ADI',
      destination: 'MAO',
      departureDate: '2026-10-15',
      adults: 2,
    });

    expect(trainRes).toBeDefined();
    expect(trainRes.type).toBe('TRAIN');
    expect(trainRes.items.length).toBeGreaterThan(0);
    expect(trainRes.items[0].cancellationPolicy).toContain('IRCTC');

    const health = await trainAdapter.healthCheck();
    expect(health.mode).toBe('REQUEST_CONFIRMATION');
  });

  it('4. Revalidation & Price Change simulation', async () => {
    const reval = await flightAdapter.revalidate({
      transportId: 'FL-BOM-DEL-6E101',
      rateKey: 'DRIFT_TEST',
      passengersCount: 1,
    });

    expect(reval.priceChanged).toBe(true);
    expect(reval.status).toBe('PRICE_CHANGED');
    expect(reval.newFare).toBeGreaterThan(reval.oldFare);
  });
});
