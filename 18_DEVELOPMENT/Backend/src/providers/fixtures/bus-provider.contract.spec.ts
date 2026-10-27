import { Test, TestingModule } from '@nestjs/testing';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';

describe('Bus Provider Contract Specification Tests', () => {
  let busAdapter: EtravelsmartBusAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtravelsmartBusAdapter],
    }).compile();

    busAdapter = module.get<EtravelsmartBusAdapter>(EtravelsmartBusAdapter);
  });

  it('1. Search contract should return normalized bus items with boarding & dropping points', async () => {
    const res = await busAdapter.search({
      type: 'BUS',
      origin: 'Ahmedabad',
      destination: 'Surat',
      departureDate: '2026-10-20',
      passengers: 2,
    });

    expect(res).toBeDefined();
    expect(res.type).toBe('BUS');
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0].boardingPoints).toBeDefined();
    expect(res.items[0].droppingPoints).toBeDefined();
    expect(res.items[0].seatMapSupported).toBe(true);
  });

  it('2. Revalidation contract should verify availability', async () => {
    const busItem = await busAdapter.getDetails('BUS-AMD-SURAT-GSRTC01');
    expect(busItem).toBeDefined();

    const reval = await busAdapter.revalidate({
      transportId: busItem.id,
      passengersCount: 1,
    });

    expect(reval.status).toBe('AVAILABLE');
    expect(reval.priceChanged).toBe(false);
  });

  it('3. Health check contract should reflect provider status', async () => {
    const health = await busAdapter.healthCheck();
    expect(health.isHealthy).toBe(true);
    expect(health.mode).toBeDefined();
  });
});
