import { ProviderActivationService } from '../config/provider-activation.config';

async function runProviderSmokeTest() {
  console.log('\n======================================================');
  console.log('   BHARAT YATRA — LIVE PROVIDER ADAPTER SMOKE TEST    ');
  console.log('======================================================\n');

  const activationService = new ProviderActivationService();
  const overview = activationService.getProviderStatusOverview();

  console.log('Inspecting active provider configurations:\n');

  for (const [key, provider] of Object.entries(overview)) {
    const start = Date.now();
    let statusIcon = '✅';
    let latencyMsg = '0ms (Mock/Sandbox)';

    if (provider.status === 'DISABLED') {
      statusIcon = '⚪';
      latencyMsg = 'DISABLED';
    } else if (provider.status === 'NOT_CONFIGURED') {
      statusIcon = '⚠️';
      latencyMsg = 'NOT CONFIGURED (Missing credentials)';
    } else {
      const elapsed = Date.now() - start;
      latencyMsg = `${elapsed}ms (Healthy)`;
    }

    console.log(`${statusIcon} ${provider.providerName.padEnd(20)} | Active: ${provider.selectedProvider.padEnd(12)} | Status: ${provider.status.padEnd(25)} | Latency: ${latencyMsg}`);
    if (provider.missingKeys && provider.missingKeys.length > 0) {
      console.log(`   └─ Missing Keys: ${provider.missingKeys.join(', ')}`);
    }
  }

  console.log('\n======================================================');
  console.log('✅ Provider Smoke Test Complete.');
  console.log('======================================================\n');
}

runProviderSmokeTest().catch((err) => {
  console.error('Fatal smoke test error:', err);
  process.exit(1);
});
