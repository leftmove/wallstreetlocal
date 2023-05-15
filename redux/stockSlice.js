import { createSlice } from "@reduxjs/toolkit";
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
      active: false,
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
      active: false,
    },
    {
      display: "Buy Date",
      sort: "buy",
      accessor: "buy_str",
      active: false,
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
    sold: false,
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
    sortActive(state) {
      const sort = state.sort;
      const set = sort.set;
      state.sort = { ...sort, set: !set };

      return state;
    },
    sortSold(state) {
      const sort = state.sort;
      const sold = sort.sold;
      state.sort = { ...sort, sold: !sold };

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

export const {
  activateHeader,
  sortHeader,
  sortActive,
  sortSold,
  setStocks,
  sortStocks,
} = stockSlice.actions;

export const selectSort = (state) => state.stocks.sort;
export const selectActive = (state) => state.stocks.sort.set;
export const selectSold = (state) => state.stocks.sort.sold;
export const selectHeaders = (state) => state.stocks.headers;
export const selectStocks = (state) => {
  const stocks = state.stocks;
  const sort = stocks.sort;
  const accessor = sort.sort;
  let next = stocks.value.slice();

  console.log(sort, next);

  if (sort.set) {
    next = next.filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj.ticker).indexOf(obj.ticker) === pos;
    });
  }

  if (sort.sold == false) {
    next = next.filter((s) => s.sold == false);
  }

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
