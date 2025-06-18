import React from 'react'

interface MessageCardProps {
  children: React.ReactNode
  title?: string
}

/**
 * Reusable card component for displaying messages and forms
 */
export const MessageCard: React.FC<MessageCardProps> = ({ children, title }) => (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body text-center p-4">
            {title && <h4 className="card-title mb-4">{title}</h4>}
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
)
