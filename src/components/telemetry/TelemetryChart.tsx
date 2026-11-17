"use client";

export interface TelemetryChartPoint {
  label: string;
  value: number;
}

interface TelemetryChartProps {
  title: string;
  description: string;
  points: TelemetryChartPoint[];
  color: string;
}

export function TelemetryChart({
  title,
  description,
  points,
  color,
}: TelemetryChartProps) {
  const width = 360;
  const height = 132;
  const padding = { top: 8, right: 8, bottom: 24, left: 8 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.value));
  const slotWidth = points.length > 0 ? chartWidth / points.length : 0;
  const barWidth = Math.max(3, slotWidth * 0.62);

  return (
    <div>
      <svg
        role="img"
        aria-label={`${title}. ${description}`}
        viewBox={`0 0 ${width} ${height}`}
        className="h-36 w-full"
        preserveAspectRatio="none"
      >
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        {points.length === 0 ? (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            className="fill-slate-500 text-xs"
          >
            No opted-in events yet
          </text>
        ) : (
          points.map((point, index) => {
            const barHeight = (point.value / maxValue) * chartHeight;
            const x =
              padding.left + slotWidth * index + (slotWidth - barWidth) / 2;
            const y = padding.top + chartHeight - barHeight;

            return (
              <g key={`${point.label}-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(1, barHeight)}
                  rx="2"
                  fill={color}
                >
                  <title>
                    {point.label}: {point.value}
                  </title>
                </rect>
                {points.length <= 12 && (
                  <text
                    x={x + barWidth / 2}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-slate-500 text-[9px]"
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      <ul className="sr-only">
        {points.map((point, index) => (
          <li key={`${point.label}-summary-${index}`}>
            {point.label}: {point.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
