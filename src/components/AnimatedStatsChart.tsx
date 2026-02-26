import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion, useAnimate, useInView } from 'framer-motion';
import { getTeamBranding } from '@/lib/team-branding';
import * as d3 from 'd3';

interface DataPoint {
  label: string;
  value: number;
  teamId?: string;
}

interface AnimatedStatsChartProps {
  data: DataPoint[];
  title: string;
  type?: 'bar' | 'line' | 'area';
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function AnimatedStatsChart({ 
  data, 
  title, 
  type = 'bar',
  height = 300,
  valuePrefix = '',
  valueSuffix = ''
}: AnimatedStatsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!svgRef.current || !isInView || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 100])
      .nice()
      .range([innerHeight, 0]);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'oklch(0.65 0.03 50)')
      .style('font-size', '12px')
      .style('font-family', 'Inter, sans-serif');

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .style('fill', 'oklch(0.65 0.03 50)')
      .style('font-size', '12px')
      .style('font-family', 'Inter, sans-serif');

    g.selectAll('.domain, .tick line')
      .style('stroke', 'oklch(0.28 0.03 35)')
      .style('stroke-width', '1px');

    if (type === 'bar') {
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 6)
        .style('fill', (d, i) => {
          if (d.teamId) {
            const branding = getTeamBranding(d.teamId);
            return branding.primaryColor;
          }
          return i === hoveredIndex
            ? 'oklch(0.72 0.18 45)'
            : 'oklch(0.65 0.15 40)';
        })
        .style('opacity', (_, i) => hoveredIndex === null || hoveredIndex === i ? 1 : 0.5)
        .style('cursor', 'pointer')
        .on('mouseenter', function(_, i) {
          setHoveredIndex(i);
          d3.select(this)
            .transition()
            .duration(200)
            .style('fill', 'oklch(0.72 0.18 45)')
            .attr('y', d => yScale(d.value) - 4)
            .attr('height', d => innerHeight - yScale(d.value) + 4);
        })
        .on('mouseleave', function(_, i) {
          setHoveredIndex(null);
          d3.select(this)
            .transition()
            .duration(200)
            .style('fill', (d: DataPoint) => {
              if (d.teamId) {
                const branding = getTeamBranding(d.teamId);
                return branding.primaryColor;
              }
              return 'oklch(0.65 0.15 40)';
            })
            .attr('y', d => yScale(d.value))
            .attr('height', d => innerHeight - yScale(d.value));
        })
        .transition()
        .duration(800)
        .delay((_, i) => i * 50)
        .ease(d3.easeCubicOut)
        .attr('y', d => yScale(d.value))
        .attr('height', d => innerHeight - yScale(d.value));

      g.selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 8)
        .attr('text-anchor', 'middle')
        .style('fill', 'oklch(0.98 0.01 60)')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('opacity', 0)
        .text(d => `${valuePrefix}${d.value}${valueSuffix}`)
        .transition()
        .duration(800)
        .delay((_, i) => i * 50 + 400)
        .style('opacity', 1);
    }

    if (type === 'line' || type === 'area') {
      const line = d3
        .line<DataPoint>()
        .x(d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      if (type === 'area') {
        const area = d3
          .area<DataPoint>()
          .x(d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
          .y0(innerHeight)
          .y1(d => yScale(d.value))
          .curve(d3.curveMonotoneX);

        const areaPath = g
          .append('path')
          .datum(data)
          .attr('fill', 'url(#area-gradient)')
          .attr('d', area)
          .style('opacity', 0);

        const gradient = svg
          .append('defs')
          .append('linearGradient')
          .attr('id', 'area-gradient')
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '0%')
          .attr('y2', '100%');

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', 'oklch(0.65 0.15 40)')
          .attr('stop-opacity', 0.6);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', 'oklch(0.65 0.15 40)')
          .attr('stop-opacity', 0.05);

        areaPath
          .transition()
          .duration(1000)
          .ease(d3.easeCubicOut)
          .style('opacity', 1);
      }

      const path = g
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'oklch(0.72 0.18 45)')
        .attr('stroke-width', 3)
        .attr('d', line);

      const pathLength = path.node()?.getTotalLength() || 0;

      path
        .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0);

      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.value))
        .attr('r', 0)
        .attr('fill', 'oklch(0.72 0.18 45)')
        .attr('stroke', 'oklch(0.18 0.02 35)')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8);
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5);
        })
        .transition()
        .duration(500)
        .delay((_, i) => i * 100 + 1000)
        .attr('r', 5);
    }

  }, [data, isInView, height, type, hoveredIndex, valuePrefix, valueSuffix]);

  return (
    <Card className="p-6 bg-surface" ref={containerRef}>
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">
        {title}
      </h3>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        style={{ overflow: 'visible' }}
      />
    </Card>
  );
}
