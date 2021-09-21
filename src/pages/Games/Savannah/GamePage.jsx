import React, { useState, useCallback, useEffect, useMemo } from "react";
import { getRandomNumber, shuffle } from "../../../helpers/gameUtils";
import { createStyles, Grid, makeStyles } from "@material-ui/core";
import snake from "../../../assets/images/snake.svg";
import classNames from "classnames";
import background from "../../../assets/images/2.jpg";
import Lives from "../common/Lives";
import SoundButton from "../common/SoundButton";
import correctSound from "../../../assets/audio/correct.mp3";
import errorSound from "../../../assets/audio/error.mp3";
import FullScreenButton from "../common/FullScreenButton";

const NUMBER_OF_WORDS = 20;

const Savannah = (props) => {
  const { words, onLoading, onWordSelect, onGameEnd } = props;
  const [answer, setAnswer] = useState("");
  const [arrOfWords, setArrOfWords] = useState([]);
  const [btnClicked, setBtnClicked] = useState(false);
  const [livesCount, setLivesCount] = useState(5);

  const [soundOn, setSoundOn] = useState(false);
  const [word, setWord] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [wordCounter, setWordCounter] = useState(0);
  const [snakeSize, setSnakeSize] = useState(0.6);
  const [currentSeries, setCurrentSeries] = useState(0);

  const classes = useStyles({ snakeSize });

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
        setWordTranslation(newWordTranslation);
        setArrOfWords(setWordsTranslation(currentChunk, newWordTranslation));
      };

      f1(wordCounter);
    }

    if (wordCounter === NUMBER_OF_WORDS) {
      onGameEnd();
    }
  }, [livesCount, wordCounter, currentChunk]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (livesCount && currentChunk && currentChunk.length && !btnClicked) {
        setLivesCount(livesCount - 1);
        playSound(false, soundOn);
        setWordCounter(wordCounter + 1);
        onWordSelect(currentChunk[wordCounter], { failed: true });
      }
    }, 6800);

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
        setSnakeSize(snakeSize + 0.02);
        setCurrentSeries(currentSeries + 1);
        onWordSelect(currentChunk[wordCounter], { succeed: true });
        playSound(true, soundOn);
      } else {
        setLivesCount(livesCount - 1);
        playSound(false, soundOn);
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
      snakeSize,
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
    <>
      {onLoading ? (
        <Grid container justify="center" alignItems="center">
          ЗАГРУЗКА
        </Grid>
      ) : (
        <Grid className={classes.container}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item container justify="center" className={classes.gameIcons}>
              <Lives
                livesCount={livesCount}
                gameOver={() => onGameEnd(wordCounter - 1)}
              />
              <SoundButton onClick={handleChangeSound} isEnabled={soundOn} />
              <FullScreenButton />
            </Grid>
          </Grid>

          <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="center"
            className={classes.gameContainer}
          >
            <div
              className={classNames({
                [classes.wrapperFalling]: true,
                [classes.animation]: !btnClicked,
                [classes.noAnimation]: btnClicked,
              })}
            >
              <h3 className={classes.fallingWord}>{word}</h3>
            </div>
            <Grid
              container
              justify="space-evenly"
              alignItems="center"
              className={classes.listWords}
            >
              {arrOfWords.map((itemWord) => (
                <button
                  key={itemWord}
                  onClick={handleWordClick(itemWord)}
                  className={classNames({
                    [classes.wordButton]: true,
                    [classes.bubble]: true,
                    [classes.wordButtonRight]:
                      btnClicked && itemWord === wordTranslation,
                  })}
                >
                  {itemWord}
                </button>
              ))}
            </Grid>

            <img
              className={classNames({
                [classes.snake]: true,
                [classes.snakeCorrectAnswer]: answer,
              })}
              src={snake}
              alt="snake"
            />
          </Grid>
        </Grid>
      )}
      <audio id="correctSound" src={correctSound} />
      <audio id="errorSound" src={errorSound} />
    </>
  );
};

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

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      height: "100vh",
      position: "relative",
      background: `linear-gradient(#399a7233, #8dada730),url(${background})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      width: "100vw",
      minWidth: "800px",
    },
    snake: ({ snakeSize }) => ({
      width: "64px",
      transform: `scale(${snakeSize})`,
    }),
    gameIcons: {
      position: "absolute",
      top: "15px",
    },
    gameContainer: {
      height: "calc(100vh - 30px)",
    },
    fallingWord: {
      fontSize: "35px",
      textAlign: "center",
    },
    wrapperFalling: {
      position: "absolute",
    },
    animation: {
      animation: `$falling 7s infinite`,
    },
    noAnimation: {
      animation: "unset",
    },
    listWords: {
      position: "relative",
      top: "50%",
    },
    wordButton: {
      [theme.breakpoints.down("xs")]: {
        height: "90px",
        width: "90px",
      },
      position: "relative",
      display: "inline-block",
      height: "120px",
      width: "120px",
      wordBreak: "break-word",
      borderRadius: "50%",
      outline: "none",
      cursor: "pointer",
      border: 0,
      "&:before": {
        content: `""`,
        position: "absolute",
        top: "1%",
        left: "5%",
        width: "90%",
        height: "90%",
        borderRadius: "100%",
        filter: "blur(5px)",
        zIndex: 2,
        background:
          "radial-gradient(circle at top, white, rgba(255, 255, 255, 0) 58%)",
      },
      "&:after": {
        content: `""`,
        position: "absolute",
        top: "5%",
        left: "10%",
        width: "80%",
        height: "80%",
        borderRadius: "100%",
        filter: "blur(1px)",
        zIndex: 2,
        transform: "rotateZ(-30deg)",
      },
    },
    wordButtonRight: {
      animation: `$bubble 0.3s linear`,
      background:
        "radial-gradient(circle at bottom, #81e8f6, #76deef 10%, #055194 80%, #062745 100%)",
    },
    bubble: {
      background:
        "radial-gradient(circle at 50% 55%, rgba(240, 245, 255, 0.9), rgba(240, 245, 255, 0.9) 40%, rgba(225, 238, 255, 0.8) 60%, rgba(43, 130, 255, 0.4))",
      "&:before": {
        filter: "blur(0)",
        height: "80%",
        width: "40%",
        background:
          "radial-gradient(circle at 130% 130%, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0) 46%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.8) 58%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0) 100%)",
        transform:
          "translateX(131%) translateY(58%) rotateZ(168deg) rotateX(10deg)",
      },
      "&:after": {
        display: "block",
        background:
          "radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 74%, white 80%, white 84%, rgba(255, 255, 255, 0) 100%)",
      },
    },

    snakeCorrectAnswer: {
      animation: `$snakeCorrectAnimation 5s infinite, $shake 2.5s linear infinite`,
    },
    "@keyframes shake": {
      "0%": { transform: "translate(1px, 1px) rotate(0deg)" },
      "10%": { transform: "translate(-1px, -2px) rotate(-1deg)" },
      "30%": { transform: "translate(3px, 2px) rotate(0deg)" },
      "50%": { transform: "translate(-1px, 2px) rotate(-1deg)" },
      "70%": { transform: "translate(3px, 1px) rotate(-1deg)" },
      "90%": { transform: "translate(1px, 2px) rotate(0deg)" },
    },
    "@keyframes falling": {
      "0%": {
        top: "10%",
        opacity: 0.9,
      },
      "100%": {
        top: "60%",
        opacity: 0.1,
      },
    },
    "@keyframes snakeCorrectAnimation": {
      "20%": {
        filter: "hue-rotate(70deg)",
      },
    },
    "@keyframes bubble": {
      "0%": {
        transform: "scale(1)",
      },

      "30%": {
        transform: "scale(0.7)",
      },
      "50%": {
        transform: "scale(0.6)",
      },
      "70%": {
        transform: "scale(0.7)",
      },

      "100%": {
        transform: "scale(1)",
      },
    },
  })
);

export default Savannah;
