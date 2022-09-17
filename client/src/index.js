import './styles/bts/bootstrap.scss'
import './styles/bts/index.scss'

import App from './components/App'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import store from './redux-helpers'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
)
