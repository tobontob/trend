import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // 임시 데이터 반환 (실제 API 연동 전)
    const mockData = {
      keywords: Array.from({ length: 20 }, (_, i) => ({
        keyword: `구글 키워드 ${i + 1}`,
        rank: i + 1,
        searchCount: Math.floor(Math.random() * 10000),
      })),
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Google API Error:', error);
    return NextResponse.json(
      { error: '구글 트렌드 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 