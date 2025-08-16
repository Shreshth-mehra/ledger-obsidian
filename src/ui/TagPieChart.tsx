import { filterByStartDate, filterByEndDate, filterTransactions } from '../transaction-utils';
import { EnhancedTransaction } from '../parser';
import { ISettings } from '../settings';
import { Moment } from 'moment';
import React from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../number-format-utils';

const Chart = styled.div`
  .ct-legend {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .ct-legend li {
    position: relative;
    padding-left: 1.5rem;
    font-size: 0.9rem;
  }
  
  .ct-legend li:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.3rem;
    width: 1rem;
    height: 1rem;
    border-radius: 2px;
  }
  
  .ct-legend .ct-series-a:before { background-color: #8B9BB4; }
  .ct-legend .ct-series-b:before { background-color: #A8C1A1; }
  .ct-legend .ct-series-c:before { background-color: #E6C79C; }
  .ct-legend .ct-series-d:before { background-color: #D4A5A5; }
  .ct-legend .ct-series-e:before { background-color: #B8A9C9; }
  .ct-legend .ct-series-f:before { background-color: #9FC5E8; }
  .ct-legend .ct-series-g:before { background-color: #B6D7A8; }
  .ct-legend .ct-series-h:before { background-color: #FFD1DC; }
  .ct-legend .ct-series-i:before { background-color: #F4C2A1; }
  .ct-legend .ct-series-j:before { background-color: #D0A3BF; }
  .ct-legend .ct-series-k:before { background-color: #A3D5D3; }
  .ct-legend .ct-series-l:before { background-color: #E8D5B7; }

  /* Chart slice colors - multiple selectors to ensure colors apply */
  .ct-chart-pie .ct-series-a .ct-slice-pie,
  .ct-chart-pie .ct-series-a .ct-slice-pie path { fill: #8B9BB4 !important; }
  
  .ct-chart-pie .ct-series-b .ct-slice-pie,
  .ct-chart-pie .ct-series-b .ct-slice-pie path { fill: #A8C1A1 !important; }
  
  .ct-chart-pie .ct-series-c .ct-slice-pie,
  .ct-chart-pie .ct-series-c .ct-slice-pie path { fill: #E6C79C !important; }
  
  .ct-chart-pie .ct-series-d .ct-slice-pie,
  .ct-chart-pie .ct-series-d .ct-slice-pie path { fill: #D4A5A5 !important; }
  
  .ct-chart-pie .ct-series-e .ct-slice-pie,
  .ct-chart-pie .ct-series-e .ct-slice-pie path { fill: #B8A9C9 !important; }
  
  .ct-chart-pie .ct-series-f .ct-slice-pie,
  .ct-chart-pie .ct-series-f .ct-slice-pie path { fill: #9FC5E8 !important; }
  
  .ct-chart-pie .ct-series-g .ct-slice-pie,
  .ct-chart-pie .ct-series-g .ct-slice-pie path { fill: #B6D7A8 !important; }
  
  .ct-chart-pie .ct-series-h .ct-slice-pie,
  .ct-chart-pie .ct-series-h .ct-slice-pie path { fill: #FFD1DC !important; }
  
  .ct-chart-pie .ct-series-i .ct-slice-pie,
  .ct-chart-pie .ct-series-i .ct-slice-pie path { fill: #F4C2A1 !important; }
  
  .ct-chart-pie .ct-series-j .ct-slice-pie,
  .ct-chart-pie .ct-series-j .ct-slice-pie path { fill: #D0A3BF !important; }
  
  .ct-chart-pie .ct-series-k .ct-slice-pie,
  .ct-chart-pie .ct-series-k .ct-slice-pie path { fill: #A3D5D3 !important; }
  
  .ct-chart-pie .ct-series-l .ct-slice-pie,
  .ct-chart-pie .ct-series-l .ct-slice-pie path { fill: #E8D5B7 !important; }

  /* Fallback: If series classes don't work, try targeting by slice index */
  .ct-slice-pie:nth-child(1) { fill: #8B9BB4 !important; }
  .ct-slice-pie:nth-child(2) { fill: #A8C1A1 !important; }
  .ct-slice-pie:nth-child(3) { fill: #E6C79C !important; }
  .ct-slice-pie:nth-child(4) { fill: #D4A5A5 !important; }
  .ct-slice-pie:nth-child(5) { fill: #B8A9C9 !important; }
  .ct-slice-pie:nth-child(6) { fill: #9FC5E8 !important; }
  .ct-slice-pie:nth-child(7) { fill: #B6D7A8 !important; }
  .ct-slice-pie:nth-child(8) { fill: #FFD1DC !important; }
  .ct-slice-pie:nth-child(9) { fill: #F4C2A1 !important; }
  .ct-slice-pie:nth-child(10) { fill: #D0A3BF !important; }
  .ct-slice-pie:nth-child(11) { fill: #A3D5D3 !important; }
  .ct-slice-pie:nth-child(12) { fill: #E8D5B7 !important; }
`;

