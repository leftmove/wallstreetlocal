import { createSlice, current } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

const initialDate = new Date();
const initialState = {
  value: [
    {
      year: initialDate.getFullYear(),
      month: initialDate.getMonth(),
      day: initialDate.getDate(),
      accessor: initialDate.toLocaleDateString(),
    },
  ],
};

export const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    addDate(state, action) {
      const dates = state.value;
      dates.push(action.payload);
      state.value = dates;

      return state;
    },
    removeDate(state, action) {
      const accessor = action.payload;
      const dates = state.value.filter((date) => date.accessor !== accessor);
      state.value = dates;

      return state;
    },
    editDate(state, action) {
      const payload = action.payload;
      const dates = state.value.map((date) => {
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
            accessor: newDate.toLocaleDateString(),
          };
        } else return date;
      });
      state.value = dates;
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

export const selectDates = (state) => state.date.value;
export const { addDate, removeDate, editDate } = dateSlice.actions;

export default dateSlice.reducer;
