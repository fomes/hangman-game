import React from "react";
import "../styles/keyboard.css";

const keys = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

interface KeyboardProps {
  disabled?: boolean;
  activeLetters: string[];
  inactiveLetters: string[];
  handleIncludeGuessedLetter: (letter: string) => void;
}

export default function Keyboard({
  disabled = false,
  activeLetters,
  inactiveLetters,
  handleIncludeGuessedLetter,
}: KeyboardProps) {
  return (
    <div className="grid gap-2 grid-cols-21">
      {keys.map((key) => {
        const isActive = activeLetters.includes(key);
        const isInactive = inactiveLetters.includes(key);

        return (
          <button
            onClick={() => handleIncludeGuessedLetter(key)}
            disabled={isInactive || isActive || disabled}
            key={key}
            className={`text-901 rounded-xl btn ${isActive ? "active" : ""} ${
              isInactive ? "inactive" : ""
            } mxl:w-11 h-11 text-3xl `}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}

