import fs from 'fs';
import path from 'path';

export interface BenchmarkQueryItem {
  id: number;
  query: string;
  category: string;
  platformTested: string;
  testDate: string | null;
  auditStatus: 'AUDITED_VERIFIED' | 'PENDING_LIVE_AUDIT';
  isMentioned: boolean;
  isRecommended: boolean;
  citationUrl: string | null;
  recommendationRank: number | null;
  competitorsMentioned: string[];
  authoritySourcesCited: string[];
  findingsSummary: string;
}

export interface BenchmarkDatabase {
  metadata: {
    auditVersion: string;
    auditDate: string;
    protocol: string;
    integrityStatement: string;
  };
  summary: {
    totalBenchmarkQueries: number;
    liveAuditedQueries: number;
    pendingAuditQueries: number;
    verifiedMentionsCount: number;
    verifiedRecommendationsCount: number;
    actualMentionRatePercent: number;
    primaryCompetitorsEncountered: string[];
    primaryAuthorityDomainsCitedByModels: string[];
  };
  queries: BenchmarkQueryItem[];
}

export function loadBenchmarkDatabase(): BenchmarkDatabase {
  const filePath = path.join(process.cwd(), 'data', 'geo_live_benchmarks.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Benchmark database not found at ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function recordAuditResult(queryId: number, update: Partial<BenchmarkQueryItem>): BenchmarkDatabase {
  const db = loadBenchmarkDatabase();
  const index = db.queries.findIndex(q => q.id === queryId);
  if (index === -1) {
    throw new Error(`Query ID ${queryId} not found`);
  }

  db.queries[index] = {
    ...db.queries[index],
    ...update,
    auditStatus: 'AUDITED_VERIFIED',
    testDate: new Date().toISOString().split('T')[0],
  };

  // Recalculate summary metrics
  const audited = db.queries.filter(q => q.auditStatus === 'AUDITED_VERIFIED');
  const mentioned = audited.filter(q => q.isMentioned);
  const recommended = audited.filter(q => q.isRecommended);

  db.summary.liveAuditedQueries = audited.length;
  db.summary.pendingAuditQueries = db.queries.length - audited.length;
  db.summary.verifiedMentionsCount = mentioned.length;
  db.summary.verifiedRecommendationsCount = recommended.length;
  db.summary.actualMentionRatePercent = audited.length > 0 ? Number(((mentioned.length / audited.length) * 100).toFixed(1)) : 0;

  const filePath = path.join(process.cwd(), 'data', 'geo_live_benchmarks.json');
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
  return db;
}

if (process.argv[1]?.includes('benchmark-tracker')) {
  const db = loadBenchmarkDatabase();
  console.log('\n' + '='.repeat(80));
  console.log('📊 BHARATYATRA AI VISIBILITY EMPIRICAL BENCHMARK AUDITOR');
  console.log('='.repeat(80));
  console.log(`Version:             ${db.metadata.auditVersion}`);
  console.log(`Audit Timestamp:     ${db.metadata.auditDate}`);
  console.log(`Total Queries:       ${db.summary.totalBenchmarkQueries}`);
  console.log(`Live Audited:        ${db.summary.liveAuditedQueries}`);
  console.log(`Pending Audit:       ${db.summary.pendingAuditQueries}`);
  console.log(`Verified Mentions:   ${db.summary.verifiedMentionsCount} (${db.summary.actualMentionRatePercent}%)`);
  console.log('-'.repeat(80));
  console.log('Audit Summary:');
  db.queries.forEach(q => {
    const statusIcon = q.auditStatus === 'AUDITED_VERIFIED' ? (q.isMentioned ? '🟢 MENTIONED' : '🟡 UNMENTIONED') : '⚪ PENDING';
    console.log(`[#${q.id.toString().padStart(2, '0')}] ${statusIcon.padEnd(16)} | ${q.query.padEnd(50).slice(0, 50)} | ${q.auditStatus}`);
  });
  console.log('='.repeat(80) + '\n');
}
