import { makeNetWorthData } from '../balance-utils';
import { Interval, makeBucketNames } from '../date-utils';
import { ISettings } from '../settings';
import { Moment } from 'moment';
import React from 'react';
import styled from 'styled-components';
import { RechartsLineChart } from './RechartsLineChart';

const Chart = styled.div`
  .ct-label {
    color: var(--text-muted);
  }
`;

export const NetWorthVisualization: React.FC<{
  dailyAccountBalanceMap: Map<string, Map<string, number>>;
  startDate: Moment;
  endDate: Moment;
  interval: Interval;
  settings: ISettings;
}> = (props): JSX.Element => {
  const dateBuckets = makeBucketNames(
    props.interval,
    props.startDate,
    props.endDate,
  );
  const series = [
    makeNetWorthData(
      props.dailyAccountBalanceMap,
      dateBuckets,
      props.settings,
    ),
  ];

  return (
    <>
      <h2>Net Worth</h2>
      <i>Assets minus liabilities</i>

      <Chart>
        <RechartsLineChart
          data={series[0] || []}
          series={series}
          seriesNames={['Net Worth']}
          height="300px"
          width="100%"
          settings={props.settings}
          maxDataPoints={props.settings.maxDataPoints}
        />
      </Chart>
    </>
  );
};
