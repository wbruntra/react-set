import React from 'react'

interface PlaceholderProps {
  name: string
}

const Placeholder: React.FC<PlaceholderProps> = ({ name }) => {
  return (
    <div>
      <h1>{name} Component (Placeholder)</h1>
      <p>This component will be migrated from the old app.</p>
    </div>
  )
}

export default Placeholder
