import React, { useEffect, useMemo, useState } from "react";
import { setFirstLetterToCapital } from "../../../helpers/gameUtils";
import PuzzleField from "./PuzzleField";
import Timer from "../common/Timer";
import Lives from "./components/Lives";
import WordList from "./components/WordsList";
import { SETTINGS } from "./settings";
import classesCss from "./PuzzleGame.module.scss";
import FullScreenButton from "../common/FullScreenButton";

const { TOTAL_LIVES, SECONDS_FOR_COMPLETE, TIC } = SETTINGS;

export default function PuzzleGame({
  words,
  onLoading,
  onWordSelect,
  onGameEnd,
}) {
  const [currentWord, setCurrentWord] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [timerState, setTimerState] = useState({
    shouldReset: false,
    shouldPause: false,
  });
  const [autoComplete, setAutoComplete] = useState(false);

  const currentChunk = useMemo(() => {
    if (words?.length > 0) {
      return [...words];
    }
    return null;
  }, [words]);

  function resetTimer() {
    setTimerState((state) => ({ ...state, shouldReset: false }));
  }

  function completeAssemblyHandler() {
    if (currentWord + 1 <= currentChunk.length) {
      setTimerState((state) => ({
        ...state,
        shouldReset: true,
        shouldPause: false,
      }));
      if (autoComplete) {
        setAutoComplete(false);
        currentChunk[currentWord] = {
          ...currentChunk[currentWord],
          status: "failed",
        };
        onWordSelect(currentChunk[currentWord], { succeed: false });
      } else {
        currentChunk[currentWord] = {
          ...currentChunk[currentWord],
          status: "succeed",
        };
        onWordSelect(currentChunk[currentWord], { succeed: true });
      }
      setCurrentWord((current) => current + 1);
      if (lives < TOTAL_LIVES) setLives(TOTAL_LIVES);
    }
    if (currentWord + 1 === currentChunk.length) {
      onGameEnd();
    }
  }

  function wrongSelectHandler() {
    if (lives > 0) setLives((state) => state - 1);
  }

  useEffect(() => {
    if (lives <= 0) {
      setAutoComplete(true);
      setTimerState((state) => ({ ...state, shouldPause: true }));
    }
  }, [lives]);

  return (
    <div className={classesCss.PuzzleGame}>
      <FullScreenButton className={classesCss.FullScreenButton} />
      {(() => {
        if (onLoading) {
          return <div>ЗАГРУЗКА</div>;
        } else if (currentChunk && currentWord + 1 <= currentChunk.length) {
          return (
            <div
              className={classesCss.GameLayout}
              key={currentChunk[currentWord].word}
            >
              <div className={classesCss.WordBlock}>
                <div className={classesCss.CurrentWord}>
                  {setFirstLetterToCapital(currentChunk[currentWord].word)}
                </div>
                <div className={classesCss.Translation}>
                  <span>{currentChunk[currentWord].textExampleTranslate}</span>
                </div>
                <PuzzleField
                  text={currentChunk[currentWord].textExample}
                  onSuccess={completeAssemblyHandler}
                  onWrongSelect={wrongSelectHandler}
                  autoComplete={autoComplete}
                />
              </div>
              <div className={classesCss.HelperBlock}>
                <Timer
                  className={classesCss.Countdown}
                  softReset={timerState.shouldReset ? resetTimer : null}
                  pause={timerState.shouldPause}
                  onWillGenerate={() => {
                    setAutoComplete(true);
                    return false;
                  }}
                  cycle={SECONDS_FOR_COMPLETE * 1000}
                  tic={TIC}
                  onTic={() => {
                    Array(1000)
                      .fill(2)
                      .map(() => {
                        return Array(100).fill(1);
                      })
                      .forEach((a) => {
                        a.forEach((b) => {
                          const z = b * b * a;
                        });
                      });
                  }}
                />
                <WordList words={currentChunk} currentWordIndex={currentWord} />
                <Lives livesCount={lives} totalLives={TOTAL_LIVES} />
              </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
