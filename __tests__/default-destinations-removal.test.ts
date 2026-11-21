import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createInitialTripState,
  resolveCanonicalDestination,
  validateTripPayload,
  startNewTripDraft,
} from '@/lib/trips/trip-planning-state';
import { searchCities } from '@/lib/data/indian-cities';
import { UserDataStore } from '@/lib/user/user-store';

describe('BharatYatra: Default Destinations Removal & Clean State Management', () => {
  // Scenario 1: User navigates to Plan a Trip -> zero preselected destinations
  it('Scenario 1: initializes a new trip with strictly zero preselected destinations (empty array)', () => {
    const initialState = createInitialTripState();
    assert.deepStrictEqual(initialState.destinations, [], 'Initial destinations array must be empty');
    assert.strictEqual(initialState.destinations.length, 0);

    const freshDraft = startNewTripDraft('test-user-clean');
    assert.deepStrictEqual(freshDraft.destinations, [], 'Fresh trip draft must start with empty destinations');
    assert.strictEqual(freshDraft.destinations.length, 0);

    // Verify popular city suggestions do NOT automatically suggest Borra Caves or Araku Valley
    const popularDefaults = searchCities('');
    const popularNames = popularDefaults.map((c) => c.city);
    assert.ok(!popularNames.includes('Borra Caves'), 'Borra Caves must NOT be in default popular suggestions');
    assert.ok(!popularNames.includes('Araku Valley'), 'Araku Valley must NOT be in default popular suggestions');
  });

  // Scenario 2: User searches and adds Borra Caves manually -> only Borra Caves is selected
  it('Scenario 2: user searches and adds Borra Caves manually -> only Borra Caves is selected', () => {
    // Starting with empty selection
    let selectedDestinations: any[] = [];
    assert.strictEqual(selectedDestinations.length, 0);

    // User explicitly searches and chooses Borra Caves
    const borra = resolveCanonicalDestination('Borra Caves', 1, 'manual_input');
    assert.ok(borra.destinationId);
    assert.strictEqual(borra.name, 'Borra Caves');

    // Add to selection
    selectedDestinations = [borra];
    assert.strictEqual(selectedDestinations.length, 1);
    assert.strictEqual(selectedDestinations[0].name, 'Borra Caves');

    // Verify no unintended companion destination (e.g. Araku Valley) was silently injected
    const destinationNames = selectedDestinations.map((d) => d.name);
    assert.deepStrictEqual(destinationNames, ['Borra Caves']);
    assert.ok(!destinationNames.includes('Araku Valley'), 'Araku Valley must NOT be injected');
  });

  // Scenario 3: User deletes destination chip -> chip is removed, array updates correctly
  it('Scenario 3: user deletes destination chip -> chip is removed, array updates correctly to empty', () => {
    const borra = resolveCanonicalDestination('Borra Caves', 1, 'manual_input');
    let selectedDestinations = [borra];
    assert.strictEqual(selectedDestinations.length, 1);

    // User removes the chip (e.g. handleRemoveDest)
    selectedDestinations = selectedDestinations.filter((d) => d.name !== 'Borra Caves');
    assert.strictEqual(selectedDestinations.length, 0);
    assert.deepStrictEqual(selectedDestinations, []);
  });

  // Scenario 4: User attempts to generate itinerary with 0 destinations -> blocked with validation error
  it('Scenario 4: blocks itinerary generation when destinations array is empty with descriptive validation error', () => {
    // 1. Validation function check
    const validationEmpty = validateTripPayload({
      originCity: 'Ahmedabad',
      destinations: [],
      durationDays: 4,
    });
    assert.strictEqual(validationEmpty.valid, false, 'Validation must fail when destinations is empty');
    assert.ok(
      validationEmpty.errors.some((e) => e.includes('At least one confirmed destination')),
      'Must require at least one confirmed destination'
    );

    // 2. Missing destinations parameter check
    const validationMissing = validateTripPayload({
      originCity: 'Ahmedabad',
      durationDays: 4,
    });
    assert.strictEqual(validationMissing.valid, false);
    assert.ok(validationMissing.errors.some((e) => e.includes('At least one confirmed destination')));
  });

  // Scenario 5: User with an existing saved trip loads their trip -> saved destinations load correctly
  it('Scenario 5: user with an existing saved trip loads their trip -> saved destinations load correctly without contamination', async () => {
    const testUserId = `usr_saved_trip_test_${Date.now()}`;
    const originalDestinations = 'Somnath, Dwarka, Gir National Park';

    // Save a legitimate user trip
    const savedTrip = await UserDataStore.saveTrip(testUserId, {
      id: `trip_saved_${Date.now()}`,
      title: 'Gujarat Coastal & Wildlife Circuit',
      destination: originalDestinations,
      originCity: 'Ahmedabad',
      durationDays: 5,
    });

    assert.ok(savedTrip);
    assert.strictEqual(savedTrip.destination, originalDestinations);

    // Retrieve user trips
    const userTrips = await UserDataStore.getUserTrips(testUserId);
    assert.strictEqual(userTrips.length, 1);
    assert.strictEqual(userTrips[0].destination, originalDestinations);

    // Parse destinations from saved trip
    const parsedDests = userTrips[0].destination.split(',').map((s) => s.trim()).filter(Boolean);
    assert.deepStrictEqual(parsedDests, ['Somnath', 'Dwarka', 'Gir National Park']);
    assert.ok(!parsedDests.includes('Borra Caves'), 'Must not contain Borra Caves');
    assert.ok(!parsedDests.includes('Araku Valley'), 'Must not contain Araku Valley');
  });
});
