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

// 하이브리드 트렌드 수집 함수들
async function collectNewsTrends() {
  const keywords: string[] = [];
  
  try {
    // NewsAPI 사용
    const newsApiKey = process.env.NEWS_API_KEY;
    if (newsApiKey) {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${newsApiKey}&pageSize=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        for (const article of data.articles || []) {
          const title = article.title || '';
          keywords.push(...extractKeywords(title));
        }
      }
    }
    
    // 네이버 뉴스 (간단한 크롤링)
    try {
      const response = await fetch(
        'https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=100',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );
      
      if (response.ok) {
        const html = await response.text();
        const titlePattern = /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/g;
        const matches = html.match(titlePattern);
        
        if (matches) {
          for (const match of matches.slice(0, 20)) {
            const title = match.replace(/<[^>]*>/g, '');
            keywords.push(...extractKeywords(title));
          }
        }
      }
    } catch (error) {
      console.log('네이버 뉴스 크롤링 실패:', error);
    }
    
  } catch (error) {
    console.log('뉴스 수집 오류:', error);
  }
  
  return processKeywords(keywords, 'news');
}

async function collectSocialTrends() {
  const keywords: string[] = [];
  
  try {
    // YouTube 인기 동영상
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=KR&maxResults=10&key=${youtubeApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        for (const video of data.items || []) {
          const title = video.snippet.title || '';
          const description = video.snippet.description || '';
          keywords.push(...extractKeywords(`${title} ${description}`));
        }
      }
    }
    
  } catch (error) {
    console.log('소셜 수집 오류:', error);
  }
  
  return processKeywords(keywords, 'social');
}

