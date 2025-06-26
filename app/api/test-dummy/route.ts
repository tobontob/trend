import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (환경변수 체크 추가)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 연결이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('🔄 테스트용 더미 하이브리드 트렌드 데이터 생성...');

    // 더미 데이터 생성
    const dummyData = {
      news: [
        { keyword: '대선', score: 45, source: 'news', count: 15 },
        { keyword: '경제', score: 38, source: 'news', count: 12 },
        { keyword: '코로나', score: 32, source: 'news', count: 10 },
        { keyword: '부동산', score: 28, source: 'news', count: 9 },
        { keyword: '교육', score: 25, source: 'news', count: 8 }
      ],
      social: [
        { keyword: 'BTS', score: 42, source: 'social', count: 21 },
        { keyword: '블랙핑크', score: 36, source: 'social', count: 18 },
        { keyword: '아이유', score: 30, source: 'social', count: 15 },
        { keyword: '뉴진스', score: 28, source: 'social', count: 14 },
        { keyword: '르세라핌', score: 24, source: 'social', count: 12 }
      ],
      shopping: [
        { keyword: '아이폰', score: 35, source: 'shopping', count: 23 },
        { keyword: '갤럭시', score: 30, source: 'shopping', count: 20 },
        { keyword: '에어팟', score: 25, source: 'shopping', count: 17 },
        { keyword: '맥북', score: 22, source: 'shopping', count: 15 },
        { keyword: '아이패드', score: 20, source: 'shopping', count: 13 }
      ],
      search: [
        { keyword: '날씨', score: 40, source: 'search', count: 40 },
        { keyword: '맛집', score: 35, source: 'search', count: 35 },
        { keyword: '영화', score: 30, source: 'search', count: 30 },
        { keyword: '게임', score: 28, source: 'search', count: 28 },
        { keyword: '운동', score: 25, source: 'search', count: 25 }
      ],
      combined: [
        { keyword: 'BTS', score: 84, source: 'combined' },
        { keyword: '아이폰', score: 78, source: 'combined' },
        { keyword: '날씨', score: 75, source: 'combined' },
        { keyword: '대선', score: 72, source: 'combined' },
        { keyword: '블랙핑크', score: 68, source: 'combined' },
        { keyword: '맛집', score: 65, source: 'combined' },
        { keyword: '경제', score: 62, source: 'combined' },
        { keyword: '갤럭시', score: 58, source: 'combined' },
        { keyword: '아이유', score: 55, source: 'combined' },
        { keyword: '영화', score: 52, source: 'combined' }
      ],
      collected_at: new Date().toISOString()
    };

    // Supabase에 저장
    await supabase
      .from('trends')
      .delete()
      .eq('engine', 'hybrid')
      .eq('period', 'realtime');

    const result = await supabase
      .from('trends')
      .insert({
        engine: 'hybrid',
        period: 'realtime',
        data: dummyData,
        created_at: new Date().toISOString()
      });

    console.log('✅ 더미 하이브리드 트렌드 데이터 생성 완료');

    return NextResponse.json({
      success: true,
      message: '더미 하이브리드 트렌드 데이터가 생성되었습니다.',
      data: dummyData
    });

  } catch (error) {
    console.error('❌ 더미 데이터 생성 실패:', error);
    return NextResponse.json(
      { success: false, message: '더미 데이터 생성 실패', error: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '테스트용 더미 하이브리드 트렌드 데이터 생성 API',
    usage: 'POST 요청으로 더미 데이터를 생성하고 Supabase에 저장합니다.'
  });
} 