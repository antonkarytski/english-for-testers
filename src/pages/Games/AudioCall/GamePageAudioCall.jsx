import React, { useState, useCallback, useEffect, useMemo } from "react";
import { getRandomNumber, shuffle } from "../../../helpers/gameUtils";
import { Grid } from "@material-ui/core";
import classNames from "classnames";
import { SETTINGS } from "../../../settings/settings";
import Lives from "../common/Lives";
import SoundButton from "../common/SoundButton";
import correctSound from "../../../assets/audio/correct.mp3";
import errorSound from "../../../assets/audio/error.mp3";
import FullScreenButton from "../common/FullScreenButton";
import classesCss from "./AudioCallGame.module.scss";

const NUMBER_OF_WORDS = 20;

export default function AudioCall(props) {
  const { words, onLoading, onWordSelect, onGameEnd } = props;
  const [answer, setAnswer] = useState("");
  const [arrOfWords, setArrOfWords] = useState([]);
  const [btnClicked, setBtnClicked] = useState(false);
  const [livesCount, setLivesCount] = useState(5);

  const [soundOn, setSoundOn] = useState(false);
  const [word, setWord] = useState("");
  const [wordAudio, setWordAudio] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [wordCounter, setWordCounter] = useState(0);
  const [currentSeries, setCurrentSeries] = useState(0);
  const audioPlayer = new Audio();
  audioPlayer.volume = 0.1;

  const classes = {};

  const currentChunk = useMemo(() => {
    if (words?.length > 0) {
      return [...words];
    }
    return null;
  }, [words]);

  useEffect(() => {
    if (
      currentChunk !== null &&
      currentChunk.length &&
      livesCount &&
      wordCounter < NUMBER_OF_WORDS
    ) {
      const f1 = (wordCounter) => {
        const newWordTranslation = currentChunk[wordCounter].wordTranslate;
        setWord(currentChunk[wordCounter].word);
        const previousWordAudioURL = wordAudio;
        setWordAudio(currentChunk[wordCounter].audio);
        setWordTranslation(newWordTranslation);
        setArrOfWords(setWordsTranslation(currentChunk, newWordTranslation));
        if (
          previousWordAudioURL !== currentChunk[wordCounter].audio &&
          currentChunk[wordCounter].audio
        ) {
          playAudio(`${SETTINGS.SERVER}/${currentChunk[wordCounter].audio}`);
        }
      };
      f1(wordCounter);
    }

    if (wordCounter === NUMBER_OF_WORDS) {
      onGameEnd();
    }
  }, [livesCount, wordCounter, currentChunk]);

  function playAudio(url) {
    audioPlayer.src = url;
    audioPlayer.load();
    audioPlayer.play();
  }

  // const updateStats = useCallback((isCorrect) => {
  //     setStatisticsArr([...statisticsArr, {
  //         'word': word,
  //         'id': wordID,
  //         'audio': wordAudio,
  //         'transcription': wordTranscription,
  //         'translation': wordTranslation,
  //         'isCorrect': isCorrect,
  //     }]);
  // }, [word, wordID, wordAudio, wordTranscription, wordTranslation, statisticsArr]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (livesCount && currentChunk && currentChunk.length && !btnClicked) {
        setLivesCount(livesCount - 1);
        playSound(false, soundOn);
        setWordCounter(wordCounter + 1);

        onWordSelect(currentChunk[wordCounter], { failed: true });
      }
    }, 6000);
    console.log(currentChunk);
    return () => {
      clearTimeout(timer);
    };
  }, [
    onWordSelect,
    currentChunk,
    livesCount,
    btnClicked,
    soundOn,
    wordCounter,
  ]);

  const handleChangeSound = useCallback(() => {
    setSoundOn(!soundOn);
  }, [soundOn]);

  const checkAnswer = useCallback(
    (wordActive, answerActive) => {
      let correct = wordActive === answerActive;
      setAnswer(correct);
      setWordCounter(wordCounter + 1);

      if (correct) {
        // setSnakeSize(snakeSize + 0.02);
        setCurrentSeries(currentSeries + 1);
        //currentChunk[wordCounter] = {...currentChunk[wordCounter], status:"succeed"}
        onWordSelect(currentChunk[wordCounter], { succeed: true });
        playSound(true, soundOn);
      } else {
        setLivesCount(livesCount - 1);
        playSound(false, soundOn);
        //currentChunk[wordCounter] = {...currentChunk[wordCounter], status:"succeed"}
        onWordSelect(currentChunk[wordCounter], { failed: true });
      }
    },
    [
      currentChunk,
      onWordSelect,
      word,
      livesCount,
      currentSeries,
      wordCounter,
      soundOn,
    ]
  );

  const handleWordClick = useCallback(
    (itemWord) => () => {
      setBtnClicked(true);
      setWord("");
      setTimeout(() => {
        setBtnClicked(false);
        checkAnswer(itemWord, wordTranslation);
        setTimeout(() => {
          setAnswer(false);
          setBtnClicked(false);
        }, 500);
      }, 350);
    },
    [checkAnswer, wordTranslation]
  );

  return (
    <div className={classesCss.AudioCall}>
      {onLoading ? (
        <Grid container justify="center" alignItems="center">
          ЗАГРУЗКА
        </Grid>
      ) : (
        <Grid className={classesCss.containerGames}>
          {/* {isGameOver && (
                    <Statistics
                        statisticsArr={statisticsArr}
                        rightAnswers={currentGameStatistics.rightAnswers}
                        wrongAnswers={currentGameStatistics.wrongAnswers}
                    />)} */}
          <Grid container justify="space-between" alignItems="center">
            <Grid
              item
              container
              justify="center"
              className={classesCss.gameIcons}
            >
              <Lives
                livesCount={livesCount}
                gameOver={() => onGameEnd(wordCounter - 1)}
              />
              <SoundButton onClick={handleChangeSound} isEnabled={soundOn} />
              <FullScreenButton />
            </Grid>
          </Grid>
          )
          <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="center"
            className={classesCss.gameContainer}
          >
            <h3
              onClick={() => {
                playAudio(
                  `${SETTINGS.SERVER}/${currentChunk[wordCounter].audio}`
                );
                // console.log(wordAudio)
              }}
              className={classesCss.wordAudio}
            >
              campaign
            </h3>

            <Grid
              container
              justify="space-evenly"
              alignItems="center"
              className={classesCss.listWords}
            >
              {arrOfWords.map((itemWord) => (
                <button
                  key={itemWord}
                  onClick={handleWordClick(itemWord)}
                  className={classNames({
                    [classesCss.wordButton]: true,
                    [classesCss.bubble]: true,
                    [classesCss.wordButtonRight]:
                      btnClicked && itemWord === wordTranslation,
                  })}
                >
                  {itemWord}
                </button>
              ))}
            </Grid>
          </Grid>
          )
        </Grid>
      )}
      <audio id="correctSound" src={correctSound} />
      <audio id="errorSound" src={errorSound} />
    </div>
  );
}

const setWordsTranslation = (words, newWordTranslation) => {
  const arrOfTranslations = [];
  arrOfTranslations.push(newWordTranslation);

  while (arrOfTranslations.length < 4) {
    const translation =
      words[getRandomNumber(0, words.length - 1)].wordTranslate;
    if (!arrOfTranslations.includes(translation)) {
      arrOfTranslations.push(translation);
    }
  }
  return shuffle(arrOfTranslations);
};

const playSound = (isCorrect, soundOn) => {
  const correctSound = document.querySelector("#correctSound");
  const errorSound = document.querySelector("#errorSound");
  if (soundOn) {
    isCorrect ? correctSound.play() : errorSound.play();
  }
};
