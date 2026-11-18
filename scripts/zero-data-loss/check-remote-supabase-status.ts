import { getSupabaseClient } from '../../lib/supabase/client';

async function main() {
  console.log('--- Checking Remote Supabase Connectivity ---');
  const supabase = getSupabaseClient();
  
  // Test query on user_profiles
  const resProfiles = await supabase.from('user_profiles').select('id').limit(1);
  console.log('user_profiles:', resProfiles.error ? resProfiles.error : `Found ${resProfiles.data?.length} rows`);

  // Test query on place_submissions
  const resSub = await supabase.from('place_submissions').select('id').limit(1);
  console.log('place_submissions:', resSub.error ? resSub.error : `Found ${resSub.data?.length} rows`);

  // Test query on contributor_rewards
  const resRew = await supabase.from('contributor_rewards').select('id').limit(1);
  console.log('contributor_rewards:', resRew.error ? resRew.error : `Found ${resRew.data?.length} rows`);

  // Test buckets
  const resBuckets = await supabase.storage.listBuckets();
  console.log('storage.listBuckets:', resBuckets.error ? resBuckets.error : resBuckets.data?.map(b => b.name));

  // Test contributions bucket specifically
  const resContr = await supabase.storage.from('contributions').list('', { limit: 1 });
  console.log('storage.from("contributions").list():', resContr.error ? resContr.error : resContr.data);
}

main().catch(err => {
  console.error('Fatal check error:', err);
  process.exit(1);
});
