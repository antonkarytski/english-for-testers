import React, { useEffect, useState } from "react";
import classesCss from "./WordCard.module.scss";
import {
  MODE_VOCABULARY,
  SETTINGS,
  VOCABULARY_MODE_DIFFICULT,
  WORD_HARD,
} from "../../settings/settings";
import SoundButton from "../Buttons/SoundButton";
import FastAverageColor from "fast-average-color";
import ButtonsBlock from "./ButtonsBlock";
import cx from "classnames";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

const fac = new FastAverageColor();

export default function WordCard({ cardInfo }) {
  const {
    optional,
    word,
    image,
    audio,
    audioMeaning,
    audioExample,
    textMeaning,
    textExample,
    transcription,
    wordTranslate,
    textMeaningTranslate,
    textExampleTranslate,
  } = cardInfo;

  const [averageColorData, setAverageColorData] = useState(null);
  const [failCounter, setFailedCounter] = useState(0);
  const [successCounter, setSuccessCounter] = useState(0);
  const { isLogged } = useSelector((store) => store.user);
  const { isTranslateVisible, mode, vocabularyMode } = useSelector(
    (store) => store.book
  );

  const { sectionVocabulary } = useParams();

  let notification;
  if (optional?.difficulty === WORD_HARD) {
    notification = "notification_important";
  } else {
    notification = "";
  }

  const audioPlayer = new Audio();
  audioPlayer.volume = 0.5;

  function playAudio(url, phase) {
    audioPlayer.src = `${SETTINGS.SERVER}/${url}`;
    audioPlayer.load();
    audioPlayer.play();

    let nextPhase;
    let nextAudio;

    if (phase === undefined) {
      nextPhase = "second";
      nextAudio = audioMeaning;
    }

    if (phase === "second") {
      nextPhase = "third";
      nextAudio = audioExample;
    }

    if (phase === "third") {
      return;
    }

    let playNextAudio = function () {
      audioPlayer.removeEventListener("ended", playNextAudio);
      playAudio(nextAudio, nextPhase);
    };
    audioPlayer.addEventListener("ended", playNextAudio);
  }

  useEffect(() => {
    if (cardInfo.optional) {
      setFailedCounter(cardInfo.optional.failCounter);
      setSuccessCounter(cardInfo.optional.successCounter);
    }
  }, []);

  if (!averageColorData) {
    fac
      .getColorAsync(`${SETTINGS.SERVER}/${image}`)
      .then((color) => {
        setAverageColorData({
          color: color.rgb,
          isLight: color.isLight,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  const isWordHard = cardInfo.difficulty === WORD_HARD;
  const isHardMode =
    mode === MODE_VOCABULARY && vocabularyMode === VOCABULARY_MODE_DIFFICULT;
  const isWordDeleted = cardInfo.optional?.deleted;
  const isShowHardStyle = isWordHard && !isHardMode && !isWordDeleted;
  return (
    <div
      style={
        !isShowHardStyle && !isWordDeleted
          ? { background: averageColorData?.color || "white" }
          : null
      }
      className={cx(classesCss.Card, {
        [classesCss.Hard]: isShowHardStyle,
        [classesCss.Deleted]: isWordDeleted,
      })}
    >
      <div
        style={{
          backgroundImage: `${
            isWordDeleted ? "linear-gradient(black, black)," : ""
          }
                                  url(${SETTINGS.SERVER}/${image})`,
        }}
        className={cx(classesCss.HeaderBlock)}
      >
        <div
          className={classesCss.Overlay}
          style={
            !isShowHardStyle && !isWordDeleted
              ? {
                  background:
                    `linear-gradient(transparent, ${averageColorData?.color})` ||
                    "transparent",
                }
              : null
          }
        >
          {isLogged && (
            <ButtonsBlock
              audio={audio}
              cardInfo={cardInfo}
              successCounter={successCounter}
              failCounter={failCounter}
              notification={notification}
              sectionVocabulary={sectionVocabulary}
            />
          )}
          <div className={cx(classesCss.WordBlock)}>
            <div className={classesCss.PrimaryBlock}>
              <h3>{word}</h3>
            </div>
            <div className={classesCss.SecondaryBlock}>
              {isTranslateVisible && <div>{wordTranslate}</div>}
              <div>{transcription}</div>
              <SoundButton
                onClick={() => playAudio(audio)}
                file={`${SETTINGS.SERVER}/${audio}`}
                className={cx(classesCss.SoundButton, classesCss.Button)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={classesCss.CardContent}>
        <div className={classesCss.WordBlock}>
          <div
            className={classesCss.Example2}
            dangerouslySetInnerHTML={{ __html: textMeaning }}
          />
          <div
            dangerouslySetInnerHTML={{ __html: textExample }}
            className={classesCss.Example}
          />
        </div>
        {isTranslateVisible && (
          <div className={classesCss.WordBlock}>
            <div className={classesCss.Example2}>{textMeaningTranslate}</div>
            <div className={classesCss.Example}>{textExampleTranslate}</div>
          </div>
        )}
      </div>
    </div>
  );
}
