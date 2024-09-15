import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profile: {},
    users: [],
    workboards: [],
    workboard: {},
    isLoadingSpin:false
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUserInfo(state, action) {
    state.profile = action.payload;
    },

    setWorkBoardInfo(state,action) {
        const {workboards,users} = action.payload;
        state.workboards = workboards;
        state.users = users;
    },

    setWorkBoardDetails(state,action) {
        state.workboard = action.payload;
    },
    setIsLoadingSpin(state, action){
        state.isLoadingSpin = action.payload;
    }
  },
});

export const { setUserInfo, setWorkBoardInfo , setWorkBoardDetails, setIsLoadingSpin } = appSlice.actions;

export default appSlice.reducer;
