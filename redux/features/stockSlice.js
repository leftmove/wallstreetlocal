import { createSlice, current } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

const initialState = {
  value: [],
  headers: [
    {
      display: "Ticker",
      sort: "ticker",
      accessor: "ticker",
      active: true,
    },
    {
      display: "Name",
      sort: "name",
      accessor: "name",
      active: false,
    },
    {
      display: "Class",
      sort: "class",
      accessor: "class",
      active: false,
    },
    {
      display: "Sector",
      sort: "sector",
      accessor: "sector",
      active: false,
    },

    {
      display: "Shares Held (Or Principal Amount)",
      sort: "shares_held",
      accessor: "shares_held_str",
      active: true,
    },
    {
      display: "Market Value",
      sort: "market_value",
      accessor: "market_value_str",
      active: true,
    },
    {
      display: "% of Portfolio",
      sort: "portfolio_percent",
      accessor: "portfolio_str",
      active: true,
    },
    {
      display: "% Ownership",
      sort: "ownership_percent",
      accessor: "ownership_str",
      active: true,
    },
    {
      display: "Buy Date",
      sort: "buy",
      accessor: "buy_str",
      active: true,
    },
    {
      display: "Price Paid",
      sort: "buy_price",
      accessor: "buy_price_str",
      active: true,
    },
    {
      display: "Recent Price",
      sort: "recent_price",
      accessor: "recent_price_str",
      active: true,
    },
    {
      display: "% Gain",
      sort: "gain_percent",
      accessor: "gain_str",
      active: true,
    },
    {
      display: "Industry",
      sort: "industry",
      accessor: "industry",
      active: false,
    },
    {
      display: "Report Date",
      sort: "report",
      accessor: "report_str",
      active: false,
    },
  ],
  sort: {
    sort: "ticker",
    type: "string",
    set: true,
    updated: false,
    reverse: false,
  },
};

export const stockSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    activateHeader(state, action) {
      const headers = state.headers;
      const payload = action.payload;
      state.headers = headers.map((h) =>
        h.accessor === payload ? { ...h, active: !h.active } : h
      );
      console.log(state.headers);

      return state;
    },
    sortHeader(state, action) {
      const payload = action.payload;
      let type = "string";
      switch (payload.sort) {
        case "name":
        case "sector":
        case "industry":
        case "class":
          type = "string";
          break;
        case "shares_held":
        case "market_value":
        case "portfolio_percent":
        case "ownership_percent":
        case "gain_percent":
        case "recent_price":
        case "buy_price":
        case "report":
        case "buy":
          type = "number";
          break;
      }
      state.sort = { ...state.sort, ...payload, type: type };
      return state;
    },
    setStocks(state, action) {
      const stocks = action.payload.map((prev) => {
        const properties = Object.keys(prev);
        const next = {};
        properties.forEach((p) =>
          prev[p] == null ? (next[p] = "NA") : (next[p] = prev[p])
        );
        return next;
      });
      state.value = stocks;
      return state;
    },
  },
  [HYDRATE]: (state, action) => {
    return {
      ...state,
      ...action.payload,
    };
  },
});

export const { activateHeader, sortHeader, setStocks, sortStocks } =
  stockSlice.actions;

export const selectSort = (state) => state.stocks.sort;
export const selectHeaders = (state) => state.stocks.headers;
export const selectStocks = (state) => {
  const stocks = state.stocks;
  const sort = stocks.sort;
  const accessor = sort.sort;
  let next = stocks.value.slice();

  if (sort.set) {
    next = next.filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj.ticker).indexOf(obj.ticker) === pos;
    });
  }

  // if (sort.updated) {
  //   next = next.filter((s) => s.update);
  // }

  if (sort.type == "string") {
    next = next.sort((a, b) => {
      if (a[accessor] === undefined) {
        return 1;
      } else if (b[accessor] === undefined) {
        return -1;
      } else {
        return a[accessor].localeCompare(b[accessor]);
      }
    });
  }

  if (sort.type == "number") {
    next = next.sort((a, b) => a[accessor] - b[accessor]);
  }

  if (sort.reverse) {
    next = next.reverse();
  }

  return next;
};

export default stockSlice.reducer;
