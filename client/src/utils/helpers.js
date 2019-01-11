// @flow
import { shuffle } from 'lodash';

export const range = (n: number) => {
  return [...Array(n).keys()];
};

const displaySet = (tuple: Array<number>, rowSize: number = 3) => {
  let matrix;
  if (rowSize === 4) {
    matrix = range(3).map(i => {
      const row = range(4).map(j => {
        if (tuple.includes(4 * i + j)) {
          return 'x';
        }
        return 'o';
      });
      return row.join('');
    });
  } else {
    matrix = range(4).map(i => {
      const row = range(3).map(j => {
        if (tuple.includes(3 * i + j)) {
          return 'x';
        }
        return 'o';
      });
      return row.join('');
    });
  }
  console.log(matrix.join('\n'));
};

export const serializeGame = (state: {
  board: Array<string>,
  deck: Array<string>,
  selected: Array<string>,
}) => {
  const status = JSON.stringify({
    board: state.board,
    deck: state.deck,
    selected: state.selected,
  });
  return status;
};

export const countSets = (board: Array<string>, debug?: boolean, returnWhenFound?: boolean) => {
  let count = 0;
  let candidate = [];
  for (let a = 0; a < board.length - 2; a++) {
    for (let b = a + 1; b < board.length - 1; b++) {
      for (let c = b + 1; c < board.length; c++) {
        candidate = [board[a], board[b], board[c]];
        if (isSet(candidate)) {
          if (debug) {
            displaySet([a, b, c]);
          }
          count++;
          if (returnWhenFound) {
            return count;
          }
        }
      }
    }
  }
  return count;
};

export const makeDeck = (): Array<string> => {
  let deck = [];
  range(3).forEach(c => {
    range(3).forEach(n => {
      range(3).forEach(s => {
        range(3).forEach(f => {
          const card = '' + c + s + n + f;
          deck.push(card);
        });
      });
    });
  });
  return deck;
};

export const isSet = (selected: Array<string>) => {
  if (selected.length !== 3) {
    return false;
  }
  const [a, b, c] = selected;
  for (let i = 0; i < 4; i++) {
    const sum = Number(a[i]) + Number(b[i]) + Number(c[i]);
    if (sum % 3 !== 0) {
      return false;
    }
  }
  return true;
};

export const nameThird = (a: string, b: string) => {
  let features;
  let missing;
  let result = '';
  for (let i = 0; i < 4; i++) {
    if (a[i] === b[i]) {
      result = result + a[i];
    } else {
      features = Number(a[i]) + Number(b[i]);
      missing = (3 - features).toString();
      result = result + missing;
    }
  }
  return result.trim();
};

export const cardToggle = (card: string, selected: Array<string>): Array<string> => {
  if (selected.includes(card)) {
    return selected.filter(c => c !== card);
  } else {
    return [...selected, card];
  }
};

export const reshuffle = ({
  board,
  deck,
}: {
  board: Array<string>,
  deck: Array<string>,
}): { board: Array<string>, deck: Array<string> } => {
  let newDeck = shuffle([...board, ...deck]);
  while (
    countSets(newDeck.slice(0, 12), false, true) === 0 &&
    countSets(newDeck, false, true) > 0
  ) {
    newDeck = shuffle(newDeck);
  }
  return {
    deck: newDeck.slice(12),
    board: newDeck.slice(0, 12),
  };
};

// DB stuff

// export const update = (ref, data) => {
//   ref.set(
//     {
//       ...data,
//     },
//     { merge: true },
//   );
// };

export const removeSelected = (state: {
  board: Array<string>,
  deck: Array<string>,
  selected: Array<string>,
}): {
  board: Array<string>,
  deck: Array<string>,
  selected: Array<string>,
} => {
  const { board, deck, selected } = state;
  const newCards = deck.slice(0, 3);
  let newBoard = [...board];
  let newDeck = deck.slice(3);
  selected.forEach((c, i) => {
    let index = newBoard.indexOf(c);
    newBoard[index] = newCards[i];
  });
  while (countSets(newBoard) === 0) {
    ({ deck: newDeck, board: newBoard } = reshuffle({
      board: newBoard,
      deck: newDeck,
    }));
  }

  return {
    deck: newDeck,
    board: newBoard,
    selected: [],
  };
};
