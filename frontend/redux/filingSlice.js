import { createSlice, createSelector } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

const initialState = {
  cik: "",
  accessNumber: "",
};

export const filingSlice = createSlice({
  name: "filing",
  initialState,
  reducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const {} = filingSlice.actions;
export default filingSlice.reducer;
