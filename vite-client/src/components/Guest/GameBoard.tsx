import React, { Fragment } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import Board from '../Board'
import { MultiPlayers } from '../../utils/models'

interface GameBoardProps {
  state: {
    board: string[]
    deck: string[]
    selected: string[]
    declarer: string
    players?: MultiPlayers
    setFound: boolean
    gameOver: string | boolean
    pending: string | null
    popupVisible: boolean
  }
  myName: string
  onCardClick: (card: string) => void
}

/**
 * Component that renders the game board for guest players
 */
export const GameBoard: React.FC<GameBoardProps> = ({ state, myName, onCardClick }) => {
  const { board, deck, selected, declarer, players, setFound, gameOver, pending, popupVisible } =
    state

  return (
    <Fragment>
      <Modal show={pending && popupVisible}>
        <Modal.Header>
          <Modal.Title>Submitting action...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">SET!</p>
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        </Modal.Body>
      </Modal>
      <Board
        board={board}
        deck={deck}
        selected={selected}
        declarer={declarer}
        handleCardClick={onCardClick}
        handleDeclare={() => {}} // Pass empty function
        players={players || {}} // Pass empty object if players is undefined
        setFound={setFound}
        gameOver={gameOver}
        myName={myName}
        gameMode="versus"
        resetGame={() => {}} // Pass empty function
        solo={false} // Set to false for Guest mode
      />
    </Fragment>
  )
}
