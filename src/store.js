import { configureStore } from '@reduxjs/toolkit'
import counterSlice      from './redux-slice/slice'

const store = configureStore({
  reducer: {
    appState: counterSlice
  },
})

store.subscribe(() => {

  const state = store.getState();

  localStorage.setItem("redux-store", JSON.stringify(state));
});

export default store;