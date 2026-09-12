import React, { useState, useMemo, useRef } from 'react';
import MaterialIcon from './MaterialIcon';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export default function LiveGoldChart({
  chartSeries = {},
  currentPrice = 2500000,
  openPrice = 2500000,
  highPrice = 2500000,
  lowPrice = 2500000,
  changeFormatted = '',
  changePercentageFormatted = '',
  isPositive = true,
  avgBuyPrice = 0,
  karatPrices = {},
  updatedAt = 'Baru saja',
  onRefresh = null,
  isRefreshing = false,
}) {
  const [activeTimeframe, setActiveTimeframe] = useState('1D'); // '1D' | '7D' | '1M' | '1Y'
  const [chartMode, setChartMode] = useState('area'); // 'area' | 'bar'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Selected series data
  const seriesData = useMemo(() => {
    return chartSeries[activeTimeframe] || [];
  }, [chartSeries, activeTimeframe]);

  // Min and Max prices for dynamic scaling
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (seriesData.length === 0) {
      return { minPrice: 2400000, maxPrice: 2600000, priceRange: 200000 };
    }
    const prices = seriesData.map((d) => d.price);
    if (avgBuyPrice > 0) prices.push(avgBuyPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.15 || 50000;
    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding,
      priceRange: max - min + padding * 2 || 100000,
    };
  }, [seriesData, avgBuyPrice]);

  // Dimensions
  const width = 800;
  const height = 320;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 45;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates for points
  const points = useMemo(() => {
    if (seriesData.length === 0) return [];
    return seriesData.map((item, idx) => {
      const x = paddingX + (idx / (seriesData.length - 1 || 1)) * innerWidth;
      const normalizedY = (item.price - minPrice) / priceRange;
      const y = height - paddingBottom - normalizedY * innerHeight;
      return { ...item, x, y, index: idx };
    });
  }, [seriesData, minPrice, priceRange, innerWidth, innerHeight]);

  // Construct SVG Path (Area and Line)
  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2) return { linePath: '', areaPath: '' };

    // Smooth Bezier curve generator
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const area = `${d} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    return { linePath: d, areaPath: area };
  }, [points]);

  // Average buy price line position
  const avgBuyY = useMemo(() => {
    if (avgBuyPrice <= 0) return null;
    const normalizedY = (avgBuyPrice - minPrice) / priceRange;
    return height - paddingBottom - normalizedY * innerHeight;
  }, [avgBuyPrice, minPrice, priceRange, innerHeight]);

  // Handle Mouse Move for Interactive Tooltip
  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    // Find closest point
    let closest = points[0];
    let minDistance = Math.abs(mouseX - closest.x);

    points.forEach((p) => {
      const dist = Math.abs(mouseX - p.x);
      if (dist < minDistance) {
        minDistance = dist;
        closest = p;
      }
    });

    setHoveredPoint(closest);
    setHoverPos({
      x: (closest.x / width) * 100,
      y: (closest.y / height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const latestPoint = points[points.length - 1];
  const firstPoint = points[0];
  const activeChange = hoveredPoint
    ? hoveredPoint.price - (firstPoint?.price || currentPrice)
    : currentPrice - openPrice;
  const activeChangePct = hoveredPoint && firstPoint?.price > 0
    ? ((activeChange / firstPoint.price) * 100).toFixed(2)
    : changePercentageFormatted;

  return (
    <div className="bg-[#1C1A27] text-white border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 relative overflow-hidden">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b-2 border-white/20 pb-4">
        {/* Left: Ticker & Active Hover Price */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FBBF24]" />
            </span>
            <span className="font-label-mono text-xs font-black uppercase tracking-widest text-[#FEF08A]">
              GRAFIK LIVE PASAR EMAS • {activeTimeframe === '1D' ? '24 JAM (INTRADAY)' : activeTimeframe === '7D' ? '7 HARI' : activeTimeframe === '1M' ? '30 HARI' : '1 TAHUN'}
            </span>
            <span className="hidden sm:inline-block bg-white/10 text-white font-label-mono text-[10px] px-2 py-0.5 border border-white/30 uppercase">
              REAL-TIME
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-4">
            <h3 className="text-3xl md:text-5xl font-number-xl font-black text-[#FEF08A] tracking-tight">
              {hoveredPoint ? hoveredPoint.formatted : formatCurrency(currentPrice)}
            </h3>
            <span
              className={`font-label-mono text-xs md:text-sm font-black px-2.5 py-1 border-2 border-black ${
                activeChange >= 0 ? 'bg-[#4ADE80] text-[#14532D]' : 'bg-[#F87171] text-[#7F1D1D]'
              }`}
            >
              {activeChange >= 0 ? '+' : ''}{formatCurrency(activeChange)} ({activeChange >= 0 ? '+' : ''}{activeChangePct}%)
            </span>
            {hoveredPoint && (
              <span className="font-label-mono text-xs text-white/80 font-bold">
                Waktu: <strong>{hoveredPoint.label}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right: Timeframe & Chart Style Toggles */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Timeframe selector */}
          <div className="flex border-2 border-white/40 bg-white/5 p-1 gap-1">
            {['1D', '7D', '1M', '1Y'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveTimeframe(tf)}
                className={`px-3 py-1.5 font-label-mono text-xs font-black uppercase cursor-pointer transition-all ${
                  activeTimeframe === tf
                    ? 'bg-[#F59E0B] text-[#1C1A27] border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-white/80 hover:bg-white/20'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex border-2 border-white/40 bg-white/5 p-1 gap-1">
            <button
              type="button"
              onClick={() => setChartMode('area')}
              className={`p-1.5 font-label-mono text-xs font-bold cursor-pointer transition-all ${
                chartMode === 'area' ? 'bg-[#8B5CF6] text-white border-2 border-black' : 'text-white/70 hover:bg-white/20'
              }`}
              title="Grafik Garis & Area"
            >
              <MaterialIcon name="show_chart" className="text-base" />
            </button>
            <button
              type="button"
              onClick={() => setChartMode('bar')}
              className={`p-1.5 font-label-mono text-xs font-bold cursor-pointer transition-all ${
                chartMode === 'bar' ? 'bg-[#8B5CF6] text-white border-2 border-black' : 'text-white/70 hover:bg-white/20'
              }`}
              title="Grafik Batang Rentang"
            >
              <MaterialIcon name="bar_chart" className="text-base" />
            </button>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 bg-white text-[#1C1A27] border-2 border-black flex items-center justify-center hover:bg-[#FEF08A] transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title="Refresh Data Live"
            >
              <MaterialIcon name="refresh" className={`text-lg font-black ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="relative w-full select-none" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 md:h-80 overflow-visible cursor-crosshair"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gold Area Gradient */}
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          {[0.25, 0.5, 0.75].map((pct, i) => {
            const gridY = paddingTop + innerHeight * pct;
            const priceVal = maxPrice - pct * priceRange;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={gridY}
                  x2={width - paddingX}
                  y2={gridY}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX}
                  y={gridY - 6}
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {formatCurrency(priceVal)}
                </text>
              </g>
            );
          })}

          {/* Average Buy Price Baseline (Modal Beli Anda) */}
          {avgBuyY !== null && (
            <g>
              <line
                x1={paddingX}
                y1={avgBuyY}
                x2={width - paddingX}
                y2={avgBuyY}
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <rect
                x={width - paddingX - 160}
                y={avgBuyY - 18}
                width="160"
                height="20"
                fill="#8B5CF6"
                stroke="#1C1A27"
                strokeWidth="1"
              />
              <text
                x={width - paddingX - 80}
                y={avgBuyY - 4}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="black"
              >
                MODAL BELI: {formatCurrency(avgBuyPrice)}
              </text>
            </g>
          )}

          {/* AREA CHART MODE */}
          {chartMode === 'area' && (
            <>
              {/* Filled Area */}
              <path d={areaPath} fill="url(#goldGradient)" />

              {/* Glowing Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                filter="url(#goldGlow)"
              />
              <path
                d={linePath}
                fill="none"
                stroke="#FEF08A"
                strokeWidth="2"
              />
            </>
          )}

          {/* BAR CHART MODE */}
          {chartMode === 'bar' &&
            points.map((p, i) => {
              const barWidth = Math.max(8, (innerWidth / points.length) * 0.6);
              const barHeight = height - paddingBottom - p.y;
              return (
                <rect
                  key={i}
                  x={p.x - barWidth / 2}
                  y={p.y}
                  width={barWidth}
                  height={Math.max(4, barHeight)}
                  fill={hoveredPoint?.index === i ? '#FEF08A' : '#F59E0B'}
                  stroke="#1C1A27"
                  strokeWidth="2"
                  className="transition-colors cursor-pointer"
                />
              );
            })}

          {/* Live Pulsing Dot on Latest Point */}
          {latestPoint && (
            <g transform={`translate(${latestPoint.x}, ${latestPoint.y})`}>
              <circle r="8" fill="#F59E0B" opacity="0.4" className="animate-ping" />
              <circle r="5" fill="#FEF08A" stroke="#1C1A27" strokeWidth="2" />
            </g>
          )}

          {/* X Axis Labels */}
          {points.map((p, i) => {
            // Show every nth label to avoid crowding
            const step = Math.ceil(points.length / 6);
            if (i % step !== 0 && i !== points.length - 1) return null;
            return (
              <text
                key={i}
                x={p.x}
                y={height - paddingBottom + 20}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.7)"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {p.label}
              </text>
            );
          })}

          {/* Hover Crosshair Vertical Line */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="#FEF08A"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="7"
                fill="#FEF08A"
                stroke="#1C1A27"
                strokeWidth="3"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-[#FDF8FF] text-[#1C1A27] border-3 border-[#1C1A27] p-2.5 neo-shadow-sm font-label-mono text-xs font-black z-20 transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${Math.max(10, Math.min(90, hoverPos.x))}%`,
              top: `${Math.max(15, hoverPos.y - 10)}%`,
            }}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-[#854D0E] uppercase border-b border-black/20 pb-1 mb-1">
              <MaterialIcon name="schedule" className="text-xs" />
              <span>{hoveredPoint.label}</span>
            </div>
            <div className="text-sm font-number-xl text-[#1C1A27]">
              {hoveredPoint.formatted}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Karat Breakdown Strip */}
      <div className="mt-6 pt-4 border-t-2 border-white/20 flex flex-wrap items-center justify-between gap-3 font-label-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-white/60 font-bold uppercase text-[11px]">Kadar Lain:</span>
          {Object.entries(karatPrices).map(([karatKey, item]) => (
            <span
              key={karatKey}
              className="bg-white/10 text-[#FEF08A] px-2.5 py-1 border border-white/20 font-bold"
            >
              {item.karat}: <strong>{item.formatted}</strong>
            </span>
          ))}
        </div>

        <div className="text-white/60 text-[11px] font-bold">
          Terakhir sinkron: {updatedAt}
        </div>
      </div>
    </div>
  );
}

