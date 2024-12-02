export const selectCik = (state) => state.filer.cik;
export const selectTab = (state) => state.filer.tab;
export const selectSort = (state) => state.filer.sort;
export const selectActive = (state) => state.filer.sort.set;
export const selectSold = (state) => state.filer.sort.sold;
export const selectNa = (state) => state.filer.sort.na;
export const selectHeaders = (state) => state.filer.headers;
export const selectStocks = createSelector(
    [(state) => state.filer.value],
    (stocks) => stocks
);
export const selectDates = createSelector(
    [(state) => state.filer.dates],
    (dates) =>
        dates.map((d) => {
            return { ...d, id: d.accessor };
        })
);
export const selectPagination = createSelector(
    [(state) => state.filer.sort],
    (sort) => {
        return { limit: sort.pagination, offset: sort.offset, count: sort.count };
    }
);
export const selectTimeline = (state) => state.filer.timeline;
export const selectFilings = (state) => state.filer.filings;
export const selectPrimary = (state) => state.filer.timeline.comparisons[0];
export const selectSecondary = (state) => state.filer.timeline.comparisons[1];
export const selectDifference = (state) => state.filer.difference;