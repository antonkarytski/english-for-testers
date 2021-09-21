import React from "react";
import HardButton from "../Buttons/HardButton";
import classesCss from "./WordCard.module.scss";
import cx from "classnames";
import { useUserWordUpdate } from "../../hooks/hooks.user";
import { useSelector } from "react-redux";
import Button from "../Buttons/Button";
import {
  MODE_VOCABULARY,
  VOCABULARY_MODE_DELETED,
  VOCABULARY_MODE_NORMAL,
  WORD_HARD,
  WORD_NORMAL,
} from "../../settings/settings";

export default function ButtonsBlock({ cardInfo }) {
  const { update } = useUserWordUpdate();
  const { successCounter, failCounter } = cardInfo?.optional
    ? cardInfo.optional
    : {};
  const { isButtonsVisible, vocabularyMode, mode } = useSelector(
    (store) => store.book
  );

  return (
    <div className={classesCss.ButtonBlock}>
      {(() => {
        if (
          isButtonsVisible ||
          (mode === MODE_VOCABULARY &&
            vocabularyMode !== VOCABULARY_MODE_NORMAL)
        ) {
          return (
            <>
              {!(
                mode === MODE_VOCABULARY &&
                vocabularyMode === VOCABULARY_MODE_DELETED
              ) ? (
                <HardButton
                  className={cx(classesCss.Button, classesCss.HardButton, {
                    [classesCss.Active]: cardInfo.difficulty === WORD_HARD,
                  })}
                  onClick={() => {
                    if (Math.random() * 100 > 65) return;
                    cardInfo.difficulty === WORD_HARD
                      ? update(cardInfo, { difficulty: WORD_NORMAL })
                      : update(cardInfo, { difficulty: WORD_HARD });
                  }}
                />
              ) : null}

              <Button
                className={cx(
                  classesCss.Button,
                  classesCss.Icon,
                  classesCss.DeleteButton,
                  { [classesCss.Active]: cardInfo.optional?.deleted }
                )}
                onClick={() => {
                  if (Math.random() * 100 > 65) return;
                  cardInfo.optional?.deleted
                    ? update(cardInfo, { deleted: false })
                    : update(cardInfo, { deleted: true });
                }}
              />
            </>
          );
        }
      })()}
      {successCounter + failCounter ? (
        <div className={classesCss.StatsCounters}>
          <span className={classesCss.SuccessCounter}>{successCounter}</span>/
          <span className={classesCss.TotalCounter}>
            {successCounter + failCounter}
          </span>
        </div>
      ) : null}
    </div>
  );
}
