import React, { useState } from "react";
import classesCss from "../BookPage.module.scss";
import Button from "../../../components/Buttons/Button";
import { GAMES_ARRAY } from "../../../settings/data";
import GameButton from "../../../components/Buttons/GameButton";
import cx from "classnames";
import { setFirstLetterToCapital } from "../../../helpers/gameUtils";
import { useSelector } from "react-redux";
import { MODE_VOCABULARY } from "../../../settings/settings";

export default function GameMenu({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentWords,
    mode,
    vocabularyCurrentPage,
    vocabularyWords,
    currentGroup,
  } = useSelector((store) => store.book);

  const wordsToTransmit = (function () {
    if (mode === MODE_VOCABULARY) {
      if (vocabularyWords) return vocabularyWords[vocabularyCurrentPage];
      return [];
    }
    return currentWords.filter(({ optional }) => !optional?.deleted);
  })();

  return (
    <div className={cx(classesCss.GameMenu, className)}>
      <Button
        className={cx(classesCss.NavigationLink, classesCss.GameMenuToggler)}
        onClick={() => setIsOpen(!isOpen)}
        label={"Тренировка"}
      />
      <div
        className={cx(classesCss.PopUpMenu, { [classesCss.Active]: isOpen })}
      >
        {GAMES_ARRAY.map((game) => {
          const isError =
            currentGroup >= 2 ||
            currentGroup <= 4 ||
            game.key === "savannah" ||
            game.key === "sprint";

          const gameCallValue = isError
            ? null
            : {
                words: wordsToTransmit,
                group: currentGroup,
                fullWordsSet:
                  mode === MODE_VOCABULARY && vocabularyWords
                    ? vocabularyWords.flat()
                    : null,
              };

          return (
            <GameButton
              gameCallValues={gameCallValue}
              game={game}
              key={game.key}
              className={classesCss.GameLink}
              classes={{
                label: classesCss.GameLabel,
                link: cx(
                  classesCss.GameLinkWrap,
                  classesCss[setFirstLetterToCapital(game.key)]
                ),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
