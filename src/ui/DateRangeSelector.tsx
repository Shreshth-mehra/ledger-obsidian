import { Interval } from '../date-utils';
import {
  Button,
  DatePicker,
  FlexContainer,
  FlexFloatRight,
  FlexShrink,
} from './SharedStyles';
import { Moment } from 'moment';
import { Notice } from 'obsidian';
import React from 'react';
import styled from 'styled-components';

const MarginSpan = styled.span`
  margin: 0 12px;
  
  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`;

const ResponsiveDateContainer = styled(FlexContainer)`
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ResponsiveIntervalButtons = styled(FlexFloatRight)`
  @media (max-width: 768px) {
    margin-left: 0;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
`;

const ResponsiveDateInputs = styled(FlexShrink)`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const DateRangeSelector: React.FC<{
  startDate: Moment;
  endDate: Moment;
  setStartDate: React.Dispatch<React.SetStateAction<Moment>>;
  setEndDate: React.Dispatch<React.SetStateAction<Moment>>;
  interval: Interval;
  setInterval: React.Dispatch<React.SetStateAction<Interval>>;
  maxDataPoints?: number;
}> = (props): JSX.Element => (
  <ResponsiveDateContainer>
    <ResponsiveIntervalButtons className="ledger-interval-selectors">
      <Button
        selected={props.interval === 'day'}
        action={() => {
          props.setInterval('day');
          validateAndUpdateEndDate(
            'day',
            props.startDate,
            props.endDate,
            props.setEndDate,
            props.maxDataPoints,
          );
        }}
      >
        Daily
      </Button>
      <Button
        selected={props.interval === 'week'}
        action={() => {
          props.setInterval('week');
          validateAndUpdateEndDate(
            'week',
            props.startDate,
            props.endDate,
            props.setEndDate,
            props.maxDataPoints,
          );
        }}
      >
        Weekly
      </Button>
      <Button
        selected={props.interval === 'month'}
        action={() => {
          props.setInterval('month');
          validateAndUpdateEndDate(
            'month',
            props.startDate,
            props.endDate,
            props.setEndDate,
            props.maxDataPoints,
          );
        }}
      >
        Monthly
      </Button>
      <Button
        selected={props.interval === 'quarter'}
        action={() => {
          props.setInterval('quarter');
          validateAndUpdateEndDate(
            'quarter',
            props.startDate,
            props.endDate,
            props.setEndDate,
            props.maxDataPoints,
          );
        }}
      >
        Quarterly
      </Button>
    </ResponsiveIntervalButtons>

    <ResponsiveDateInputs className="ledger-daterange-selectors">
      <DatePicker
        type="date"
        placeholder="Start"
        value={props.startDate.format('YYYY-MM-DD')}
        onChange={(e) => {
          const newDate = window.moment(e.target.value);
          props.setStartDate(newDate);
          if (newDate.isAfter(props.endDate)) {
            props.setEndDate(newDate);
          } else {
            validateAndUpdateEndDate(
              props.interval,
              newDate,
              props.endDate,
              props.setEndDate,
              props.maxDataPoints,
            );
          }
        }}
      />
      <MarginSpan>➜</MarginSpan>
      <DatePicker
        type="date"
        placeholder="End"
        value={props.endDate.format('YYYY-MM-DD')}
        max={window.moment().format('YYYY-MM-DD')}
        onChange={(e) => {
          const newDate = window.moment(e.target.value);
          props.setEndDate(newDate.clone());
          if (newDate.isBefore(props.startDate)) {
            props.setStartDate(newDate);
          } else {
            validateAndUpdateStartDate(
              props.interval,
              props.startDate,
              newDate,
              props.setStartDate,
              props.maxDataPoints,
            );
          }
        }}
      />
    </ResponsiveDateInputs>
  </ResponsiveDateContainer>
);

const validateAndUpdateStartDate = (
  interval: Interval,
  startDate: Moment,
  endDate: Moment,
  setStartDate: React.Dispatch<React.SetStateAction<Moment>>,
  maxDataPoints: number = 50,
): void => {
  if (endDate.diff(startDate, interval) > maxDataPoints) {
    new Notice(`Exceeded maximum time window (${maxDataPoints} ${interval}s). Adjusting start date.`);
    setStartDate(endDate.subtract(maxDataPoints, interval));
  }
};

const validateAndUpdateEndDate = (
  interval: Interval,
  startDate: Moment,
  endDate: Moment,
  setEndDate: React.Dispatch<React.SetStateAction<Moment>>,
  maxDataPoints: number = 50,
): void => {
  if (endDate.diff(startDate, interval) > maxDataPoints) {
    new Notice(`Exceeded maximum time window (${maxDataPoints} ${interval}s). Adjusting end date.`);
    setEndDate(startDate.clone().add(maxDataPoints, interval));
  }
};
