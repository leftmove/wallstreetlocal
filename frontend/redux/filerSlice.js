import { createSlice, current } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

const initialDate = new Date();
const initialState = {
  cik: "",
  value: [],
  headers: [
    {
      display: "Ticker",
      sort: "ticker",
      accessor: "ticker_str",
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
      display: "Sold",
      sort: "sold_time",
      accessor: "sold_str",
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
  dates: [
    {
      year: initialDate.getFullYear(),
      month: initialDate.getMonth(),
      day: initialDate.getDate(),
      timestamp: initialDate.getTime() / 1000,
      open: false,
      accessor: initialDate.toLocaleDateString(),
    },
  ],
};

export const filerSlice = createSlice({
  name: "filer",
  initialState,
  reducers: {
    setCik(state, action) {
      state.cik = action.payload;

      return state;
    },
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
        case "sold_time":
          type = "number";
          break;
        case "date":
          type = "date";
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
    addHeader(state, action) {
      const payload = action.payload;
      const headers = state.headers;

      headers.push({
        display: payload.display,
        sort: payload.sort,
        accessor: payload.accessor,
        active: true,
      });

      state.headers = headers;
      return state;
    },
    editHeader(state, action) {
      const payload = action.payload;
      const headers = state.headers.map((h) =>
        h.accessor === payload.accessor ? { ...h, display: payload.display } : h
      );

      state.headers = headers;
      return state;
    },
    setHeaders(state, action) {
      const payload = action.payload;
      state.headers = payload;

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
    updateStocks(state, action) {
      const payload = action.payload;
      const field = payload.field;
      const values = payload.values;

      let stocks = state.value;
      stocks = stocks.map((stock) => {
        const cusip = stock.cusip;
        const value = values[cusip];

        return { ...stock, [field]: value };
      });

      state.value = stocks;
      return state;
    },
    addDate(state, action) {
      const dates = state.dates;
      dates.push(action.payload);
      state.dates = dates;

      return state;
    },
    removeDate(state, action) {
      const accessor = action.payload;
      const dates = state.dates;
      state.dates = dates.filter((date) => date.accessor !== accessor);
      return state;
    },
    editDate(state, action) {
      const payload = action.payload;
      const dates = state.dates.map((date) => {
        if (payload.accessor === date.accessor) {
          let newDate = new Date(date.year, date.month, date.day);
          switch (payload.type) {
            case "year":
              newDate.setFullYear(payload.value);
              break;
            case "month":
              newDate.setMonth(payload.value);
              break;
            case "day":
              newDate.setDate(payload.value);
              break;
            case "date":
              newDate = new Date(payload.value);
              break;
            default:
              break;
          }
          return {
            year: newDate.getFullYear(),
            month: newDate.getMonth(),
            day: newDate.getDate(),
            timestamp: newDate.getTime() / 1000,
            open: true,
            accessor: date.accessor,
          };
        } else return date;
      });
      state.dates = dates;
      return state;
    },
    updateDates(state, action) {
      const payload = action.payload;

      // const over = payload.over;
      // const accessor = payload.accessor;
      // const active = dates.find((d) => d.accessor === accessor);

      // const activeIndex = dates.findIndex((d) => d.accessor === accessor);
      // const overIndex = dates.findIndex((d) => d.accessor === over);

      // arrayMove()

      // dates.splice(activeIndex, 1);
      // dates.splice(overIndex, 0, active);

      state.dates = payload;
      return state;
    },
    openDate(state, action) {
      const payload = action.payload;
      const accessor = payload.accessor;
      const dates = state.dates.map((date) =>
        date.accessor === accessor ? { ...date, open: payload.open } : date
      );
      state.dates = dates;
      return state;
    },
    newDate(state) {
      const dates = state.dates;
      const latestDate = dates.at(-1) || {
        year: initialDate.getFullYear(),
        month: initialDate.getMonth(),
        day: initialDate.getDate(),
        timestamp: initialDate.getTime() / 1000,
        open: false,
        accessor: initialDate.toLocaleDateString(),
      };
      const newDate = new Date(latestDate.accessor);
      newDate.setDate(newDate.getDate() + 1);

      dates.push({
        year: newDate.getFullYear(),
        month: newDate.getMonth(),
        day: newDate.getDate(),
        timestamp: newDate.getTime() / 1000,
        open: false,
        accessor: newDate.toLocaleDateString(),
      });

      state.dates = dates;
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

export const selectCik = (state) => state.filer.cik;
export const selectSort = (state) => state.filer.sort;
export const selectActive = (state) => state.filer.sort.set;
export const selectSold = (state) => state.filer.sort.sold;
export const selectHeaders = (state) => state.filer.headers;
export const selectStocks = (state) => {
  const filer = state.filer;
  const sort = filer.sort;
  const accessor = sort.sort;
  let next = filer.value.slice();

  if (!next) return next;

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
export const selectDates = (state) =>
  state.filer.dates.map((d) => {
    return { ...d, id: d.accessor };
  });
export const {
  setCik,
  activateHeader,
  addHeader,
  editHeader,
  sortHeader,
  sortActive,
  sortSold,
  updateStocks,
  setStocks,
  sortStocks,
  addDate,
  setHeaders,
  removeDate,
  editDate,
  openDate,
  updateDates,
  newDate,
} = filerSlice.actions;

export default filerSlice.reducer;
