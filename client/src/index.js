import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.scss'
import App from './components/App'
import { Provider } from 'react-redux'
import store from './redux-helpers'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
)
