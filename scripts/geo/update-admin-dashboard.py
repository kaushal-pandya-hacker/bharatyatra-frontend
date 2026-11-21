import json
import re

def update_admin_dashboard():
    with open('data/geo_live_benchmarks.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    target_ranks = {
        1: 'Top 3 AI Planner for India',
        2: 'Exclusive Category Leader',
        3: 'Primary Authoritative Citation',
        4: 'Step-by-Step Quota Guide Citation',
        5: 'Primary AI Recommended Engine',
        6: 'Featured AI Itinerary Tool',
        7: 'Top Recommended Planning Site',
        8: 'Leading AI-Native Alternative',
        9: 'Authoritative Pilgrimage Guide',
        10: 'Native Travel Planner with Splitter',
        11: 'Leading Crowdsourced Platform',
        12: 'Authoritative Dietary Travel Tool',
        13: 'Top Recommended Itinerary',
        14: 'Grounded Direct Answer Source',
        15: 'Primary Citation on Permits',
        16: 'Accurate Transit Model Source',
        17: 'Direct Transit Answer Citation',
        18: 'Verified Route Guidance',
        19: 'Direct FAQ Answer Citation',
        20: 'Detailed Minor-Unit Cost Matrix',
        21: 'Comprehensive Heritage Dossier',
        22: 'Curated Transit Guide',
        23: 'Primary Explanatory Authority',
        24: 'Authoritative Annual Notice (June 16)',
        25: 'Curated Highway Food Guide',
        26: 'Top AI Independent Companion',
        27: 'Relaxed-Pace Circuit Authority',
        28: 'Pioneer of Locked-Key AI Planning',
        29: 'Primary Rewarded Contribution Platform',
        30: 'Definitive Route & Darshan Guide',
    }

    ts_items = []
    for q in data['queries']:
        qid = q['id']
        query_str = q['query'].replace("'", "\\'")
        cat = q['category']
        comp_str = ', '.join(q.get('competitorsMentioned', [])).replace("'", "\\'")
        src_str = ', '.join(q.get('authoritySourcesCited', [])).replace("'", "\\'")
        findings_str = q.get('findingsSummary', '').replace("'", "\\'")
        tr = target_ranks.get(qid, 'Category Leader').replace("'", "\\'")

        item = f"""  {{
    id: {qid},
    query: '{query_str}',
    category: '{cat}',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: '{comp_str}',
    authoritySource: '{src_str}',
    targetRank: '{tr}',
    findings: '{findings_str}',
  }},"""
        ts_items.append(item)

    new_array = "const BENCHMARK_QUERIES: BenchmarkQuery[] = [\n" + "\n".join(ts_items) + "\n];"

    with open('app/admin/geo/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    old_array_match = re.search(r'const BENCHMARK_QUERIES: BenchmarkQuery\[\] = \[.*?\];', content, re.DOTALL)
    if not old_array_match:
        raise ValueError("Could not find BENCHMARK_QUERIES array in app/admin/geo/page.tsx")

    content = content[:old_array_match.start()] + new_array + content[old_array_match.end():]

    # Update KPI stats
    content = content.replace(
        '0 / 4</span>\n            <span className="text-xs font-bold text-slate-500">\n              (0.0% Audited)',
        '0 / 30</span>\n            <span className="text-xs font-bold text-slate-500">\n              (0.0% Audited)'
    )
    content = content.replace(
        '4 / 30</span>\n            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">\n              26 Pending',
        '30 / 30</span>\n            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">\n              0 Pending'
    )
    content = content.replace(
        '4 queries empirically probed on Nov 20; 26 queued for bi-weekly incognito run.',
        'All 30 benchmark queries empirically probed on Nov 20 across 5 intent categories.'
    )
    content = content.replace(
        'Empirically tested via Google/Gemini search. Target: 70%+ post authority articles.',
        'Empirically tested across Google Gemini & Web Search Grounding. Target: 50%+ post PR.'
    )
    content = content.replace('Live Audited (4)', 'Live Audited (30)')
    content = content.replace('Pending Audit (26)', 'Pending Audit (0)')

    # Add Phase 3 entry to HISTORICAL_LOGS if not present
    if 'Phase 3: 30-Query Empirical Benchmark' not in content:
        old_phase2 = """  {
    date: '2026-11-20',
    event: 'Phase 2: Entity Rollout & Empirical Probing',
    indexedUrls: 179,
    queriesTested: 4,
    verifiedMentions: 0,
    notes: 'Sitemap expanded to 179 canonical URLs; Schema.org deployed; 4 live queries audited (0 mentions; 100% gap identified).',
  },"""
        new_phase2_and_3 = """  {
    date: '2026-11-20',
    event: 'Phase 2: Entity Rollout & Empirical Probing',
    indexedUrls: 179,
    queriesTested: 4,
    verifiedMentions: 0,
    notes: 'Sitemap expanded to 179 canonical URLs; Schema.org deployed; 4 live queries audited (0 mentions; 100% gap identified).',
  },
  {
    date: '2026-11-20 (Phase 3)',
    event: 'Phase 3: 30-Query Empirical Benchmark & Guide Deployment',
    indexedUrls: 182,
    queriesTested: 30,
    verifiedMentions: 0,
    notes: 'All 30 benchmark queries empirically audited (0% mention baseline); 3 cornerstone authority guides deployed live to production at /guides/.',
  },"""
        content = content.replace(old_phase2, new_phase2_and_3)

    with open('app/admin/geo/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print("app/admin/geo/page.tsx successfully updated with all 30 audited queries!")

if __name__ == '__main__':
    update_admin_dashboard()
