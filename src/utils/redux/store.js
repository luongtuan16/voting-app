import { configureStore } from '@reduxjs/toolkit'
import ethersReducer from './ethers.slice'

export const store = configureStore({
  reducer: {
    etherState: ethersReducer,
  },
})