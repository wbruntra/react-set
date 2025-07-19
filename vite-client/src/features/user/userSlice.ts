import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  loading: boolean
  user: {
    uid?: string
    nickname?: string
    displayName?: string
    email?: string
    isGuest?: boolean
    [key: string]: any // Allow other properties
  } | null
}

const initialState: UserState = {
  loading: true,
  user: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<any>) => {
      return { ...state, ...action.payload }
    },
    updateNickname: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.nickname = action.payload
      }
    },
    logOut: (state) => {
      state.loading = false
      state.user = null
    },
  },
})

export const { updateUser, updateNickname, logOut } = userSlice.actions
export default userSlice.reducer
