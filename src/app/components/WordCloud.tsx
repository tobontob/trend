import React, { useEffect, useRef } from 'react';
import cloud from 'd3-cloud';

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
  width: number;
  height: number;
}

export default function WordCloud({ words, width, height }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !words.length) return;

    // 검색량에 따른 글자 크기 계산
    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));
    const fontSize = (value: number) => {
      const normalized = (value - minValue) / (maxValue - minValue);
      return Math.max(14, Math.min(60, 14 + normalized * 46)); // 14px ~ 60px
    };

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(3)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font('Pretendard')
      .fontSize(d => fontSize(d.value))
      .spiral('archimedean')
      .on('end', draw);

    layout.start();

    function draw(words: any[]) {
      const svg = svgRef.current;
      if (!svg) return;

      // Clear previous content
      svg.innerHTML = '';

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${width / 2},${height / 2})`);

      // 색상 팔레트
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#D4A5A5', '#9B59B6', '#3498DB', '#F1C40F', '#2ECC71'
      ];

      words.forEach((word, i) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('font-size', `${word.size}px`);
        text.setAttribute('font-family', word.font);
        // 순환하면서 색상 선택
        text.setAttribute('fill', colors[i % colors.length]);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('transform', `translate(${word.x},${word.y}) rotate(${word.rotate})`);
        text.textContent = word.text;
        
        // 호버 효과를 위한 스타일
        text.style.transition = 'all 0.2s ease';
        text.addEventListener('mouseover', () => {
          text.style.fontSize = `${word.size * 1.2}px`;
          text.style.cursor = 'pointer';
        });
        text.addEventListener('mouseout', () => {
          text.style.fontSize = `${word.size}px`;
        });

        g.appendChild(text);
      });

      svg.appendChild(g);
    }
  }, [words, width, height]);

  if (!words.length) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-500">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-white rounded-lg w-full h-auto max-w-[320px] sm:max-w-[400px] mx-auto"
      style={{ minHeight: 120 }}
    />
  );
} 