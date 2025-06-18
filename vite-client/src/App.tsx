import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Layout from './components/Layout'
import Main from './components/Main'
import Host from './components/Host'
import Lobby from './components/Lobby'
import Guest from './components/Guest'
import Solo from './components/Solo'
import SharedDevice from './components/SharedDevice'
import Rules from './components/Rules'
import Login from './components/Login'
import Stats from './components/Stats'
import Puzzle from './components/Puzzle'
import Training from './components/Training'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Main />,
      },
      {
        path: '/host',
        element: <Host />,
      },
      {
        path: '/lobby',
        element: <Lobby />,
      },
      {
        path: '/guest/:gameName',
        element: <Guest />,
      },
      {
        path: '/solo',
        element: <Solo />,
      },
      {
        path: '/local',
        element: <SharedDevice />,
      },
      {
        path: '/rules',
        element: <Rules />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/stats',
        element: <Stats />,
      },
      {
        path: '/puzzle',
        element: <Puzzle />,
      },
      {
        path: '/training',
        element: <Training />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
