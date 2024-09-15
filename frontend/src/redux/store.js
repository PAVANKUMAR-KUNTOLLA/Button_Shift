import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./app/appSlice";

//-----------------------|| REDUX - MAIN STORE ||-----------------------//

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
