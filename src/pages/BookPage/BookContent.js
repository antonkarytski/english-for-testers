import React, { useEffect, useState } from "react";
import { useWords } from "../../hooks/hooks.words";
import WordCard from "../../components/WordCard/WordCard.js";
import { useHistory, useParams } from "react-router-dom";
import { useUserWords } from "../../hooks/hooks.user";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { checkGroup, checkPage } from "../../helpers/utils.checkers";
import {
  removePagesFromPageList,
  setCurrentGroup,
  setCurrentPage,
  setCurrentWords,
} from "../../redux/actions.book";
import { MODE_BOOK, WORD_HARD } from "../../settings/settings";
import classesCss from "./BookPage.module.scss";

export default function BookContent({ setTotalValues, setTotalPagesCount }) {
  const [isPagesFirstDeleteComplete, setPageFirstDeleteComplete] = useState(
    false
  );
  const { currentWords, getWordsChunk } = useWords();
  const { currentUserWords, getUserWordsChunk } = useUserWords();
  const { isLogged, words: userWords } = useSelector((state) => state.user);
  const {
    currentWords: wordsToRender,
    pagesList,
    currentPageIndex,
  } = useSelector((state) => state.book);

  const dispatch = useDispatch();

  const history = useHistory();
  const { group: urlGroup, page: urlPage = 1 } = useParams();
  const group = checkGroup(urlGroup - 1);
  const page = checkPage(urlPage - 1);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    function findUserWord(word) {
      const userWord = currentUserWords.find(
        (userWord) => userWord.id === word.id
      );
      if (userWord) return userWord;
      return word;
    }

    if (currentWords?.length) {
      if (isLogged && currentUserWords?.length) {
        dispatch(
          setCurrentWords(currentWords.map((word) => findUserWord(word)))
        );
      } else {
        dispatch(setCurrentWords([...currentWords]));
      }
    }
  }, [currentWords, currentUserWords, isLogged, dispatch]);

  useEffect(() => {
    if (group !== undefined && page !== undefined) {
      getWordsChunk(group, page);
      if (isLogged) getUserWordsChunk(group, page);
    }
  }, [group, page, getWordsChunk, getUserWordsChunk, isLogged]);

  useEffect(() => {
    if (wordsToRender) {
      const totals = {
        success: 0,
        fail: 0,
        learned: 0,
      };
      wordsToRender.forEach(({ optional, difficulty }) => {
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
  }, [wordsToRender, setTotalValues]);

  useEffect(() => {
    if (
      isLogged &&
      !isPagesFirstDeleteComplete &&
      group !== undefined &&
      userWords &&
      userWords[group]
    ) {
      const pagesToRemove = Object.keys(userWords[group]).filter(
        (pageIndex) => {
          return (
            userWords[group].hasOwnProperty(pageIndex) &&
            userWords[group][pageIndex].length === 20 &&
            userWords[group][pageIndex].every(
              ({ optional }) => optional?.deleted
            )
          );
        }
      );
      setPageFirstDeleteComplete(true);
      if (pagesToRemove.length)
        dispatch(removePagesFromPageList(group, pagesToRemove));
    }
  }, [group, userWords, dispatch, isPagesFirstDeleteComplete, isLogged]);

  useEffect(() => {
    if (
      isLogged &&
      isPagesFirstDeleteComplete &&
      userWords[group] &&
      userWords[group][page]?.length === 20 &&
      !userWords[group][page].some(({ optional }) => !optional?.deleted)
    ) {
      dispatch(removePagesFromPageList(group, page));
    }
  }, [userWords, group, page, isPagesFirstDeleteComplete, dispatch, isLogged]);

  useEffect(() => {
    setPageFirstDeleteComplete(false);
    dispatch(setCurrentGroup(group));
  }, [group, dispatch]);

  useEffect(() => {
    const currentExistingPageIndex = pagesList[group].findIndex(
      (existingPage) => existingPage === Number(page)
    );
    setTotalPagesCount(pagesList[group].length);
    if (currentExistingPageIndex + 1) {
      dispatch(setCurrentPage(currentExistingPageIndex));
    } else {
      const newPage = pagesList[group].reduce((prev, nextPage) => {
        return Math.abs(nextPage - page) > Math.abs(prev - page)
          ? prev
          : nextPage;
      });
      history.push(`/${MODE_BOOK}/${group + 1}/${newPage + 1}`);
    }
  }, [
    pagesList,
    page,
    dispatch,
    group,
    history,
    currentPageIndex,
    setTotalPagesCount,
  ]);

  useEffect(() => {
    if (!wordsToRender?.length) return;
    setTimeout(() => {
      setCanRender(true);
    }, 2000);
  }, [wordsToRender?.length]);

  return (
    <div className={cx(classesCss.BookContent)}>
      {wordsToRender?.length && canRender
        ? wordsToRender.map((word) => {
            if (!word.optional?.deleted) {
              return (
                <WordCard
                  className={cx({
                    [classesCss.DifficultWord]: word.difficulty === WORD_HARD,
                  })}
                  key={word.id}
                  cardInfo={word}
                />
              );
            }
            return null;
          })
        : null}
    </div>
  );
}
