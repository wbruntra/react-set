import { combineReducers, createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import update from 'immutability-helper'
import { Action as ReduxAction, Reducer } from 'redux'

interface UserInfo {
  nickname?: string
}

export interface User {
  loading: boolean
  user: UserInfo
}

interface Action extends ReduxAction {
  payload: any
}

export const UPDATE_USER = 'UPDATE_USER'
export const UPDATE_NICKNAME = 'UPDATE_NICKNAME'

export const updateUser = (user: UserInfo) => ({
  type: UPDATE_USER,
  payload: user,
})

export const logOut = () => ({
  type: 'LOGOUT',
})

export const updateNickname = (nickname: string) => ({
  type: UPDATE_NICKNAME,
  payload: nickname,
})

export const defaultUser: User = { loading: true, user: {} }

const userReducer = (state = defaultUser, action: Action) => {
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

const reducers = {
  user: userReducer,
}

const store = createStore(
  combineReducers(reducers),
  composeWithDevTools(applyMiddleware(reduxThunk)),
)

export default store
