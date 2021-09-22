import React, { useState, useCallback, useEffect, useMemo } from "react";
import { createStyles, Grid, makeStyles } from "@material-ui/core";
import SoundButton from "../common/SoundButton";
import correctSound from "../../../assets/audio/correct.mp3";
import errorSound from "../../../assets/audio/error.mp3";
import FullScreenButton from "../common/FullScreenButton";
import Button from "../common/Button";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import WbIncandescentIcon from "@material-ui/icons/WbIncandescent";
import branch from "../../../assets/images/branch.png";
import parrot1 from "../../../assets/images/parrot1.png";
import parrot2 from "../../../assets/images/parrot2.png";
import parrot3 from "../../../assets/images/parrot3.png";
import parrot4 from "../../../assets/images/parrot4.png";
import { SETTINGS } from "../../../settings/settings";
import { getRandomNumber, shuffle } from "../../../helpers/gameUtils";
import background from "../../../assets/images/photo_2021-04-09_11-20-47.jpg";
import classNames from "classnames";
import Timer from "./Timer";

const NUMBER_OF_MARKS = 3;

const NUMBER_OF_PARROTS = 4;

const MULTIPLIER = {
  1: 10,
  2: 20,
  3: 40,
  4: 80,
};

const Marks = (props) => {
  const { count = 0 } = props;

  const marks = useMemo(() => {
    return [
      ...new Array(count).fill(true),
      ...new Array(NUMBER_OF_MARKS - count).fill(false),
    ];
  }, [count]);

  const classes = useStyles();

  return (
    <Grid container justify="space-evenly" alignItems="center">
      {marks.map((mark, index) => (
        <Grid item key={index}>
          {mark && <WbIncandescentIcon className={classes.trueMark} />}
          {!mark && <WbIncandescentIcon className={classes.falseMark} />}
        </Grid>
      ))}
    </Grid>
  );
};

const Parrots = (props) => {
  const { count = 1 } = props;

  const parrots = useMemo(() => {
    return [
      ...new Array(count).fill(true),
      ...new Array(NUMBER_OF_PARROTS - count).fill(false),
    ];
  }, [count]);

  const classes = useStyles();

  const parrotsSrc = [parrot1, parrot2, parrot3, parrot4];

  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      className={classes.parrotsContainer}
    >
      {parrots.map((isVisible, index) => (
        <img
          key={index}
          src={parrotsSrc[index]}
          alt="parrot"
          className={classNames({
            [classes.hidden]: !isVisible,
            [classes.parrot]: isVisible,
          })}
        />
      ))}
      <img src={branch} alt="branch" className={classes.branch} />
    </Grid>
  );
};

