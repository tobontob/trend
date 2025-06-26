import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '트렌드 분석기 - 하이브리드 데이터 수집 시스템',
  description: '뉴스, 소셜, 쇼핑, 검색 데이터를 종합하여 정확한 트렌드를 분석합니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 