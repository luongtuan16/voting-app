import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    provider: null,
    account: null,
    ballotContract: null,
}

export const etherSlice = createSlice({
    name: 'etherState',
    initialState,
    reducers: {
        setAccount: (state, action) => {
            state.account = action.payload;
        },
        setProvider: (state, action) => {
            state.provider = action.payload
        },
        setBallotContract: (state, action) => {
            state.ballotContract = action.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const { setAccount, setProvider, setBallotContract } = etherSlice.actions

export default etherSlice.reducer