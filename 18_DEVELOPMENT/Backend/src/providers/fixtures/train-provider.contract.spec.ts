import { Test, TestingModule } from '@nestjs/testing';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';

describe('Train Provider Contract Specification Tests', () => {
  let trainAdapter: TrainProviderAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainProviderAdapter],
    }).compile();

    trainAdapter = module.get<TrainProviderAdapter>(TrainProviderAdapter);
  });

  it('1. Search contract should return normalized train items', async () => {
    const res = await trainAdapter.search({
      type: 'TRAIN',
      origin: 'ADI',
      destination: 'MAO',
      departureDate: '2026-10-25',
      cabinClass: '3A',
    });

    expect(res).toBeDefined();
    expect(res.type).toBe('TRAIN');
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0].trainNumber).toBeDefined();
    expect(res.items[0].cancellationPolicy).toContain('IRCTC');
  });

  it('2. Revalidation contract should verify availability', async () => {
    const trainItem = await trainAdapter.getDetails('TRN-ADI-MAO-12010');
    expect(trainItem).toBeDefined();

    const reval = await trainAdapter.revalidate({
      transportId: trainItem.id,
      passengersCount: 1,
    });

    expect(reval.status).toBe('AVAILABLE');
    expect(reval.priceChanged).toBe(false);
  });

  it('3. Health check contract should reflect provider confirmation mode', async () => {
    const health = await trainAdapter.healthCheck();
    expect(health.isHealthy).toBe(true);
    expect(health.mode).toBeDefined();
  });
});
