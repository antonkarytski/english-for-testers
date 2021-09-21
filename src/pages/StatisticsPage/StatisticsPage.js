import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core";
import { getStatisticsThunk } from "../../redux/games/thunk.statistics";
import { useDispatch, useSelector } from "react-redux";
import { statisticsSelector } from "../../redux/games/selectors";
import StatisticsGameCard from "./StatisticsGameCard";
import BarChart from "./BarChart";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import { getUserData } from "../../helpers/gameUtils";
import { resetGameStatistics } from "../../redux/games/actions";
import classesCss from "./StatisticPage.module.scss";
import cx from "classnames";

const StatisticsPage = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const allStatistics = useSelector(statisticsSelector);

  const statistics = useMemo(() => {
    if (allStatistics.optional) {
      return parseStatistics(allStatistics);
    }
  }, [allStatistics]);

  const TOTAL = useMemo(() => {
    const todayStatistics = statistics
      ? getByGameStatistics(statistics, true)
      : null;
    return {
      totalLearnedWords: todayStatistics?.totalLearnedWords || 0,
      rightAnswersPercentToday: todayStatistics?.rightAnswersPercent || 0,
    };
  }, [statistics]);

  const GAMES = useMemo(() => {
    const defaults = {
      bestSeries: 0,
      rightAnswers: 0,
      rightAnswersPercent: 0,
      wordCounter: 0,
    };
    const allStatistics = getByGameStatistics(statistics, false);
    const todayStatistics = getByGameStatistics(statistics, true);
    const defaultGamesData = {
      savannah: { key: "savannah", translation: "Саванна" },
      audiocall: { key: "audiocall", translation: "Аудиовызов" },
      puzzle: { key: "puzzle", translation: "Пазл" },
      sprint: { key: "sprint", translation: "Спринт" },
    };
    if (statistics) {
      Object.keys(defaultGamesData).forEach((key) => {
        defaultGamesData[key] = {
          ...defaultGamesData[key],
          todayStatistics: todayStatistics[key] || defaults,
          allStatistics: allStatistics[key] || defaults,
        };
      });
    }
    return defaultGamesData;
  }, [statistics]);

  const [value, setValue] = useState(GAMES.savannah.key);

  const userId = useMemo(() => getUserData()?.id, []);

  useEffect(() => {
    dispatch(getStatisticsThunk(userId));
    return () => {
      dispatch(resetGameStatistics());
    };
  }, [dispatch, userId]);

  const barData = useMemo(() => {
    if (statistics) {
      return longTermStat(statistics);
    }
  }, [statistics]);

  const barDataDelta = useMemo(() => {
    if (statistics) {
      return longTermDeltaStat(statistics);
    }
  }, [statistics]);

  const handleChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);

  return (
    <div className={classesCss.StatisticPage}>
      <h2 className={classesCss.Title}>Статистика</h2>

      <div className={classesCss.DayStatistic}>
        <div className={classesCss.GamesStatistic}>
          <div className={classesCss.ToggleBlock}>
            <RadioGroup value={value} onChange={handleChange}>
              <FormControlLabel
                value="end"
                control={
                  <Radio
                    value={GAMES.savannah.key}
                    classes={{ root: classes.root, checked: classes.checked }}
                  />
                }
                label="Саванна"
              />
              <FormControlLabel
                value="end"
                control={
                  <Radio
                    value={GAMES.audiocall.key}
                    classes={{ root: classes.root, checked: classes.checked }}
                  />
                }
                label="Аудиовызов"
              />
              <FormControlLabel
                value="end"
                control={
                  <Radio
                    value={GAMES.puzzle.key}
                    classes={{ root: classes.root, checked: classes.checked }}
                  />
                }
                label="Пазл"
              />
              <FormControlLabel
                value="end"
                control={
                  <Radio
                    value={GAMES.sprint.key}
                    classes={{ root: classes.root, checked: classes.checked }}
                  />
                }
                label="Спринт"
              />
            </RadioGroup>
          </div>
          <div className={classesCss.Statistic}>
            {Object.keys(GAMES || {}).map((key) => {
              const gameStatistics = GAMES[key];
              console.log(GAMES);
              return key === value ? (
                <StatisticsGameCard
                  key={key}
                  gameTitle={gameStatistics.name}
                  learnedWords={0}
                  rightAnswersPercent={
                    gameStatistics.todayStatistics.rightAnswersPercent
                  }
                  bestSeries={gameStatistics.todayStatistics.bestSeries}
                />
              ) : null;
            })}
          </div>
        </div>

        <div className={cx(classesCss.StatisticStrings)}>
          <div>
            <span>Общее количество изученных слов за день: </span>
            <span className={classesCss.Value}>{TOTAL?.totalLearnedWords}</span>
          </div>
          <div>
            <span>Процент правильных ответов за день: </span>
            <span className={classesCss.Value}>
              {TOTAL?.rightAnswersPercentToday}%
            </span>
          </div>
        </div>
      </div>

      <div className={classesCss.TotalStatistic}>
        <div className={cx(classesCss.StatisticBlock, classesCss.Graphics)}>
          <BarChart
            data={barData}
            label={"Количество изученных слов за каждый день"}
          />
          <BarChart data={barDataDelta} label={"Всего изучено слова"} />
        </div>
      </div>
    </div>
  );
};