const Sprint = (props) => {
  const { words, onLoading, onWordSelect, onGameEnd } = props;

  const [score, setScore] = useState(0);
  const [rate, setRate] = useState(1);
  const [marksCombo, setMarksCombo] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [wordCounter, setWordCounter] = useState(0);
  const [currentTranslation, setCurrentTranslation] = useState("");

  const classes = useStyles();

  const currentChunk = useMemo(() => {
    if (words?.length > 0) {
      return [...words];
    }
    return null;
  }, [words]);

  const playAudio = useCallback(
    (n) => () => {
      const audioPath = `${SETTINGS.SERVER}`;
      const pronounce = new Audio(`${audioPath}/${currentChunk[n].audio}`);
      pronounce.play();
    },
    [currentChunk]
  );

  const setWordTranslation = useCallback((words, correctWordTranslation) => {
    const arrOfTranslations = [];
    arrOfTranslations.push(correctWordTranslation);
    const translation =
      words[getRandomNumber(0, words.length - 1)].wordTranslate;
    arrOfTranslations.push(translation);
    shuffle(arrOfTranslations);
    const randomTranslation =
      arrOfTranslations[getRandomNumber(0, arrOfTranslations.length - 1)];
    setCurrentTranslation(randomTranslation);
    return randomTranslation;
  }, []);

  const randomTranslation = useMemo(() => {
    return currentChunk && wordCounter !== currentChunk.length
      ? setWordTranslation(
          currentChunk,
          currentChunk[wordCounter].wordTranslate
        )
      : null;
  }, [currentChunk, wordCounter, setWordTranslation]);

  const changeScore = useCallback(
    (correctAnswer, hasCombo) => {
      if (correctAnswer) {
        let calculatedScore = score + MULTIPLIER[rate];

        if (hasCombo && rate < NUMBER_OF_PARROTS) {
          calculatedScore = calculatedScore + MULTIPLIER[rate + 1];
        } else if (hasCombo && rate === NUMBER_OF_PARROTS) {
          calculatedScore = calculatedScore + MULTIPLIER[rate];
        }
        setScore(calculatedScore);
      }
    },
    [rate, score]
  );

  const handleChangeSound = useCallback(() => {
    setSoundOn(!soundOn);
  }, [soundOn]);

  const changeParrots = useCallback(
    (correctAnswer) => {
      if (correctAnswer && rate < 4) {
        setRate(rate + 1);
      }
      if (!correctAnswer && rate > 1) {
        setRate(rate - 1);
      }
    },
    [rate]
  );

  const changeMark = useCallback(
    (correctAnswer) => {
      if (correctAnswer) {
        let count = marksCombo === 3 ? 3 : marksCombo + 1;
        setMarksCombo(count);
        if (count >= 3) {
          setTimeout(() => {
            setMarksCombo(0);
            changeParrots(true);
          }, 500);
        }
        marksCombo === 2
          ? changeScore(correctAnswer, true)
          : changeScore(correctAnswer);
      } else {
        setMarksCombo(0);
        changeParrots(false);
      }
    },
    [changeScore, changeParrots, marksCombo]
  );

  const [value, setValue] = useState(60);

  const handleClick = useCallback(
    (correctAnswer) => () => {
      const isCorrect =
        (correctAnswer &&
          currentChunk[wordCounter]?.wordTranslate === currentTranslation) ||
        (!correctAnswer &&
          currentChunk[wordCounter]?.wordTranslate !== currentTranslation);

      setValue((val) => val - 1);
      onWordSelect(currentChunk[wordCounter], {
        succeed: isCorrect,
        failed: !isCorrect,
      });
      changeMark(isCorrect);
      playSound(isCorrect, soundOn);

      setWordCounter(wordCounter + 1);
      if (wordCounter === currentChunk.length - 1) {
        onGameEnd(wordCounter);
      }
    },
    [
      onWordSelect,
      changeMark,
      soundOn,
      currentTranslation,
      currentChunk,
      wordCounter,
      onGameEnd,
    ]
  );

  const handleKeyPress = useCallback(
    (e) => {
      e.preventDefault();
      if (e.key === "ArrowRight") {
        handleClick(true)();
      }
      if (e.key === "ArrowLeft") {
        handleClick(false)();
      }
    },
    [handleClick]
  );

  useEffect(() => {
    document.addEventListener("keyup", handleKeyPress);
    return () => {
      document.removeEventListener("keyup", handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    const timerID = setTimeout(() => {
      if (value > 0) {
        setValue(value - 1);
      }
    }, 1300);
    return () => clearTimeout(timerID);
  }, [value]);

  return (
    <>
      {onLoading || !currentChunk ? (
        <Grid container justify="center" alignItems="center">
          ЗАГРУЗКА
        </Grid>
      ) : (
        <Grid
          container
          justify="center"
          alignItems="center"
          direction="column"
          className={classes.container}
        >
          <Grid
            item
            container
            justify="flex-start"
            className={classes.gameIcons}
          >
            <SoundButton onClick={handleChangeSound} isEnabled={soundOn} />
            <FullScreenButton />
          </Grid>

          <Grid
            container
            justify="center"
            alignItems="center"
            direction="column"
            className={classes.gameContainer}
          >
            <Grid
              container
              justify="space-between"
              className={classes.dataContainer}
            >
              <Grid
                container
                justify="center"
                alignItems="center"
                className={classes.timerContainer}
              >
                <Timer
                  value={value}
                  isActive={true}
                  initialTime={60}
                  onCountdownFinish={() => onGameEnd(wordCounter)}
                />
              </Grid>
              <Grid
                container
                justify="center"
                alignItems="center"
                className={classes.score}
              >
                {score}
              </Grid>
            </Grid>
            <Grid
              container
              justify="space-between"
              alignItems="flex-start"
              direction="column"
              className={classes.game}
            >
              <Marks count={marksCombo} />
              <Parrots count={rate} />

              <Grid
                container
                justify="center"
                alignItems="center"
                direction="column"
                className={classes.wordsContainer}
              >
                <button
                  onClick={playAudio(wordCounter)}
                  className={classes.audioButton}
                >
                  <NotificationsActiveIcon />
                </button>
                <Grid container justify="center" alignItems="center">
                  <p className={classes.enWord}>
                    {currentChunk[wordCounter]?.word}
                  </p>
                </Grid>
                <Grid container justify="center" alignItems="center">
                  <p className={classes.ruWord}>{randomTranslation}</p>
                </Grid>
              </Grid>

              <Grid
                container
                justify="space-around"
                alignItems="center"
                className={classes.buttonsContainer}
              >
                <Button
                  label={"Не верно"}
                  onClick={handleClick(false)}
                  classes={{ button: classes.buttonFalse }}
                >
                  <ArrowLeftIcon className={classes.buttonIcon} />
                </Button>
                <Button
                  label={"Верно"}
                  onClick={handleClick(true)}
                  classes={{ button: classes.buttonTrue }}
                >
                  <ArrowRightIcon className={classes.buttonIcon} />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <audio id="correctSound" src={correctSound} />
      <audio id="errorSound" src={errorSound} />
    </>
  );
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
      background: `linear-gradient(#9a733933, #8d8dad30),url(${background})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      width: "100vw",
    },
    gameIcons: {
      position: "absolute",
      top: "15px",
    },
    dataContainer: {
      [theme.breakpoints.down("sm")]: {
        maxWidth: "250px",
      },
      [theme.breakpoints.down("xs")]: {
        maxWidth: "180px",
      },
      maxWidth: "600px",
      marginBottom: "5px",
    },
    timerContainer: {
      [theme.breakpoints.down("xs")]: {
        fontSize: "30px",
      },
      fontSize: "45px",
      lineHeight: "40px",
      textAlign: "center",
      color: "#ffffff",
      border: "2px solid #e7b78f",
      borderRadius: "50%",
      width: "70px",
      height: "70px",
      padding: "10px",
    },
    score: {
      [theme.breakpoints.down("xs")]: {
        fontSize: "30px",
      },
      fontSize: "45px",
      lineHeight: "40px",
      textAlign: "center",
      color: "#ffffff",
      width: "70px",
      height: "70px",
      padding: "10px",
    },
    gameContainer: {},
    game: {
      [theme.breakpoints.down("sm")]: {
        minWidth: "600px",
        maxWidth: "600px",
      },
      [theme.breakpoints.down("xs")]: {
        minWidth: "600px",
        maxWidth: "600px",
      },
      height: "450px",
      maxWidth: "600px",
      minWidth: "600px",
      background: "rgb(80 80 80 / 65%)",
      borderRadius: "40px",
      padding: "10px",
    },
    trueMark: {
      color: "#ffeb3b",
      fontSize: "30px",
    },
    falseMark: {
      color: "#ffffff",
      fontSize: "30px",
    },
    wordsContainer: {
      "& button svg": {
        zIndex: 1,
      },
    },
    enWord: {
      fontWeight: "bold",
      fontSize: "40px",
      lineHeight: "22px",
      color: "#FFFFFF",
    },
    ruWord: {
      fontSize: "30px",
      lineHeight: "22px",
      color: "#FFFFFF",
      marginTop: "9px",
    },
    parrotsContainer: {
      position: "relative",
    },
    parrot: {
      animation: `$bubble 0.3s linear`,
    },
    hidden: {
      visibility: "hidden",
    },
    branch: {
      position: "absolute",
      top: "-2px",
      transform: "rotate(29deg)",
      width: "270px",
      height: "150px",
    },
    buttonsContainer: {
      "& button": {
        [theme.breakpoints.down("xs")]: {
          width: "120px",
          height: "35px",
        },
      },
    },
    buttonFalse: {
      backgroundColor: "#e79666",
      flexDirection: "row-reverse",
      "&:hover": {
        backgroundColor: "#efaf8a",
      },
    },
    buttonTrue: {
      backgroundColor: "#4cca78",
      "&:hover": {
        backgroundColor: "#60d488",
      },
    },
    buttonIcon: {
      display: "flex",
    },
    audioButton: {
      display: "contents",
      cursor: "pointer",
      "& svg": {
        color: "#ffffff",
      },
    },
    "@keyframes bubble": {
      "0%": {
        transform: "scale(0.5)",
      },
      "30%": {
        transform: "scale(0.7)",
      },
      "70%": {
        transform: "scale(0.9)",
      },
      "100%": {
        transform: "scale(1)",
      },
    },
    "@keyframes bubbleBack": {
      "0%": {
        transform: "scale(1)",
      },
      "30%": {
        transform: "scale(0.9)",
      },
      "70%": {
        transform: "scale(0.7)",
      },
      "85%": {
        transform: "scale(0.5)",
      },
      "100%": {
        transform: "scale(0.2)",
      },
    },
  })
);

export default Sprint;
