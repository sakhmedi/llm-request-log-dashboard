import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LlmRequest } from '../types';
import { buildLatencySeries } from '../lib/chart';
import { formatBucketLabel, formatMs } from '../lib/format';

interface LatencyChartProps {
  requests: readonly LlmRequest[];
  isDark: boolean;
}

/**
 * Цвета графика для каждой темы. SVG-элементы Recharts не понимают Tailwind-классы,
 * поэтому передаём цвета пропсами. Пара синий/оранжевый различима и при дальтонизме.
 */
const CHART_COLORS = {
  light: {
    avg: '#2a78d6',
    p95: '#eb6834',
    grid: '#e2e8f0',
    axis: '#64748b',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e2e8f0',
    text: '#0f172a',
  },
  dark: {
    avg: '#3987e5',
    p95: '#d95926',
    grid: '#1e293b',
    axis: '#94a3b8',
    tooltipBg: '#0f172a',
    tooltipBorder: '#334155',
    text: '#f1f5f9',
  },
} as const;

/** 950 → «950 мс», 2400 → «2,4 с» — короткие подписи для оси Y. */
function formatAxisMs(value: number): string {
  return value >= 1000
    ? `${(value / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} с`
    : `${value} мс`;
}

export function LatencyChart({ requests, isDark }: LatencyChartProps) {
  // Агрегация — тяжёлая операция, пересчитываем только когда меняются данные.
  const { bucket, points } = useMemo(() => buildLatencySeries(requests), [requests]);
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const showDots = points.length <= 2; // одну точку без маркера не видно

  return (
    <section className="card p-4" aria-labelledby="latency-chart-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="latency-chart-title" className="text-base font-semibold">
          Задержка ответа
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Среднее и p95, {bucket === 'hour' ? 'по часам' : 'по дням'} (UTC)
        </p>
      </div>

      {/* role="img" + описание: для скринридера график — картинка, подробности есть в таблице ниже */}
      <div
        className="h-64 sm:h-72"
        role="img"
        aria-label={`График задержки: ${points.length} точек, средняя задержка и 95-й перцентиль`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(time: number) => formatBucketLabel(time, bucket)}
              tick={{ fill: colors.axis, fontSize: 12 }}
              stroke={colors.grid}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={formatAxisMs}
              tick={{ fill: colors.axis, fontSize: 12 }}
              stroke={colors.grid}
              width={56}
            />
            <Tooltip
              labelFormatter={(label: unknown) =>
                typeof label === 'number' ? formatBucketLabel(label, bucket) : ''
              }
              formatter={(value) => (typeof value === 'number' ? formatMs(value) : String(value))}
              contentStyle={{
                background: colors.tooltipBg,
                borderColor: colors.tooltipBorder,
                borderRadius: 8,
                color: colors.text,
                fontSize: 13,
              }}
              labelStyle={{ color: colors.text, fontWeight: 600 }}
              cursor={{ stroke: colors.axis, strokeDasharray: '4 4' }}
            />
            <Legend wrapperStyle={{ fontSize: 13, color: colors.axis }} />
            <Line
              type="monotone"
              dataKey="avgLatencyMs"
              name="Среднее"
              stroke={colors.avg}
              strokeWidth={2}
              dot={showDots}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p95LatencyMs"
              name="p95"
              stroke={colors.p95}
              strokeWidth={2}
              dot={showDots}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
