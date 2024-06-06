import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { createWrapper, Context, MakeStore } from "next-redux-wrapper";
import { AnyAction, MiddlewareArray } from "@reduxjs/toolkit";
import { filerSlice } from "./filerSlice";
interface StoreState {
  [key: string]: any;
}
const makeStore: MakeStore<EnhancedStore<StoreState, AnyAction>> = (context: Context) =>
  configureStore({
    reducer: {
      [filerSlice.name]: filerSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }) as MiddlewareArray,
    devTools: true,
  });
export const wrapper = createWrapper<EnhancedStore<StoreState, AnyAction>>(makeStore);