async function collectShoppingTrends() {
  const keywords: string[] = [];
  
  try {
    // 네이버 쇼핑 API
    const naverClientId = process.env.NAVER_CLIENT_ID;
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
    
    if (naverClientId && naverClientSecret) {
      const categories = ['패션', '전자제품', '식품', '뷰티'];
      
      for (const category of categories) {
        const response = await fetch(
          `https://openapi.naver.com/v1/search/shop.json?query=${category}&display=5&sort=sim`,
          {
            headers: {
              'X-Naver-Client-Id': naverClientId,
              'X-Naver-Client-Secret': naverClientSecret
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          for (const item of data.items || []) {
            const title = (item.title || '').replace(/<b>/g, '').replace(/<\/b>/g, '');
            keywords.push(...extractKeywords(title));
          }
        }
      }
    }
    
  } catch (error) {
    console.log('쇼핑 수집 오류:', error);
  }
  
  return processKeywords(keywords, 'shopping');
}

async function collectSearchTrends() {
  const keywords: string[] = [];
  
  try {
    // 네이버 연관 검색어
    const searchTerms = ['인기', '트렌드', '핫', '바이럴'];
    
    for (const term of searchTerms) {
      const response = await fetch(
        `https://ac.search.naver.com/nx/ac?q=${term}&con=1&frm=nv&ans=2&r_format=json&r_enc=UTF-8&r_unicode=0&t_koreng=1&run=2`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );
      
      if (response.ok) {
        try {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            keywords.push(...data.items[0].slice(0, 5));
          }
        } catch (error) {
          console.log('연관 검색어 파싱 실패:', error);
        }
      }
    }
    
  } catch (error) {
    console.log('검색 수집 오류:', error);
  }
  
  return processKeywords(keywords, 'search');
}

function extractKeywords(text: string): string[] {
  // 한글, 영문, 숫자만 추출
  const cleanText = text.replace(/[^\w\s가-힣]/g, ' ');
  const words = cleanText.split(/\s+/);
  
  // 2글자 이상, 10글자 이하만 선택
  const keywords = words.filter(word => word.length >= 2 && word.length <= 10);
  
  // 불용어 제거
  const stopwords = ['이', '그', '저', '것', '수', '등', '때', '곳', '말', '일', '년', '월', '일', '시', '분', '초'];
  return keywords.filter(word => !stopwords.includes(word));
}

function processKeywords(keywords: string[], source: string) {
  if (keywords.length === 0) return [];
  
  // 빈도 계산
  const counter: { [key: string]: number } = {};
  keywords.forEach(keyword => {
    counter[keyword] = (counter[keyword] || 0) + 1;
  });
  
  // 가중치 적용
  const weights: { [key: string]: number } = {
    'news': 3,
    'social': 2,
    'shopping': 1.5,
    'search': 1
  };
  
  const weight = weights[source] || 1;
  
  // 상위 10개 키워드 선택
  const topKeywords = Object.entries(counter)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  return topKeywords.map(([keyword, count]) => ({
    keyword,
    count,
    score: count * weight,
    source
  }));
}

async function saveToSupabase(engine: string, period: string, data: any) {
  try {
    if (!supabase) {
      console.log('❌ Supabase 연결이 설정되지 않았습니다.');
      return null;
    }

    // 기존 데이터 삭제
    await supabase
      .from('trends')
      .delete()
      .eq('engine', engine)
      .eq('period', period);
    
    // 새 데이터 삽입
    const result = await supabase
      .from('trends')
      .insert({
        engine,
        period,
        data,
        created_at: new Date().toISOString()
      });
    
    console.log(`✅ ${engine} ${period} 트렌드 데이터 저장 완료`);
    return result;
  } catch (error) {
    console.log(`❌ ${engine} ${period} 데이터 저장 실패:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 하이브리드 트렌드 데이터 수집 시작...');
    
    // 각 소스별 데이터 수집 (타임아웃 방지를 위해 순차 실행)
    const newsTrends = await collectNewsTrends();
    await new Promise(resolve => setTimeout(resolve, 1000)); // API 제한 방지
    
    const socialTrends = await collectSocialTrends();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const shoppingTrends = await collectShoppingTrends();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const searchTrends = await collectSearchTrends();
    
    // 모든 키워드를 통합하여 최종 점수 계산
    const allKeywords: { [key: string]: number } = {};
    
    [newsTrends, socialTrends, shoppingTrends, searchTrends].forEach(trendList => {
      trendList.forEach(trend => {
        const keyword = trend.keyword;
        const score = trend.score;
        allKeywords[keyword] = (allKeywords[keyword] || 0) + score;
      });
    });
    
    // 상위 20개 키워드 선택
    const topKeywords = Object.entries(allKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    const combinedTrends = topKeywords.map(([keyword, score]) => ({
      keyword,
      score,
      source: 'combined'
    }));
    
    const result = {
      news: newsTrends,
      social: socialTrends,
      shopping: shoppingTrends,
      search: searchTrends,
      combined: combinedTrends,
      collected_at: new Date().toISOString()
    };
    
    // Supabase에 저장
    await saveToSupabase('hybrid', 'realtime', result);
    
    // 개별 소스별 데이터도 저장
    if (newsTrends.length > 0) {
      await saveToSupabase('news', 'realtime', { trends: newsTrends });
    }
    
    if (socialTrends.length > 0) {
      await saveToSupabase('social', 'realtime', { trends: socialTrends });
    }
    
    if (shoppingTrends.length > 0) {
      await saveToSupabase('shopping', 'realtime', { trends: shoppingTrends });
    }
    
    if (searchTrends.length > 0) {
      await saveToSupabase('search', 'realtime', { trends: searchTrends });
    }
    
    console.log(`✅ 하이브리드 트렌드 수집 완료: ${combinedTrends.length}개 키워드`);
    
    return NextResponse.json({
      success: true,
      message: '하이브리드 트렌드 데이터 수집 완료',
      data: result
    });
    
  } catch (error) {
    console.error('❌ 하이브리드 트렌드 수집 실패:', error);
    return NextResponse.json(
      { success: false, message: '트렌드 데이터 수집 실패', error: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '하이브리드 트렌드 수집 API',
    usage: 'POST 요청으로 트렌드 데이터를 수집하고 Supabase에 저장합니다.'
  });
} 