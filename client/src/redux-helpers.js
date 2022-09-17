import { Reducer, Action as ReduxAction } from 'redux'

// import { applyMiddleware, combineReducers, createStore } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
// import { composeWithDevTools } from 'redux-devtools-extension'
// import reduxThunk from 'redux-thunk'
import update from 'immutability-helper'

export const UPDATE_USER = 'UPDATE_USER'
export const UPDATE_NICKNAME = 'UPDATE_NICKNAME'

export const updateUser = (user) => ({
  type: UPDATE_USER,
  payload: user,
})

export const logOut = () => ({
  type: 'LOGOUT',
})

export const updateNickname = (nickname) => ({
  type: UPDATE_NICKNAME,
  payload: nickname,
})

export const defaultUser = { loading: true, user: {} }

const userReducer = (state = defaultUser, action) => {
  switch (action.type) {
    case UPDATE_USER:
      return {
        ...state,
        ...action.payload,
      }
    case UPDATE_NICKNAME:
      const newState = update(state, {
        user: { nickname: { $set: action.payload } },
      })
      return newState
    case 'LOGOUT':
      return { loading: false, user: null }
    default:
      return state
  }
}

const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

export default store
