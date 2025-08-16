import {
  makeBalanceData,
  makeDailyAccountBalanceChangeMap,
  makeDeltaData,
  removeDuplicateAccounts,
} from '../balance-utils';
import { Interval, makeBucketNames } from '../date-utils';
import { EnhancedTransaction } from '../parser';
import { ISettings } from '../settings';
import { Moment } from 'moment';
import React from 'react';
import styled from 'styled-components';
import { AccountPieChart } from './AccountPieChart';
import { RechartsLineChart } from './RechartsLineChart';
import { RechartsBarChart } from './RechartsBarChart';

const ChartHeader = styled.div`
  display: flex;
`;

const Legend = styled.div`
  margin-left: auto;
  flex-shrink: 1;
`;

const ChartTypeSelector = styled.div`
  flex-shrink: 1;
  flex-grow: 0;
`;

const Chart = styled.div`
  .ct-label {
    color: var(--text-muted);
  }
`;

export const AccountVisualization: React.FC<{
  dailyAccountBalanceMap: Map<string, Map<string, number>>;
  allAccounts: string[];
  selectedAccounts: string[];
  startDate: Moment;
  endDate: Moment;
  interval: Interval;
  transactions: EnhancedTransaction[];
  currencySymbol: string;
  settings: ISettings;
}> = (props): JSX.Element => {
  // TODO: Set the default mode based on the type of account selected
  const [mode, setMode] = React.useState('balance');

  console.log(props.dailyAccountBalanceMap);

  const filteredAccounts = removeDuplicateAccounts(props.selectedAccounts);
  const dateBuckets = makeBucketNames(
    props.interval,
    props.startDate,
    props.endDate,
  );

  // Check if we have exactly one account selected for pie chart eligibility
  const canShowPieChart = filteredAccounts.length === 1;
  
  const visualization =
    mode === 'balance' ? (
      <BalanceVisualization
        dailyAccountBalanceMap={props.dailyAccountBalanceMap}
        allAccounts={props.allAccounts}
        accounts={filteredAccounts}
        dateBuckets={dateBuckets}
        settings={props.settings}
      />
    ) : mode === 'pnl' ? (
      <DeltaVisualization
        dailyAccountBalanceMap={props.dailyAccountBalanceMap}
        allAccounts={props.allAccounts}
        accounts={filteredAccounts}
        dateBuckets={dateBuckets}
        startDate={props.startDate}
        interval={props.interval}
        settings={props.settings}
      />
    ) : (
      <AccountPieChart
        transactions={props.transactions}
        selectedAccount={filteredAccounts[0]}
        startDate={props.startDate}
        endDate={props.endDate}
        currencySymbol={props.currencySymbol}
        settings={props.settings}
      />
    );

  return (
    <>
      <ChartHeader>
        <ChartTypeSelector>
          <select
            className="dropdown"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
            }}
          >
            <option value="balance">Account Balance</option>
            <option value="pnl">Profit and Loss</option>
            {canShowPieChart && (
              <option value="subcategory">Subcategory Distribution</option>
            )}
          </select>
        </ChartTypeSelector>
        {mode !== 'subcategory' && (
          <Legend>
            <ul className="ct-legend">
              {filteredAccounts.map((account, i) => (
                <li key={account} className={`ct-series-${i}`}>
                  {account}
                </li>
              ))}
            </ul>
          </Legend>
        )}
      </ChartHeader>
      <Chart>{visualization}</Chart>
    </>
  );
};

const BalanceVisualization: React.FC<{
  dailyAccountBalanceMap: Map<string, Map<string, number>>;
  allAccounts: string[];
  accounts: string[];
  dateBuckets: string[];
  settings: ISettings;
}> = (props): JSX.Element => {
  const series = props.accounts.map((account) =>
    makeBalanceData(
      props.dailyAccountBalanceMap,
      props.dateBuckets,
      account,
      props.allAccounts,
    ),
  );

  return (
    <RechartsLineChart
      data={series[0] || []}
      series={series}
      seriesNames={props.accounts}
      height="300px"
      width="100%"
      settings={props.settings}
      maxDataPoints={props.settings.maxDataPoints}
    />
  );
};

const DeltaVisualization: React.FC<{
  dailyAccountBalanceMap: Map<string, Map<string, number>>;
  allAccounts: string[];
  accounts: string[];
  dateBuckets: string[];
  startDate: Moment;
  interval: Interval;
  settings: ISettings;
}> = (props): JSX.Element => {
  const series = props.accounts.map((account) =>
    makeDeltaData(
      props.dailyAccountBalanceMap,
      props.startDate
        .clone()
        .subtract(1, props.interval)
        .format('YYYY-MM-DD'),
      props.dateBuckets,
      account,
      props.allAccounts,
    ),
  );

  return (
    <RechartsBarChart
      data={series[0] || []}
      series={series}
      seriesNames={props.accounts}
      height="300px"
      width="100%"
      settings={props.settings}
      maxDataPoints={props.settings.maxDataPoints}
    />
  );
};
