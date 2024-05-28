import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

import { filerSlice } from "./filerSlice";

const makeStore = () =>
  configureStore({
    reducer: {
      [filerSlice.name]: filerSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: true,
  });

export const wrapper = createWrapper(makeStore);
