import sitemap from '../../app/sitemap';

function verifySitemap() {
  const entries = sitemap();
  const targetUrl = 'https://www.bharatyatra.in/guides/gujarat-travel-budget-7-day-guide/';
  const match = entries.find((e) => e.url === targetUrl);

  console.log('='.repeat(60));
  console.log('SITEMAP VERIFICATION');
  console.log('='.repeat(60));
  console.log(`Total URLs in sitemap: ${entries.length}`);

  const allGuideUrls = entries.filter((e) => e.url.includes('/guides/'));
  console.log(`Guide URLs (${allGuideUrls.length}):`);
  allGuideUrls.forEach((g) => console.log(`  - ${g.url} (priority: ${g.priority})`));

  if (match) {
    console.log(`\n[SUCCESS] Found Guide 4 in sitemap: ${match.url}`);
    console.log(`Change Frequency: ${match.changeFrequency}`);
    console.log(`Priority: ${match.priority}`);
  } else {
    console.error(`\n[FAILURE] Guide 4 NOT found in sitemap!`);
    process.exit(1);
  }
}

verifySitemap();
