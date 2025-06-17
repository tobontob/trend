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
    if (!svgRef.current) return;

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .font('Impact')
      .fontSize((d) => d.value * 5)
      .on('end', draw);

    layout.start();

    function draw(words: any[]) {
      const svg = svgRef.current;
      if (!svg) return;

      // Clear previous content
      svg.innerHTML = '';

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${width / 2},${height / 2})`);

      words.forEach((word) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('font-size', word.size);
        text.setAttribute('font-family', word.font);
        text.setAttribute('fill', `hsl(${Math.random() * 360}, 70%, 50%)`);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('transform', `translate(${word.x},${word.y}) rotate(${word.rotate})`);
        text.textContent = word.text;
        g.appendChild(text);
      });

      svg.appendChild(g);
    }
  }, [words, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-white rounded-lg shadow-md"
    />
  );
} 