import React from 'react'
import { MessageCard } from './MessageCard'

interface GameResumePromptProps {
  onResumeGame: () => void
  onDeleteGame: () => void
}

/**
 * Component that prompts user to resume or delete an existing game
 */
export const GameResumePrompt: React.FC<GameResumePromptProps> = ({
  onResumeGame,
  onDeleteGame,
}) => (
  <MessageCard title="Existing Game Found">
    <p className="mb-4">You are already hosting a game. Would you like to return to it?</p>
    <div className="d-flex gap-3 justify-content-center">
      <button className="btn btn-primary" onClick={onResumeGame}>
        Yes, Resume Game
      </button>
      <button className="btn btn-danger" onClick={onDeleteGame}>
        No, Delete Game
      </button>
    </div>
  </MessageCard>
)
