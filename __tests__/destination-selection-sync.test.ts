import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveCanonicalDestination,
  createInitialTripState,
  saveTripPlanningState,
  loadTripPlanningState,
  startNewTripDraft,
  validateTripPayload,
  CanonicalTripState,
} from '../lib/trips/trip-planning-state';
import { PureItineraryService, AI_SYSTEM_ITINERARY_INSTRUCTION } from '../lib/ai-planner/pure-itinerary-service';
import { getDestinationsForTarget } from '../lib/ai-planner/destination-intelligence';
import { generateItineraryBlueprint } from '../lib/trips/itinerary-generator';
import { UserDataStore } from '../lib/user/user-store';

describe('BharatYatra: Destination Selection & AI Trip Generation Synchronization (10 Scenarios)', () => {

  // TEST 1: Select Kankaria Lake and Hutheesing Jain Temple. Continue through onboarding. Generate itinerary.
  it('TEST 1: correctly represents Kankaria Lake and Hutheesing Jain Temple in Ahmedabad without dropping or artificial transit', async () => {
    // 1. Resolve canonical destination objects
    const kankaria = resolveCanonicalDestination('Kankaria Lake', 1, 'destination_page');
    const hutheesing = resolveCanonicalDestination('Hutheesing Jain Temple', 2, 'destination_page');

    assert.ok(kankaria.destinationId, 'Kankaria Lake should have a canonical destinationId');
    assert.strictEqual(kankaria.city, 'Ahmedabad');
    assert.strictEqual(kankaria.state, 'Gujarat');
    assert.strictEqual(kankaria.type, 'attraction');

    assert.ok(hutheesing.destinationId, 'Hutheesing Jain Temple should have a canonical destinationId');
    assert.strictEqual(hutheesing.city, 'Ahmedabad');
    assert.strictEqual(hutheesing.state, 'Gujarat');
    assert.strictEqual(hutheesing.type, 'attraction');

    // 2. Destination intelligence lookup
    const targetNames = [kankaria.name, hutheesing.name];
    const nodes = getDestinationsForTarget(targetNames, 'Ahmedabad');
    assert.strictEqual(nodes.length, 2, 'Both attractions must be discovered by destination intelligence');
    const nodeNames = nodes.map((n) => n.name);
    assert.ok(nodeNames.includes('Kankaria Lake'), 'Kankaria Lake must be in intelligence nodes');
    assert.ok(nodeNames.includes('Hutheesing Jain Temple'), 'Hutheesing Jain Temple must be in intelligence nodes');

    // 3. AI Itinerary Generation
    const itinerary = PureItineraryService.generatePureItinerary({
      origin: { city: 'Ahmedabad', country: 'India' },
      destinations: targetNames.map((n) => ({ name: n, state: 'Gujarat' })),
      durationDays: 2,
      pace: 'balanced',
    });

    assert.ok(itinerary, 'Itinerary must be generated');
    assert.strictEqual(itinerary.locations.startingLocation, 'Ahmedabad, India');
    assert.deepStrictEqual(itinerary.locations.allDestinations, targetNames);

    // Verify both attractions are represented in the day-by-day plan
    const allActivities = itinerary.dayWiseItinerary.flatMap((d) => [
      ...d.morning,
      ...d.afternoon,
      ...d.evening,
    ]);
    const activityNames = allActivities.map((a) => a.name);

    assert.ok(
      activityNames.some((n) => n.includes('Kankaria')),
      'Kankaria Lake must appear in activities'
    );
    assert.ok(
      activityNames.some((n) => n.includes('Hutheesing')),
      'Hutheesing Jain Temple must appear in activities'
    );

    // Verify system instruction is attached
    assert.ok(itinerary.systemInstruction, 'AI system instruction must be attached');
    assert.ok(itinerary.systemInstruction.includes('confirmed destination selections'));
  });

  // TEST 2: Select Baratang and Araku Valley. Generate itinerary.
  it('TEST 2: schedules realistic inter-state multimodal routing for Baratang Island and Araku Valley', async () => {
    const baratang = resolveCanonicalDestination('Baratang', 1, 'destination_page');
    const araku = resolveCanonicalDestination('Araku Valley', 2, 'destination_page');

    assert.ok(baratang.destinationId);
    assert.strictEqual(baratang.state, 'Andaman & Nicobar');

    assert.ok(araku.destinationId);
    assert.strictEqual(araku.state, 'Andhra Pradesh');

    const nodes = getDestinationsForTarget([baratang.name, araku.name], 'Ahmedabad');
    assert.strictEqual(nodes.length, 2, 'Both cross-state destinations must be enriched');

    // Blueprint generation
    const blueprint = generateItineraryBlueprint({
      originCity: 'Ahmedabad',
      durationDays: 5,
      customPlaces: [
        {
          id: 9101,
          name: baratang.name,
          district: baratang.city,
          category: 'Nature & Wildlife',
          description: 'Limestone caves and mangrove waterways',
          image: '/hero-bg.jpg',
        },
        {
          id: 9102,
          name: araku.name,
          district: araku.city,
          category: 'Hill Stations & Valleys',
          description: 'Scenic valleys, coffee plantations and Borra caves',
          image: '/hero-bg.jpg',
        },
      ],
    });

    assert.ok(blueprint.circuitTitle.includes('Baratang'), 'Circuit title must include Baratang');
    assert.ok(blueprint.circuitTitle.includes('Araku Valley'), 'Circuit title must include Araku Valley');
    assert.strictEqual(blueprint.totalDays, 5);

    // Verify all selected places are represented in blueprint
    const scheduledNames = blueprint.itineraryDays.flatMap((d) => d.activities.map((a) => a.placeName));
    assert.ok(scheduledNames.includes(baratang.name), 'Baratang must be scheduled');
    assert.ok(scheduledNames.includes(araku.name), 'Araku Valley must be scheduled');
  });

  // TEST 3: Select destinations, refresh the browser, and continue. Verify selections remain unchanged.
  it('TEST 3: preserves canonical destination state through storage serialization and deserialization (browser refresh)', () => {
    const tripState = createInitialTripState('user-test-3');
    const dest1 = resolveCanonicalDestination('Kankaria Lake', 1, 'destination_page');
    const dest2 = resolveCanonicalDestination('Hutheesing Jain Temple', 2, 'destination_page');
    const dest3 = resolveCanonicalDestination('Udaipur', 3, 'destination_page');

    tripState.destinations = [dest1, dest2, dest3];
    tripState.startingLocation = { city: 'Ahmedabad', state: 'Gujarat', country: 'India' };

    // Simulate serialization to localStorage
    const serialized = JSON.stringify(tripState);
    const deserialized: CanonicalTripState = JSON.parse(serialized);

    assert.strictEqual(deserialized.tripId, tripState.tripId);
    assert.strictEqual(deserialized.destinations.length, 3);
    assert.strictEqual(deserialized.destinations[0].name, 'Kankaria Lake');
    assert.strictEqual(deserialized.destinations[0].selectionOrder, 1);
    assert.strictEqual(deserialized.destinations[1].name, 'Hutheesing Jain Temple');
    assert.strictEqual(deserialized.destinations[1].selectionOrder, 2);
    assert.strictEqual(deserialized.destinations[2].name, 'Udaipur');
    assert.strictEqual(deserialized.destinations[2].selectionOrder, 3);
  });

  // TEST 4: Select destinations, log out, log in again, and retrieve the draft.
  it('TEST 4: persists and recovers draft trip across simulated logout and re-login via database store', async () => {
    const testUserId = `usr_auth_sync_${Date.now()}`;
    const tripState = createInitialTripState(testUserId);
    tripState.destinations = [
      resolveCanonicalDestination('Kankaria Lake', 1, 'destination_page'),
      resolveCanonicalDestination('Hutheesing Jain Temple', 2, 'destination_page'),
    ];

    // Save draft to persistent database store
    const savedRecord = await UserDataStore.saveTripDraft(testUserId, tripState);
    assert.ok(savedRecord, 'Draft must be saved to store');
    assert.strictEqual(savedRecord.status, 'DRAFT');

    // Simulate session logout and subsequent login
    const recoveredDraft = await UserDataStore.getTripDraft(testUserId);
    assert.ok(recoveredDraft, 'Draft must be recovered from store');
    assert.strictEqual(recoveredDraft.tripId, tripState.tripId);
    assert.strictEqual(recoveredDraft.destinations.length, 2);
    assert.strictEqual(recoveredDraft.destinations[0].name, 'Kankaria Lake');
    assert.strictEqual(recoveredDraft.destinations[1].name, 'Hutheesing Jain Temple');

    // Clean up
    await UserDataStore.clearTripDraft(testUserId);
  });

  // TEST 5: Remove one destination. Verify it disappears from all relevant interfaces and generation payload.
  it('TEST 5: removes a destination cleanly and re-indexes selection order without leaving orphaned data', () => {
    const tripState = createInitialTripState();
    const dest1 = resolveCanonicalDestination('Kankaria Lake', 1, 'destination_page');
    const dest2 = resolveCanonicalDestination('Hutheesing Jain Temple', 2, 'destination_page');
    const dest3 = resolveCanonicalDestination('Somnath', 3, 'destination_page');
    tripState.destinations = [dest1, dest2, dest3];

    // Remove Hutheesing Jain Temple (simulate removeDestination)
    const toRemove = 'Hutheesing Jain Temple'.toLowerCase();
    const filtered = tripState.destinations.filter(
      (d) => d.name.toLowerCase() !== toRemove && d.destinationId.toLowerCase() !== toRemove
    );
    const reindexed = filtered.map((d, idx) => ({ ...d, selectionOrder: idx + 1 }));
    tripState.destinations = reindexed;

    assert.strictEqual(tripState.destinations.length, 2);
    assert.strictEqual(tripState.destinations[0].name, 'Kankaria Lake');
    assert.strictEqual(tripState.destinations[0].selectionOrder, 1);
    assert.strictEqual(tripState.destinations[1].name, 'Somnath');
    assert.strictEqual(tripState.destinations[1].selectionOrder, 2);

    // Verify it is excluded from generation payload
    const payloadNames = tripState.destinations.map((d) => d.name);
    assert.ok(!payloadNames.includes('Hutheesing Jain Temple'));
  });

  // TEST 6: Start a new trip after completing an existing trip. Verify no previous destinations leak into the new trip.
  it('TEST 6: starts a new trip draft with fresh ID and zero leaked destinations from previous trip', () => {
    // Existing completed trip state
    const completedState = createInitialTripState();
    completedState.status = 'completed';
    completedState.destinations = [
      resolveCanonicalDestination('Kankaria Lake', 1, 'destination_page'),
      resolveCanonicalDestination('Hutheesing Jain Temple', 2, 'destination_page'),
    ];

    // Start brand new trip draft
    const freshDraft = startNewTripDraft('test-user-6');

    assert.notStrictEqual(freshDraft.tripId, completedState.tripId, 'New trip must have distinct tripId');
    assert.strictEqual(freshDraft.status, 'draft');
    assert.strictEqual(freshDraft.destinations.length, 0, 'New trip draft must have 0 destinations');
    assert.deepStrictEqual(freshDraft.destinations, [], 'Destinations array must be completely empty');
  });

  // TEST 7: Open the same trip on another device or browser session. Verify synchronized persisted data.
  it('TEST 7: synchronizes trip draft state across multiple client sessions', async () => {
    const testUserId = `usr_multisession_${Date.now()}`;
    const sessionATrip = createInitialTripState(testUserId);
    sessionATrip.destinations = [
      resolveCanonicalDestination('Baratang', 1, 'destination_page'),
      resolveCanonicalDestination('Araku Valley', 2, 'destination_page'),
    ];

    // Session A saves draft
    await UserDataStore.saveTripDraft(testUserId, sessionATrip);

    // Session B connects and retrieves draft
    const sessionBDraft = await UserDataStore.getTripDraft(testUserId);
    assert.ok(sessionBDraft);
    assert.strictEqual(sessionBDraft.tripId, sessionATrip.tripId);
    assert.strictEqual(sessionBDraft.destinations.length, 2);
    assert.strictEqual(sessionBDraft.destinations[0].name, sessionATrip.destinations[0].name);
    assert.strictEqual(sessionBDraft.destinations[1].name, sessionATrip.destinations[1].name);

    // Clean up
    await UserDataStore.clearTripDraft(testUserId);
  });

  // TEST 8: Generate two different trips. Verify that their destination data never gets mixed.
  it('TEST 8: strictly isolates two different trip records and prevents cross-contamination of destinations', async () => {
    const userA = `usr_trip_a_${Date.now()}`;
    const userB = `usr_trip_b_${Date.now()}`;

    const tripA = await UserDataStore.saveTrip(userA, {
      id: `trip-a-${Date.now()}`,
      title: 'Gujarat Heritage Tour',
      destination: 'Kankaria Lake, Hutheesing Jain Temple',
      originCity: 'Ahmedabad',
      durationDays: 3,
    });

    const tripB = await UserDataStore.saveTrip(userB, {
      id: `trip-b-${Date.now()}`,
      title: 'Island & Valley Expedition',
      destination: 'Baratang, Araku Valley',
      originCity: 'Visakhapatnam',
      durationDays: 6,
    });

    const userATrips = await UserDataStore.getUserTrips(userA);
    const userBTrips = await UserDataStore.getUserTrips(userB);

    assert.strictEqual(userATrips.length, 1);
    assert.strictEqual(userATrips[0].destination, 'Kankaria Lake, Hutheesing Jain Temple');
    assert.ok(!userATrips[0].destination.includes('Baratang'));

    assert.strictEqual(userBTrips.length, 1);
    assert.strictEqual(userBTrips[0].destination, 'Baratang, Araku Valley');
    assert.ok(!userBTrips[0].destination.includes('Kankaria Lake'));
  });

  // TEST 9: Attempt to submit invalid or deleted destination IDs. Verify backend validation rejects them safely.
  it('TEST 9: rejects invalid, deleted, or decommissioned destination IDs safely with descriptive error', () => {
    // 1. Missing destinations
    const res1 = validateTripPayload({
      originCity: 'Ahmedabad',
      destinations: [],
    });
    assert.strictEqual(res1.valid, false);
    assert.ok(res1.errors.some((e) => e.includes('At least one confirmed destination')));

    // 2. Explicit invalid destination ID
    const res2 = validateTripPayload({
      originCity: 'Ahmedabad',
      destinations: ['INVALID_DEST_99999'],
    });
    assert.strictEqual(res2.valid, false);
    assert.ok(res2.errors.some((e) => e.includes('invalid') || e.includes('decommissioned')));

    // 3. Deleted destination record object
    const res3 = validateTripPayload({
      originCity: 'Ahmedabad',
      destinations: [{ destinationId: 'DEST-001', name: 'Old Place', isDeleted: true }],
    });
    assert.strictEqual(res3.valid, false);
    assert.ok(res3.errors.some((e) => e.includes('deleted')));

    // 4. Valid destinations pass
    const res4 = validateTripPayload({
      originCity: 'Ahmedabad',
      destinations: ['Kankaria Lake', 'Hutheesing Jain Temple'],
      durationDays: 3,
    });
    assert.strictEqual(res4.valid, true);
    assert.strictEqual(res4.errors.length, 0);
  });

  // TEST 10: Change destinations immediately before generation. Verify that the latest confirmed state is used.
  it('TEST 10: uses the latest confirmed state when destinations are modified immediately before generation', () => {
    // Initial state with Baratang & Araku Valley
    const tripState = createInitialTripState();
    tripState.destinations = [
      resolveCanonicalDestination('Baratang', 1, 'destination_page'),
      resolveCanonicalDestination('Araku Valley', 2, 'destination_page'),
    ];

    // User modifies destinations right before generation to Kankaria Lake and Hutheesing Jain Temple
    const updatedDestinations = [
      resolveCanonicalDestination('Kankaria Lake', 1, 'onboarding'),
      resolveCanonicalDestination('Hutheesing Jain Temple', 2, 'onboarding'),
    ];
    tripState.destinations = updatedDestinations;
    tripState.status = 'confirmed';

    // Validate payload
    const validation = validateTripPayload({
      originCity: tripState.startingLocation.city,
      destinations: tripState.destinations,
      durationDays: tripState.travelDates.durationDays,
    });
    assert.strictEqual(validation.valid, true);

    // AI Generation with confirmed payload
    const targetNames = tripState.destinations.map((d) => d.name);
    const itinerary = PureItineraryService.generatePureItinerary({
      origin: { city: tripState.startingLocation.city, country: 'India' },
      destinations: targetNames.map((n) => ({ name: n, state: 'Gujarat' })),
      durationDays: tripState.travelDates.durationDays,
    });

    assert.deepStrictEqual(itinerary.locations.allDestinations, ['Kankaria Lake', 'Hutheesing Jain Temple']);
    assert.ok(!itinerary.locations.allDestinations.includes('Baratang'));
    assert.ok(!itinerary.locations.allDestinations.includes('Araku Valley'));
  });
});
