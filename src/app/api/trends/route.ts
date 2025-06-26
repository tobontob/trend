import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const engine = searchParams.get('engine'); // 예: naver, google
  const period = searchParams.get('period'); // 예: realtime, week, month, year 등

  let query = supabase
    .from('trends')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (engine) query = query.eq('engine', engine);
  if (period) query = query.eq('period', period);

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
} 