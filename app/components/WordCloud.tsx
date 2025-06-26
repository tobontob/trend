"use client";

import React, { useEffect, useRef, useState } from "react";
// wordcloud2.js 타입 선언이 없으므로 임시 선언
// @ts-ignore
// eslint-disable-next-line
declare module 'wordcloud';
import WordCloud2 from "wordcloud";

export type Word = {
  text: string;
  value: number;
};

interface WordCloudProps {
  words: Word[];
}

const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(320);

  // 반응형 크기 측정
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        // 최소/최대값 제한 (모바일 대응)
        setSize(Math.max(180, Math.min(w - 24, 400)));
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(words) || words.length === 0) return;
    const list = words.map(w => [w.text, w.value]);
    const colors = ['#2563eb', '#eab308', '#ef4444', '#10b981', '#a21caf', '#f97316', '#0ea5e9', '#db2777', '#64748b'];
    WordCloud2(canvasRef.current, {
      list,
      gridSize: 8,
      weightFactor: 3,
      fontFamily: 'Pretendard, sans-serif',
      color: function() {
        return colors[Math.floor(Math.random() * colors.length)];
      },
      backgroundColor: 'rgba(255,255,255,0)',
      rotateRatio: 0.5,
      rotationSteps: 2,
      minSize: 12,
      drawOutOfBound: false,
      shrinkToFit: true,
      origin: [size/2, size/2],
      ellipticity: 0.7,
    });
  }, [words, size]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: 180,
        minWidth: 0,
        boxSizing: 'border-box',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: 400,
          minWidth: 180,
          aspectRatio: '1/1',
          display: 'block',
          margin: '16px auto 0 auto',
          background: 'transparent',
          borderRadius: 12,
        }}
      />
      {(!words || words.length === 0) && (
        <div className="text-gray-400 absolute">워드클라우드 데이터가 없습니다.</div>
      )}
    </div>
  );
};

export default WordCloud; 