import { createSlice, createSelector } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
const initialDate = new Date();

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

const initialState = {
    cik: "",
    value: [],
    headers: initialHeaders,
    tab: "stocks",
    sort: initialSort,
    filings: [],
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
export const generalSlice = createSlice({
    name: 'general',
    initialState,
    reducers: {
        setCik(state, action) {
            Object.keys(initialState).map((k) => {
                state[k] = initialState[k];
            });
            state.cik = action.payload;

            return state;
        },
        setTab(state, action) {
            const payload = action.payload;
            state.tab = payload;

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
                case "cusip":
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
                case "buy":
                case "report":
                case "sold_time":
                    type = "date";
                    break;
                default:
                    type = typeof payload.sort === "number" ? "number" : "string";
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
                ...payload,
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
        removeHeader(state, action) {
            const payload = action.payload;
            const headers = state.headers.filter((h) => h.accessor !== payload);

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
        sortNa(state) {
            const sort = state.sort;
            const na = sort.na;
            state.sort = { ...sort, na: !na };

            return state;
        },
        setStocks(state, action) {
            const stocks = action.payload;
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
        setPagination(state, action) {
            state.sort.pagination = action.payload;
            return state;
        },
        setCount(state, action) {
            const sort = state.sort;
            const payload = action.payload;
            const pagination = sort.pagination;

            if (pagination < 0) {
                state.sort.pagination = payload > 100 ? 100 : payload;
            }

            state.sort.count = payload;
            return state;
        },
        setOffset(state, action) {
            const payload = action.payload;
            if (payload >= 0) {
                state.sort.offset = Number(payload);
            }
            return state;
        },
        setFilings(state, action) {
            const payload = action.payload;

            state.filings = payload;
            return state;
        },
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
})

export const selectCik = (state) => state.general.cik;
export const selectTab = (state) => state.general.tab;
export const selectSort = (state) => state.general.sort;
export const selectActive = (state) => state.general.sort.set;
export const selectSold = (state) => state.general.sort.sold;
export const selectNa = (state) => state.general.sort.na;
export const selectHeaders = (state) => state.general.headers;
export const selectStocks = createSelector(
    [(state) => state.general.value],
    (stocks) => stocks
);
export const selectDates = createSelector(
    [(state) => state.general.dates],
    (dates) =>
        dates.map((d) => {
            return { ...d, id: d.accessor };
        })
);
export const selectPagination = createSelector(
    [(state) => state.general.sort],
    (sort) => {
        return { limit: sort.pagination, offset: sort.offset, count: sort.count };
    }
);

export const {
    activateHeader,
    addDate,
    addHeader,
    editDate,
    editHeader,
    newDate,
    openDate,
    removeDate,
    removeHeader,
    setCik,
    setCount,
    setHeaders,
    setOffset,
    setPagination,
    setStocks,
    setTab,
    sortActive,
    sortHeader,
    sortNa,
    sortSold,
    updateDates,
    updateStocks,
} = generalSlice.actions;

export default generalSlice.reducer;