const parseStatistics = (allStatistics) => {
  return Object.keys(allStatistics.optional).reduce(
    (res, key) => {
      res.optional[key] = JSON.parse(allStatistics.optional[key]);
      return res;
    },
    { ...allStatistics }
  );
};

const isTodayDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return today.toString() === date.toString();
};

const getGameStatistics = (entries, singleDay = false) => {
  const gameTotalStatistics = entries.reduce(
    (gameResult, entry) => {
      const createdOn = new Date(entry.createdOn);

      if ((singleDay && isTodayDate(createdOn)) || !singleDay) {
        gameResult.wordCounter = gameResult.wordCounter + entry.wordCounter;
        gameResult.rightAnswers = gameResult.rightAnswers + entry.rightAnswers;
        gameResult.wrongAnswers = gameResult.wrongAnswers + entry.wrongAnswers;
        if (gameResult.bestSeries < entry.bestSeries) {
          gameResult.bestSeries = entry.bestSeries;
        }
      }

      return gameResult;
    },
    { wordCounter: 0, rightAnswers: 0, wrongAnswers: 0, bestSeries: 0 }
  );

  gameTotalStatistics.rightAnswersPercent = Math.round(
    gameTotalStatistics.rightAnswers
      ? (gameTotalStatistics.rightAnswers * 100) /
          (gameTotalStatistics.rightAnswers + gameTotalStatistics.wrongAnswers)
      : 0
  );
  return gameTotalStatistics;
};

const getTotalStatistics = (byGameStatistics) => {
  const totalStatistics = Object.keys(byGameStatistics).reduce(
    (res, key) => {
      const gameStatistics = byGameStatistics[key];
      res.totalLearnedWords =
        res.totalLearnedWords + gameStatistics.wordCounter;
      res.rightAnswers = res.rightAnswers + gameStatistics.rightAnswers;
      res.wrongAnswers = res.wrongAnswers + gameStatistics.wrongAnswers;
      return res;
    },
    { totalLearnedWords: 0, wrongAnswers: 0, rightAnswers: 0 }
  );

  totalStatistics.rightAnswersPercent = Math.round(
    (totalStatistics.rightAnswers * 100) /
      (totalStatistics.wrongAnswers + totalStatistics.rightAnswers)
  );

  return totalStatistics;
};

const getByGameStatistics = (statistics, singleDay = false) => {
  const byGameStatistics = Object.keys(statistics.optional).reduce(
    (res, key) => {
      // array of finished games for certain game type eg savannah.
      const gameStatisticsEntries = statistics.optional[key];
      res[key] = getGameStatistics(gameStatisticsEntries, singleDay);
      return res;
    },
    {}
  );

  const totalStatistics = getTotalStatistics(byGameStatistics);

  return { ...byGameStatistics, ...totalStatistics };
};

const getLongTermStatObj = (statistics) => {
  return Object.keys(statistics.optional).reduce((res, key) => {
    // array of finished games for certain game type eg savannah.
    const gameStatisticsEntries = statistics.optional[key];
    gameStatisticsEntries.forEach((entry) => {
      const createdOn = new Date(entry.createdOn);
      createdOn.setHours(0, 0, 0, 0);
      const key = createdOn.getTime();
      //если такой ключ в об есть
      if (res[key]) {
        res[key] = res[key] + entry.wordCounter;
      } else {
        res[key] = entry.wordCounter;
      }
    });
    return res;
  }, {});
};

const longTermStat = (statistics) => {
  const longTermStatObj = getLongTermStatObj(statistics);
  return Object.keys(longTermStatObj).map((key) => ({
    t: new Date(+key),
    y: longTermStatObj[key],
  }));
};

const longTermDeltaStat = (statistics) => {
  const longTermStatObj = getLongTermStatObj(statistics);
  const keys = Object.keys(longTermStatObj);
  const deltaValuesArr = Object.values(longTermStatObj).reduce(
    (res, item, index) => {
      if (index === 0) {
        res.push(Object.values(longTermStatObj)[0]);
      } else {
        res.push(res[index - 1] + item);
      }
      return res;
    },
    []
  );
  return deltaValuesArr.map((item, index) => ({
    t: new Date(+keys[index]),
    y: item,
  }));
};

const useStyles = makeStyles((theme) =>
  createStyles({
    dayStatistics: {
      color: "#ffffff",
      marginBottom: "25px",
      "& span": {
        fontSize: "20px",
        color: "#567df4",
      },
    },
    graphics: {
      lineHeight: "35px",
    },
    root: {
      color: "#f38c71",
      "&$checked": {
        color: "#e45731",
      },
    },
  })
);

export default StatisticsPage;
