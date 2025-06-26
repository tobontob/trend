import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: '환경변수 누락' }, { status: 500 });
  }

  // 구글 뉴스 RSS 파싱
  const parser = new Parser();
  const feed = await parser.parseURL('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko');
  if (!feed.items || feed.items.length === 0) {
    return NextResponse.json({ error: '구글 뉴스 RSS 데이터 없음' }, { status: 500 });
  }

  // 키워드 추출(제목에서 단어 빈도수 집계)
  const wordCount: Record<string, number> = {};
  feed.items.forEach(item => {
    const title = item.title || '';
    title.replace(/[^가-힣a-zA-Z0-9 ]/g, '').split(' ').forEach((word: string) => {
      if (word.length < 2) return;
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });
  // 상위 20개 키워드 추출
  const keywords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword, count]) => ({ keyword, score: count, source: 'google_rss' }));

  // Supabase에 저장
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from('trends').insert([
    {
      engine: 'news',
      period: 'realtime',
      collected_at: new Date().toISOString(),
      combined: keywords,
      news: keywords,
      social: [],
      shopping: [],
      search: []
    }
  ]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, keywords });
} 