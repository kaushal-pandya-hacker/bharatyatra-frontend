import { ProviderActivationService } from '../config/provider-activation.config';

async function runProductionPreflight() {
  console.log('\n======================================================');
  console.log('   BHARAT YATRA — PRODUCTION PRE-FLIGHT DIAGNOSTICS   ');
  console.log('======================================================\n');

  const activationService = new ProviderActivationService();
  const preflight = activationService.getPreflightCheck();
  const startupCheck = activationService.validateProductionStartup();

  console.log(`Environment Mode : ${preflight.mode.toUpperCase()}`);
  console.log(`Timestamp        : ${preflight.timestamp}\n`);

  console.log('--- CORE INFRASTRUCTURE ---');
  console.log(`Database Connection : [${preflight.database.status}] URL: ${preflight.database.urlMasked}`);
  console.log(`Redis Cache / Queue  : [${preflight.redis.status}] URL: ${preflight.redis.urlMasked}`);
  console.log(`Payment Gateway      : [${preflight.payment.status}] Provider: ${preflight.payment.provider.toUpperCase()} (Key: ${preflight.payment.keyIdMasked})\n`);

  console.log('--- SUPPLIER ADAPTERS ---');
  Object.entries(preflight.suppliers).forEach(([category, info]) => {
    console.log(`- ${category.padEnd(12)}: [${info.status.padEnd(4)}] Adapter: ${info.provider}`);
  });

  console.log('\n--- COMMUNICATION SERVICES ---');
  console.log(`- Email          : [${preflight.notifications.status}] Provider: ${preflight.notifications.emailProvider}`);
  console.log(`- WhatsApp       : [${preflight.notifications.status}] Provider: ${preflight.notifications.whatsappProvider}\n`);

  if (!startupCheck.success) {
    console.error('❌ PRODUCTION GATES FAILED:');
    startupCheck.errors.forEach((err) => console.error(`  - ${err}`));
    console.log('\n======================================================\n');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  } else {
    console.log('✅ ALL PRODUCTION PRE-FLIGHT CHECKS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  }
}

runProductionPreflight().catch((err) => {
  console.error('Fatal preflight error:', err);
  process.exit(1);
});
