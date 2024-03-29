import React, { useCallback, useEffect, useRef, useState } from "react";

import logo from "./assets/logo.png";
import Footer from "./components/Footer";
import Ranking from "./components/Ranking";
import Keyboard from "./components/Keyboard";
import ModalHelp from "./components/ModalHelp";
import HangmanDraw from "./components/HangmanDraw";
import HangmanName from "./components/HangmanName";
import ModalResult from "./components/ModalResult";
import rankingIcon from "./assets/ranking_icon.svg";
import ModalCredits from "./components/ModalCredits";
import ModalEnterNick from "./components/ModalEnterNick";

import { apiRank } from "./services/api";
import { champions } from "./data/list";
import { handleGetTitle } from "./services/getTitle";
import { handleGetSplash } from "./services/getSplash";
import { calculatePoints } from "./functions/calculatePoints";

const newName = () => {
  return champions[Math.floor(Math.random() * champions.length)];
};

function App() {
  const [championName, setChampionName] = useState(newName());
  const [plusPoints, setPlusPoints] = useState<number>(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const [splashImg, setSplashImg] = useState("");
  const [championTitle, setChampionTitle] = useState("");
  const [wonTheGame, setWonTheGame] = useState(false);
  const [showModalResult, setShowModalResult] = useState(false);
  const [showModalRanking, setShowModalRanking] = useState(false);
  const [showModalCredits, setShowModalCredits] = useState(false);
  const [loadingFirstGame, setLoadingFirstGame] = useState(false);

  const [showModalHelp, setShowModalHelp] = useState(
    localStorage.getItem("nick") ? false : true
  );
  const [showModalNick, setShowModalNick] = useState(
    localStorage.getItem("nick") ? false : true
  );
  const [openModalClass, setOpenModalClass] = useState(
    localStorage.getItem("nick" ? "" : "modal-blur")
  );
  const [nickPlayer, setNickPlayer] = useState<any>(
    localStorage.getItem("nick" || "")
  );

  const missedLetters = guessedLetters.filter(
    (letter) => !championName.toLocaleLowerCase().includes(letter)
  );

  const refOne = useRef<any>(null);

  const isLoser = missedLetters.length >= 6;

  const isWinnner = championName
    .toLocaleLowerCase()
    .split("")
    .every((letter) => guessedLetters.includes(letter));

  const handleOpenRanking = () => {
    setShowModalRanking(true);
  };

  const handleOpenCredits = () => {
    setShowModalCredits(true);
  };

  const handleIncludeGuessedLetter = useCallback(
    (key: string) => {
      if (guessedLetters.includes(key) || isLoser || isWinnner) return;

      setGuessedLetters((currentLetters) => [...currentLetters, key]);
    },
    [guessedLetters, isWinnner, isLoser]
  );

  const handleCloseModal = () => {
    setShowModalResult(false);
  };

  const resultGame = (result: boolean) => {
    setWonTheGame(result);
    setShowModalResult(true);
    setOpenModalClass("modal-blur");
    apiRank.post("/new", {
      nick: nickPlayer,
      gamePoints: calculatePoints(
        result,
        championName,
        missedLetters,
        setPlusPoints
      ),
    });
  };

  const handleShowModal = () => {
    if (isWinnner) {
      resultGame(true);
    }

    if (isLoser) {
      setPlusPoints(0);
      resultGame(false);
    }
  };

  const handleNewGame = () => {
    setShowModalResult(false);
    setOpenModalClass("");
    setGuessedLetters([]);
    setChampionName(newName());
  };

  const handleStartFirstGame = async () => {
    setShowModalNick(false);
    setLoadingFirstGame(true);
    setOpenModalClass("");
    localStorage.setItem("nick", nickPlayer);
    await apiRank.post("/new", { nick: nickPlayer });
    location.reload();
  };

  const handleClickOutside = (event: any) => {
    if (!refOne?.current?.contains(event.target)) {
      setShowModalHelp(false);
      setOpenModalClass("");
      setShowModalRanking(false);
      setShowModalCredits(false);
    }
  };

  const handleOpenHelp = () => {
    setShowModalHelp(!showModalHelp);
  };

  useEffect(() => {
    handleShowModal();
  }, [isWinnner, isLoser]);
  ("");

  useEffect(() => {
    if (localStorage.getItem("nick")) {
      setShowModalHelp(false);
    }

    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (key !== "Enter") return;
      e.preventDefault();
      handleNewGame();
    };

    document.addEventListener("keypress", handler);
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, []);

  useEffect(() => {
    handleGetTitle(championName, setChampionTitle);
    handleGetSplash(championName, setSplashImg);
  }, [championName]);

  return (
    <div className="min-h-screen">
      <div className="flex justify-center">
        <ModalHelp show={showModalHelp} />

        <ModalEnterNick
          show={showModalNick}
          handleStartGame={handleStartFirstGame}
          onDisabled={nickPlayer ? false : true}
          handleOnChange={(event: React.FormEvent<HTMLInputElement>) =>
            setNickPlayer(event.currentTarget.value)
          }
        />

        <ModalResult
          splash={splashImg}
          isWinner={wonTheGame}
          show={showModalResult}
          plusPoints={plusPoints}
          closeModal={handleCloseModal}
          championTitle={championTitle}
          championName={
            championName.toLocaleLowerCase().charAt(0).toUpperCase() +
            championName.slice(1)
          }
        />
      </div>
      <div
        className={`w-screen flex flex-col gap-8 my-0 mx-auto items-center first-blur ${openModalClass}`}
      >
        <img
          src={logo}
          alt="logotipo"
          className="absolute left-3 top-2 w-64 msl:w-28 msl:left-auto msl:ml-9 msl:top-3"
        />
        <button
          className={`absolute right-5 top-5 cursor-pointer brightness-90 transition hover:brightness-125 focus:outline-none ${
            showModalResult && "hidden"
          }`}
          disabled={showModalNick}
          onClick={handleOpenRanking}
        >
          <img src={rankingIcon} alt="ranking icon" />
        </button>

        <div
          className={`${showModalNick || showModalResult ? "invisible" : ""}`}
        >
          <HangmanDraw guesses={missedLetters.length} />
        </div>
        {!showModalResult && (
          <>
            <div
              className={`${
                showModalNick || showModalResult ? "invisible" : ""
              }`}
            >
              {!loadingFirstGame ? (
                <HangmanName
                  reveal={isLoser}
                  guessedLetters={guessedLetters}
                  nameToGuess={championName.toLocaleLowerCase()}
                />
              ) : (
                <h3>Carregando...</h3>
              )}
            </div>
            <div
              className={`flex justify-center ${
                showModalNick || showModalResult ? "invisible" : ""
              }`}
            >
              <Keyboard
                disabled={isWinnner || isLoser}
                activeLetters={guessedLetters.filter((letter) =>
                  championName.toLocaleLowerCase().includes(letter)
                )}
                inactiveLetters={missedLetters}
                handleIncludeGuessedLetter={handleIncludeGuessedLetter}
              />
            </div>
          </>
        )}

        <Ranking show={showModalRanking} key={missedLetters.length} />
        <ModalCredits show={showModalCredits} />
        <Footer
          show={showModalResult}
          handleOpenCredits={handleOpenCredits}
          handleOpenHelp={handleOpenHelp}
        />
      </div>
    </div>
  );
}

export default App;
