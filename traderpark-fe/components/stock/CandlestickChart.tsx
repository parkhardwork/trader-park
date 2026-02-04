"use client";

import { useRef, useEffect, useCallback } from "react";
import type { DailyChartItem } from "@/types";

interface CandlestickChartProps {
  items: DailyChartItem[];
  height?: number;
}

function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

export default function CandlestickChart({ items, height = 400 }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || items.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 60, bottom: 40, left: 20 };

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // Data: reverse so oldest first
    const data = [...items].reverse();
    const maxItems = Math.min(data.length, 60);
    const displayData = data.slice(-maxItems);

    if (displayData.length === 0) return;

    // Price range
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    displayData.forEach((d) => {
      if (d.high > maxPrice) maxPrice = d.high;
      if (d.low < minPrice) minPrice = d.low;
    });

    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;

    // Chart area
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const candleWidth = Math.max(3, (chartWidth / displayData.length) * 0.7);
    const candleGap = chartWidth / displayData.length;

    const priceToY = (price: number): number => {
      return padding.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    };

    // Grid lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const price = maxPrice - ((maxPrice - minPrice) / gridLines) * i;
      ctx.fillStyle = "#64748b";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(formatNumber(Math.round(price)), width - padding.right + 5, y + 4);
    }

    // Draw candles
    displayData.forEach((d, i) => {
      const x = padding.left + candleGap * i + candleGap / 2;
      const isUp = d.close >= d.open;
      const color = isUp ? "#ef4444" : "#3b82f6";

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(d.high));
      ctx.lineTo(x, priceToY(d.low));
      ctx.stroke();

      // Body
      const bodyTop = priceToY(Math.max(d.open, d.close));
      const bodyBottom = priceToY(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Date labels
      if (i % Math.ceil(displayData.length / 6) === 0) {
        ctx.fillStyle = "#64748b";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        const dateStr = d.date
          ? `${d.date.substring(4, 6)}/${d.date.substring(6, 8)}`
          : "";
        ctx.fillText(dateStr, x, height - padding.bottom + 15);
      }
    });

    // Legend
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(width - 100, 10, 12, 12);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("상승", width - 85, 20);

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(width - 100, 28, 12, 12);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("하락", width - 85, 38);
  }, [items, height]);

  useEffect(() => {
    drawChart();

    const handleResize = () => {
      requestAnimationFrame(drawChart);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawChart]);

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
}
