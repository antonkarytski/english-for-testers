import React from "react";
import classesCss from "./MainPage.module.scss";
import GitHubButton from "../../components/Buttons/GitHubButton";
import { rssLogo } from "../../assets/logo";
import { TEAM } from "../../settings/data";

export default function Footer() {
  return (
    <div className={classesCss.Footer}>
      <div className={classesCss.RSSData}>
        <a href={"https://rs.school"} className={classesCss.RSSLink}>
          {rssLogo}
        </a>
        <div className={classesCss.FooterDate}>
          <span>2021 г.</span>
        </div>
      </div>
      {/*<div className={classesCss.Authors}>*/}
      {/*  {*/}
      {/*    TEAM.map(({github, name}) => {*/}
      {/*      return (<GitHubButton nickName={github} label={name} className={classesCss.GHButton}/>)*/}
      {/*    })*/}
      {/*  }*/}
      {/*</div>*/}
    </div>
  );
}
