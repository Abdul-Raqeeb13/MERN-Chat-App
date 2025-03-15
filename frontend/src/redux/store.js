// import { configureStore } from "@reduxjs/toolkit";
// import chatReducer from "./chatSlice"; // Import chat reducer

// const store = configureStore({
//   reducer: {
//     chat: chatReducer,
//   },
// });

// export default store;


import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice"; // Import chat reducer

const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

export default store;




