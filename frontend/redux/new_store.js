import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

import { generalSlice } from "./generalSlice";
import { timelineSlice } from "./timelineSlice";
import { differenceSlice } from "./differenceSlice";

const makeStore = () =>
  configureStore({
    reducer: {
      [generalSlice.name]: generalSlice.reducer,
      [timelineSlice.name]: timelineSlice.reducer,
      [differenceSlice.name]: differenceSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: true,
  });

export const wrapper = createWrapper(makeStore);
