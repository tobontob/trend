import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

const PERIOD_LABELS: Record<string, string> = {
  realtime: '실시간',
  today: '오늘',
  yesterday: '어제',
  week: '이주',
  month: '이달',
  year: '올해',
};

// 10분 캐싱
const CACHE_DURATION = 10 * 60 * 1000; // 10분
const CACHE: Record<string, { data: any; timestamp: number }> = {};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'realtime';
    const cacheKey = `google_trends_${period}`;
    const cachedData = CACHE[cacheKey];
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    let keywords: { keyword: string; rank: number; searchCount?: number }[] = [];

    if (period === 'realtime') {
      // puppeteer로 구글 트렌드 실시간 인기 검색어 크롤링 (더 넓은 selector)
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto('https://trends.google.co.kr/trends/trendingsearches/realtime?geo=KR', { waitUntil: 'networkidle2' });
      // 더 넓은 selector로 대기
      await page.waitForSelector('ol[aria-label] li', { timeout: 20000 });
      const html = await page.content();
      console.log('구글 트렌드 페이지 HTML 일부:', html.slice(0, 1000));
      const keywordsData = await page.evaluate(() => {
        const lists = Array.from(document.querySelectorAll('ol[aria-label]'));
        let items: Element[] = [];
        for (const ol of lists) {
          if (ol.getAttribute('aria-label')?.includes('검색어')) {
            items = Array.from(ol.querySelectorAll('li'));
            break;
          }
        }
        return items.slice(0, 10).map((el, idx) => {
          const keyword = el.querySelector('div[role="heading"] span')?.textContent?.trim() || '';
          return { keyword, rank: idx + 1 };
        });
      });
      await browser.close();
      console.log('구글 트렌드 크롤링 결과:', keywordsData);
      keywords = keywordsData;
    } else {
      // TODO: 기간별(오늘, 어제, 이주, 이달, 올해) 크롤링 구현
      keywords = [];
    }

    const result = { keywords };
    CACHE[cacheKey] = {
      data: result,
      timestamp: now,
    };
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Google Trends Puppeteer Error:', error);
    return NextResponse.json(
      { error: '구글 트렌드 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 