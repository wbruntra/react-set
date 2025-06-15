import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import update from 'immutability-helper'

interface UserState {
  loading: boolean
  user: {
    nickname?: string
    [key: string]: any // Allow other properties
  } | null
}

const initialState: UserState = {
  loading: true,
  user: {},
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<any>) => {
      return { ...state, ...action.payload }
    },
    updateNickname: (state, action: PayloadAction<string>) => {
      const newState = update(state, {
        user: { nickname: { $set: action.payload } },
      })
      return newState
    },
    logOut: (state) => {
      state.loading = false
      state.user = null
    },
  },
})

export const { updateUser, updateNickname, logOut } = userSlice.actions
export default userSlice.reducer
