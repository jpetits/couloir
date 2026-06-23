import { useState } from "react";

function Square({
  value,
  handleClick,
}: {
  value: string;
  handleClick: () => void;
}) {
  return (
    <div
      className="border-2 w-16 h-16 flex items-center justify-center hover:cursor-pointer"
      onClick={handleClick}
    >
      {value}
    </div>
  );
}

function Board({
  squares,
  play,
  xIsNext,
}: {
  squares: string[];
  play: (num: number) => void;
  xIsNext: boolean;
}) {
  const winner = hasWinner(squares);
  return (
    <div>
      <div>
        {winner ? `Winner: ${winner}` : `Next : ${xIsNext ? "X" : "O"}`}
      </div>
      <div className="flex flex-row">
        <Square value={squares[0]} handleClick={() => play(0)} />
        <Square value={squares[1]} handleClick={() => play(1)} />
        <Square value={squares[2]} handleClick={() => play(2)} />
      </div>
      <div className="flex flex-row">
        <Square value={squares[3]} handleClick={() => play(3)} />
        <Square value={squares[4]} handleClick={() => play(4)} />
        <Square value={squares[5]} handleClick={() => play(5)} />
      </div>
      <div className="flex flex-row">
        <Square value={squares[6]} handleClick={() => play(6)} />
        <Square value={squares[7]} handleClick={() => play(7)} />
        <Square value={squares[8]} handleClick={() => play(8)} />
      </div>
    </div>
  );
}

function hasWinner(history: string[]): string | boolean {
  const winningMoves = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < winningMoves.length; i++) {
    const [a, b, c] = winningMoves[i];

    if (history[a] && history[a] === history[b] && history[b] === history[c]) {
      return history[a];
    }
  }

  return false;
}

export default function TicTacToe() {
  const [history, setHistory] = useState<string[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove] ?? [];

  function handleClick(num: number) {
    if (hasWinner(currentSquares) || currentSquares[num]) return;

    const toAdd = currentSquares.slice() ?? [];
    toAdd[num] = xIsNext ? "X" : "O";

    const nextHistory = [...history.slice(0, currentMove + 1), toAdd];

    setCurrentMove((move) => nextHistory.length - 1);
    setHistory(nextHistory);
  }

  function jumpTo(move: number) {
    setCurrentMove(move);
  }

  return (
    <div>
      <Board squares={currentSquares} xIsNext={xIsNext} play={handleClick} />
      <ol>
        {history.map((squares, move) => (
          <li key={move}>
            <button
              onClick={() => jumpTo(move)}
              className=" hover:cursor-pointer"
            >
              {move > 0 ? `Go to move #${move}` : "Go to start"}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
