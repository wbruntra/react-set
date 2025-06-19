import React from 'react'
import { Link } from 'react-router-dom'
import Card from './Card'

interface MenuItemProps {
  url: string
  cardName: string
  description: string
}

function MenuItem(props: MenuItemProps) {
  const { url, cardName, description } = props
  return (
    <div className="col-9 col-md-4">
      <Link to={url}>
        <div className="card shadow-sm mb-3 mb-md-4">
          <Card desc={cardName} />
        </div>
      </Link>
      <p className="text-center">{description}</p>
    </div>
  )
}

function Main() {
  const menuItems = [
    {
      url: '/solo',
      cardName: '0012',
      description: 'Solo/Local',
    },
    {
      url: '/lobby',
      cardName: '1121',
      description: 'Join Game',
    },
    {
      url: '/host',
      cardName: '2200',
      description: 'Host Game',
    },
  ]
  return (
    <div className="container mt-3 mt-md-5 p-4">
      <h1 className="d-none d-md-block text-center mb-3 mb-md-5">Main Menu</h1>
      <div className="row justify-content-center">
        {menuItems.map((item, i) => {
          return <MenuItem key={`card-${i}`} {...item} />
        })}
      </div>
      <hr />
      <div className="d-none d-md-block text-center">
        <p>
          <Link to="/rules">Rules</Link>
        </p>
        <p>
          <Link to="/stats">View Statistics</Link>
        </p>
      </div>
      <div className="text-center mt-4">
        <p>
          <Link to="/training">Training Mode</Link>
        </p>
      </div>
    </div>
  )
}

export default Main
