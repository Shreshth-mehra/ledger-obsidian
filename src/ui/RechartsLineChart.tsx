import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatNumber } from '../number-format-utils';
import { ISettings } from '../settings';

interface ChartDataPoint {
  x: string | number | Date;
  y: number;
}

interface RechartsLineChartProps {
  data: ChartDataPoint[];
  series: ChartDataPoint[][];
  seriesNames: string[];
  height?: string;
  width?: string;
  settings: ISettings;
  maxDataPoints?: number;
}

export const RechartsLineChart: React.FC<RechartsLineChartProps> = ({
  data,
  series,
  seriesNames,
  height = '300px',
  width = '100%',
  settings,
  maxDataPoints = 50,
}) => {
  // Transform data for Recharts format
  const chartData = data.map((point, index) => {
    const dataPoint: any = { name: point.x };
    series.forEach((seriesData, seriesIndex) => {
      if (seriesData[index]) {
        dataPoint[`series${seriesIndex}`] = seriesData[index].y;
      }
    });
    return dataPoint;
  });

  // Limit data points if maxDataPoints is set
  const limitedChartData = maxDataPoints && chartData.length > maxDataPoints 
    ? chartData.slice(-maxDataPoints) 
    : chartData;

  // Custom tooltip formatter
  const formatTooltipValue = (value: any, name: string) => {
    const seriesIndex = parseInt(name.replace('series', ''));
    const seriesName = seriesNames[seriesIndex] || `Series ${seriesIndex}`;
    return [
      `${settings.currencySymbol}${formatNumber(value, settings.notationSystem)}`,
      seriesName,
    ];
  };

  // Custom Y-axis tick formatter
  const formatYAxisTick = (value: number) => {
    return formatNumber(value, settings.notationSystem);
  };

  return (
    <div style={{ height, width }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={limitedChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--background-modifier-border)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-muted)"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="var(--text-muted)"
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip 
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: 'var(--background-primary)',
              border: '1px solid var(--background-modifier-border)',
              borderRadius: '4px',
            }}
            labelStyle={{ color: 'var(--text-normal)' }}
          />
          <Legend />
          {series.map((seriesData, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={`series${index}`}
              stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
              strokeWidth={2}
              dot={{ r: 4, fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)` }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
