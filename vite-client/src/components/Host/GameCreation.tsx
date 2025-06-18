import React from 'react'
import { MessageCard } from './MessageCard'

interface GameCreationProps {
  myName: string
  gameTitle: string
  onGameTitleChange: (title: string) => void
  onCreateGame: (e: React.FormEvent) => void
}

/**
 * Component for creating a new game
 */
export const GameCreation: React.FC<GameCreationProps> = ({
  myName,
  gameTitle,
  onGameTitleChange,
  onCreateGame,
}) => (
  <MessageCard title="Create Your Game">
    <form onSubmit={onCreateGame}>
      <div className="mb-4">
        <input
          autoFocus
          placeholder={`${myName}'s game`}
          className="form-control form-control-lg text-center"
          onChange={(e) => onGameTitleChange(e.target.value)}
          value={gameTitle}
        />
      </div>
      <div>
        <button type="submit" className="btn btn-primary btn-lg">
          Create Game
        </button>
      </div>
    </form>
  </MessageCard>
)
