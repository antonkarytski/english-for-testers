import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory, useLocation, useParams } from "react-router-dom";
import cx from "classnames";
import { checkGroup, checkPage } from "../../helpers/utils.checkers";
import { useUserWordsGroup } from "../../hooks/hooks.user";
import {
  setCurrentGroup,
  setVocabularyCurrentPage,
  setVocabularyMode,
  setVocabularyWords,
} from "../../redux/actions.book";
import WordCard from "../../components/WordCard/WordCard";
import BookDisclaimerEmpty from "./BookDisclaimerEmpty";
import {
  MODE_VOCABULARY,
  SETTINGS,
  VOCABULARY_MODE_DELETED,
  VOCABULARY_MODE_DIFFICULT,
  VOCABULARY_MODE_NORMAL,
  WORD_HARD,
} from "../../settings/settings";
import classesCss from "./BookPage.module.scss";

const VOCABULARY_SECTIONS = [
  {
    mode: VOCABULARY_MODE_NORMAL,
    label: "Изучаемые",
  },
  {
    mode: VOCABULARY_MODE_DIFFICULT,
    label: "Сложные",
  },
  {
    mode: VOCABULARY_MODE_DELETED,
    label: "Удаленные",
  },
];

const maxWordsInPage = SETTINGS.DEFAULT_WORD_CHUNK_LENGTH;

export default function VocabularyContent({
  setTotalPagesCount,
  setTotalValues,
}) {
  const { getUserWordsGroup, currentUserWordsGroup } = useUserWordsGroup();
  const [wordsToRender, setWordsToRender] = useState(null);
  const [searchWordSet, setSearchWordSet] = useState(null);
  const { words: userWords } = useSelector(({ user }) => user);
  const { searchWord, isSearchMenuOpened } = useSelector(
    ({ vocabularySearch }) => vocabularySearch
  );
  const dispatch = useDispatch();

  const history = useHistory();
  const { state } = useLocation();
  const urlVocabularyMode = state
    ? state.vocabularyMode
    : VOCABULARY_MODE_NORMAL;
  const { group: urlGroup, page: urlPage = 1 } = useParams();
  const group = checkGroup(urlGroup - 1);
  const page = checkPage(urlPage - 1);

  function getVocabularyUrl(mode) {
    return {
      pathname: `/${MODE_VOCABULARY}/${group + 1}/1`,
      state: { vocabularyMode: mode },
    };
  }

  useEffect(() => {
    if (searchWord) {
      const filteredWords = wordsToRender.flat().filter((word) => {
        return (
          word.word.search(searchWord) + 1 ||
          word.wordTranslate.search(searchWord) + 1
        );
      });
      setSearchWordSet(filteredWords);
      return;
    }
    if (isSearchMenuOpened) setSearchWordSet(null);
  }, [searchWord, wordsToRender, isSearchMenuOpened]);

  useEffect(() => {
    if (!isSearchMenuOpened) setSearchWordSet(null);
  }, [isSearchMenuOpened]);

  useEffect(() => {
    if (userWords[group] && Object.keys(userWords[group]))
      getUserWordsGroup(group);
  }, [userWords, group, getUserWordsGroup]);

  useEffect(() => {
    if (currentUserWordsGroup) {
      const userFlatWords = Object.values(currentUserWordsGroup)
        .flat()
        .filter(({ optional, difficulty }) => {
          const isDifficultyHard = difficulty === WORD_HARD;
          if (urlVocabularyMode === VOCABULARY_MODE_DIFFICULT)
            return isDifficultyHard && !optional.deleted;
          if (urlVocabularyMode === VOCABULARY_MODE_DELETED)
            return optional.deleted;
          return (
            (isDifficultyHard ||
              optional.failCounter + optional.successCounter) &&
            !optional.deleted
          );
        });
      const pagesNumber = Math.ceil(userFlatWords.length / maxWordsInPage);
      const slicedUserWords = Array(pagesNumber)
        .fill(null)
        .map((el, index) => {
          return userFlatWords.slice(
            index * maxWordsInPage,
            maxWordsInPage * (index + 1)
          );
        });
      setWordsToRender(slicedUserWords);
      setTotalPagesCount(pagesNumber);
    }
  }, [currentUserWordsGroup, urlVocabularyMode, setTotalPagesCount]);

  useEffect(() => {
    dispatch(setCurrentGroup(group));
  }, [group, dispatch]);

  useEffect(() => {
    dispatch(setVocabularyCurrentPage(page));
  }, [page, dispatch]);

  useEffect(() => {
    dispatch(setVocabularyMode(urlVocabularyMode));
  }, [urlVocabularyMode, dispatch]);

  useEffect(() => {
    dispatch(setVocabularyWords(wordsToRender));
  }, [wordsToRender, dispatch]);

  useEffect(() => {
    if (wordsToRender?.[page]) {
      const totals = {
        success: 0,
        fail: 0,
        learned: 0,
      };
      wordsToRender?.[page]?.forEach(({ optional, difficulty }) => {
        if (
          (optional?.successCounter + optional?.failCounter ||
            difficulty === WORD_HARD) &&
          !optional?.deleted
        ) {
          totals.success += optional.successCounter || 0;
          totals.fail += optional.failCounter || 0;
          totals.learned += 1;
        }
      });
      setTotalValues(totals);
    }
  }, [wordsToRender, setTotalValues, page]);

  useEffect(() => {
    if (wordsToRender?.length && wordsToRender.length < urlPage) {
      history.push({
        pathname: `/${MODE_VOCABULARY}/${group + 1}/${wordsToRender?.length}`,
        state: urlVocabularyMode,
      });
    }
  }, [wordsToRender, urlPage, history, group, urlVocabularyMode]);

  return (
    <>
      <div className={cx(classesCss.VocabularyHeader)}>
        {VOCABULARY_SECTIONS.map((section) => (
          <NavLink
            key={section.label + section.mode}
            className={cx(classesCss.VocabularySection, {
              [classesCss.Active]: urlVocabularyMode === section.mode,
            })}
            to={getVocabularyUrl(section.mode)}
          >
            {section.label}
          </NavLink>
        ))}
      </div>
      <div className={classesCss.BookContent}>
        {(() => {
          if (searchWordSet) {
            if (searchWordSet.length) {
              return searchWordSet.map((word) => {
                return <WordCard key={word.id} cardInfo={word} />;
              });
            }
            return <BookDisclaimerEmpty />;
          }
          if (wordsToRender?.length && wordsToRender[page]?.length) {
            return wordsToRender[page].map((word) => {
              return <WordCard key={word.id} cardInfo={word} />;
            });
          }
          return <BookDisclaimerEmpty />;
        })()}
      </div>
    </>
  );
}
