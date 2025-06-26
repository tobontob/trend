import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (환경변수 체크 추가)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    // Supabase 연결 확인
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 연결이 설정되지 않았습니다. 환경변수를 확인해주세요.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const engine = searchParams.get('engine') || 'hybrid'; // 기본값을 hybrid로 변경
    const period = searchParams.get('period') || 'realtime';

    console.log(`📊 트렌드 데이터 요청: ${engine} ${period}`);

    // Supabase에서 데이터 조회
    let query = supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (engine) query = query.eq('engine', engine);
    if (period) query = query.eq('period', period);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase 조회 오류:', error);
      return NextResponse.json(
        { error: '데이터 조회 실패' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.log(`⚠️ 데이터 없음: ${engine} ${period}`);
      return NextResponse.json({
        engine,
        period,
        data: { keywords: [] },
        message: '데이터가 없습니다.'
      });
    }

    const latestData = data[0];
    console.log(`✅ 트렌드 데이터 조회 성공: ${engine} ${period}`);

    return NextResponse.json(latestData);

  } catch (error) {
    console.error('❌ API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    );
  }
} 