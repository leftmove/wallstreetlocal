// src/features/timeline/timelineSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

const initialHeaders = [
  {
    display: "Ticker",
    sort: "ticker",
    accessor: "ticker",
    active: true,
    tooltip:
      "This is a unique series of letters assigned to a security for trading purposes",
  },
  {
    display: "Name",
    sort: "name",
    accessor: "name",
    active: false,
    tooltip: "The name of the stock.",
  },
  {
    display: "Class",
    sort: "class",
    accessor: "class",
    active: false,
    tooltip:
      "This refers to the rights of a stockholder, including things like voting and dividends.",
  },
  {
    display: "Sector",
    sort: "sector",
    accessor: "sector",
    active: false,
    tooltip: "The broader industry category to which the stock belongs.",
  },
  {
    display: "CUSIP",
    sort: "cusip",
    accessor: "cusip",
    active: false,
    tooltip:
      "A unique identifier assigned to each registered security in the United States and Canada.",
  },
  {
    display: "Shares Held",
    sort: "shares_held",
    accessor: "shares_held_str",
    active: false,
    tooltip: "The number of shares held, or the principal amount of the stock.",
  },
  {
    display: "Market Value",
    sort: "market_value",
    accessor: "market_value_str",
    active: true,
    tooltip: "The value for the shares of the stock the filer owns.",
  },
  {
    display: "% Portfolio",
    sort: "portfolio_percent",
    accessor: "portfolio_str",
    active: true,
    tooltip:
      "The value of this stock's shares divided by the total value of the portfolio, expressed in percent. ( Value of Shares / Value of Portfolio )",
  },
  {
    display: "% Ownership",
    sort: "ownership_percent",
    accessor: "ownership_str",
    active: false,
    tooltip:
      "The number of shares owned, divided by the current total of shares outstanding, expressed in percent. This value is only accurate the most value of shares outstanding. ( Shares Owned / Shares Existing )",
  },
  {
    display: "Sold Date",
    sort: "sold_time",
    accessor: "sold_str",
    active: false,
    tooltip:
      "The date the stock was sold, taken by retrieving the report date of the last SEC filing said stock showed up on. This is only accurate up to the quarter.",
  },
  {
    display: "Buy Date",
    sort: "buy_time",
    accessor: "buy_str",
    active: false,
    tooltip:
      "The date the stock was bought, according to the report date of the first SEC filing it appeared on. This is only accurate up to the quarter, and only the most recent bought date is shown.",
  },
  {
    display: "Price Paid",
    sort: "buy_price",
    accessor: "buy_price_str",
    active: true,
    tooltip:
      "The price paid for the stock, estimated by taking a close price most near the quarter from which the stock was first reported.",
  },
  {
    display: "Recent Price",
    sort: "recent_price",
    accessor: "recent_price_str",
    active: true,
    tooltip:
      "The recent price of the stock. This may be a couple days delayed.",
  },
  {
    display: "% Gain",
    sort: "gain_percent",
    accessor: "gain_str",
    active: true,
    tooltip:
      "The price paid for the stock subtracted from the recent price, and then divided by price paid, expressed in percent. ( ( Recent Price - Price Paid ) / Price Paid )",
  },
  {
    display: "Industry",
    sort: "industry",
    accessor: "industry",
    active: false,
    tooltip:
      "The specific sector or category of the economy in which the stock's company operates.",
  },
  {
    display: "Report Date",
    sort: "report",
    accessor: "report_str",
    active: false,
    tooltip:
      "The report date listed on the SEC filing this stock was taken from.",
  },
];

