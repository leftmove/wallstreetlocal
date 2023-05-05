import { createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

const initialState = {
  value: [
    {
      display: "Name",
      accessor: "name",
      sort: false,
      active: true,
    },
    {
      display: "Sector",
      accessor: "sector",
      sort: false,
      active: true,
    },
    {
      display: "Industry",
      accessor: "industry",
      sort: false,
      active: true,
    },
    {
      display: "Shares Held (Or Principal Amount)",
      accessor: "shares_held",
      sort: false,
      active: true,
    },
    {
      display: "Market Value",
      accessor: "market_value",
      sort: false,
      active: true,
    },
    {
      display: "% of Portfolio",
      accessor: "percent_portfolio",
      sort: false,
      active: true,
    },
    {
      display: "% Ownership",
      accessor: "percent_ownership",
      active: true,
    },
    {
      display: "Buy Date",
      accessor: "buy_date",
      active: true,
    },
    {
      display: "Approximate Price Paid",
      accessor: "price_paid",
      active: true,
    },
    {
      display: "Recent Price",
      accessor: "price_recent",
      active: true,
    },
    {
      display: "% Gain",
      accessor: "percent_gain",
      active: true,
    },
    {
      display: "Report Date",
      accessor: "report_date",
      active: true,
    },
  ],
};

export const headerSlice = createSlice({
  name: "headers",
  initialState,
  reducers: {
    activateHeader(state, action) {
      const headers = state.value;
      const payload = action.payload;
      state = headers.map((h) =>
        h.accessor === payload.accessor ? { ...h, active: !payload.active } : h
      );

      return state;
    },
    sortHeader(state, action) {
      const headers = state.headers;
      const accessor = action.payload.accessor;
      state = headers.map((h) =>
        h.accessor === accessor ? { ...h, sort: true } : { ...h, sort: false }
      );

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

export default headerSlice.reducer;
