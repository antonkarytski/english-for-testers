import React, { useState } from "react";
import classesCss from "./MainPage.module.scss";
import cx from "classnames";
import Button from "../../components/Buttons/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import LearnMoreButton from "../../components/Buttons/LearnMoreButton";

const slideCount = 1;
export default function DescriptionBlock() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className={classesCss.DescriptionBlock}>
      <div className={classesCss.SlideBlock}>
        <div
          className={cx(classesCss.Slide, {
            [classesCss.Active]: currentSlide === 0,
          })}
        >
          <h2>RSLang</h2>
          <Link
            className={classesCss.LearnMoreLink}
            to={{ pathname: "/about" }}
          >
            <LearnMoreButton />
          </Link>
          <p>
            Теперь учить английский язык легко и увлекательно! Играйте в
            мини-игры и учите запоминайте слова. Словарь содержит все слова,
            которые раньше встречались в играх. Повторяйте их каждый день для
            закрепления результата.
          </p>
        </div>
        {/*<div className={cx(*/}
        {/*  classesCss.Slide,*/}
        {/*  {[classesCss.Active]: currentSlide === 1},*/}
        {/*)}>*/}
        {/*  <h2>Наша команда</h2>*/}
        {/*  <Link className={classesCss.LearnMoreLink} to={{pathname:"/about", hash:"team"}}>*/}
        {/*    <LearnMoreButton />*/}
        {/*  </Link>*/}
        {/*  <p>*/}
        {/*    Мы Антон, Анна, Иван и Татьяна - команда молодых js разработчиков в рамках курса Rolling Scopes school по React представляем вам приложение для изучения английского языка.*/}
        {/*  </p>*/}
        {/*</div>*/}
      </div>
      {/*<div className={classesCss.NavigationBlock}>*/}
      {/*  <div className={classesCss.Pagination}>*/}
      {/*    {Array(slideCount)*/}
      {/*      .fill(null)*/}
      {/*      .map((el, index) => {*/}
      {/*        return (*/}
      {/*          <Button*/}
      {/*            key={"paginationMainPageButton" + index}*/}
      {/*            className={cx(classesCss.PaginationButton, {*/}
      {/*              [classesCss.Active]: index === currentSlide,*/}
      {/*            })}*/}
      {/*            onClick={() => setCurrentSlide(index)}*/}
      {/*          />*/}
      {/*        );*/}
      {/*      })}*/}
      {/*  </div>*/}
      {/*  <div className={classesCss.ButtonBlock}>*/}
      {/*    <Button*/}
      {/*      className={classesCss.NavigationButton}*/}
      {/*      label={<FontAwesomeIcon icon={faAngleLeft} />}*/}
      {/*      onClick={*/}
      {/*        currentSlide - 1 >= 0*/}
      {/*          ? () => setCurrentSlide(currentSlide - 1)*/}
      {/*          : () => setCurrentSlide(slideCount - 1)*/}
      {/*      }*/}
      {/*    />*/}
      {/*    <Button*/}
      {/*      className={classesCss.NavigationButton}*/}
      {/*      label={<FontAwesomeIcon icon={faAngleRight} />}*/}
      {/*      onClick={*/}
      {/*        currentSlide + 1 < slideCount*/}
      {/*          ? () => setCurrentSlide(currentSlide + 1)*/}
      {/*          : () => setCurrentSlide(0)*/}
      {/*      }*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}