const initialSort = {
  sort: "ticker",
  type: "string",
  set: true,
  na: false,
  sold: false,
  reverse: true,
  pagination: 100,
  limit: 100,
  count: 0,
  offset: 0,
};
const initialComparisons = initialHeaders.map((h) => {
  switch (h.sort) {
    case "buy_price":
      return { ...h, active: false };
    case "recent_price":
      return { ...h, active: false };
    case "gain_percent":
      return { ...h, active: false };
    default:
      return h;
  }
});
const initialState = {
  timeline: {
    comparisons: [
      {
        type: "primary",
        access: "",
        filing: {
          time: 0,
          date: "",
        },
        report: {
          time: 0,
          date: "",
        },
        headers: initialComparisons,
        sort: initialSort,
        stocks: [],
        value: "",
        filingTime: 0,
        reportTime: 0,
        filingDate: "",
        reportDate: ""
      },
      {
        type: "secondary",
        access: "",
        filingTime: 0,
        reportTime: 0,
        filingDate: "",
        reportDate: "",
        headers: initialComparisons,
        sort: initialSort,
        stocks: [],

      },
    ],
    open: false,
  },
  filings: []
};

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setSecondary(state, action) {
      const payload = action.payload;

      const comparisons = state.timeline.comparisons;
      const secondary = comparisons[1];
      state.timeline.comparisons[1] = { ...secondary, ...payload };

      return state;
    },
    setOpen(state) {
      const open = state.timeline.open;

      state.timeline.open = !open;
      return state;
    },
    editComparison(state, action) {
      const payload = action.payload;
      const type = payload.type;

      const comparison = payload;
      const comparisons = state.timeline.comparisons.map((c) => {
        return c.type == type ? { ...c, ...comparison } : c;
      });

      state.timeline.comparisons = comparisons;
      return state;
    },
    editSort(state, action) {
      const payload = action.payload;
      const type = payload.type;
      delete payload.type;

      const comparisons = state.timeline.comparisons.map((c) => {
        return c.type == type ? { ...c, sort: { ...c.sort, ...payload } } : c;
      });

      state.timeline.comparisons = comparisons;
      return state;
    },
    setFilingCount(state, action) {
      const payload = action.payload;
      const type = payload.type;
      const count = payload.count;

      const comparisons = state.timeline.comparisons.map((c) =>
        c.type === type
          ? {
            ...c,
            sort: { ...c.sort, pagination: count > 100 ? 100 : count, count },
          }
          : c
      );

      state.timeline.comparisons = comparisons;
      return state;
    },
    setPrimary(state, action) {
      const payload = action.payload;

      const comparisons = state.timeline.comparisons;
      const primary = comparisons[0];
      state.timeline.comparisons[0] = { ...primary, ...payload };

      return state;
    },
    setComparison(state, action) {
      const payload = action.payload;
      const type = payload.type;
      const access = payload.access;

      const filing = state.filings.find((f) => f.access_number == access);
      const filingDate = new Date(filing.filing_date * 1000);
      const reportDate = new Date(filing.report_date * 1000);
      const filingTime = filingDate.getTime() / 1000;
      const reportTime = reportDate.getTime();
      const filingStr = filingDate.toLocaleDateString();
      const reportStr = reportDate.toLocaleDateString();
      const marketValue = new Intl.NumberFormat().format(filing.market_value);
      const filingStocks = filing.stocks;

      const comparisonIndex = state.timeline.comparisons.findIndex(
        (c) => c.type == type
      );
      const comparison = state.timeline.comparisons[comparisonIndex];

      state.timeline.comparisons[comparisonIndex] = {
        ...comparison,
        access,
        filing: {
          time: filingTime,
          date: filingStr,
        },
        report: {
          time: reportTime,
          date: reportStr,
        },
        stocks: filingStocks,
        value: marketValue,
      };
      return state;
    },
    [HYDRATE]: (state, action) => {
      return {
          ...state,
          ...action.payload,
      };
  },
  },
});

export const selectTimeline = (state) => state.timeline.timeline;
export const selectFilings = (state) => state.timeline.filings;
export const selectPrimary = (state) => state.timeline.timeline.comparisons[0];
export const selectSecondary = (state) => state.timeline.timeline.comparisons[1];

export const { editComparison, editSort, setComparison, setFilingCount, setOpen, setPrimary, setSecondary } = timelineSlice.actions;
export default timelineSlice.reducer;