interface TagData {
  label: string;
  value: number;
  percentage: number;
}

/**
 * Aggregates transaction amounts by tags across all transactions
 */
const aggregateByTags = (
  transactions: EnhancedTransaction[],
  startDate: Moment,
  endDate: Moment
): TagData[] => {
  // Filter transactions by date range
  const filteredTxs = filterTransactions(
    filterTransactions(transactions, filterByStartDate(startDate)),
    filterByEndDate(endDate)
  );
  
  const tagTotals = new Map<string, number>();
  
  filteredTxs.forEach(tx => {
    tx.value.expenselines.forEach(line => {
      if ('tags' in line && line.tags && line.tags.length > 0) {
        line.tags.forEach(tag => {
          // Use absolute value for all transactions to show spending magnitude
          const amount = Math.abs(line.amount);
          tagTotals.set(tag, (tagTotals.get(tag) || 0) + amount);
        });
      }
    });
  });
  
  // Convert to array and calculate percentages
  const totalAmount = Array.from(tagTotals.values()).reduce((sum, val) => sum + val, 0);
  
  if (totalAmount === 0) return [];
  
  return Array.from(tagTotals.entries())
    .map(([label, value]) => ({
      label,
      value,
      percentage: (value / totalAmount) * 100
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending
};

export const TagPieChart: React.FC<{
  transactions: EnhancedTransaction[];
  startDate: Moment;
  endDate: Moment;
  currencySymbol: string;
  settings: ISettings;
}> = (props): JSX.Element => {
  const tagData = React.useMemo(() => 
    aggregateByTags(
      props.transactions,
      props.startDate,
      props.endDate
    ), 
    [props.transactions, props.startDate, props.endDate]
  );

  if (tagData.length === 0) {
    return (
      <div>
        <p>No tags found in transactions for the selected date range.</p>
        <p><i>Add hashtags to transaction comments (e.g., #experience #social) to see tag distribution.</i></p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = tagData.map((item, index) => ({
    name: item.label,
    value: item.value,
    fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
  }));

  return (
    <div>
      <p>
        <i>
          Total Tagged Spending: {formatCurrency(
            tagData.reduce((sum, item) => sum + item.value, 0),
            props.currencySymbol,
            props.settings.notationSystem
          )}
        </i>
      </p>
      
      <Chart>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                formatCurrency(value, props.currencySymbol, props.settings.notationSystem),
                'Amount'
              ]}
              contentStyle={{
                backgroundColor: 'var(--background-primary)',
                border: '1px solid var(--background-modifier-border)',
                borderRadius: '4px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {tagData.map((item, index) => (
            <li key={item.label} style={{ marginBottom: '0.5rem' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '12px', 
                height: '12px', 
                backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                marginRight: '8px',
                borderRadius: '2px'
              }}></span>
              #{item.label}: {formatCurrency(item.value, props.currencySymbol, props.settings.notationSystem)} ({item.percentage.toFixed(1)}%)
            </li>
          ))}
        </ul>
      </Chart>
    </div>
  );
};
