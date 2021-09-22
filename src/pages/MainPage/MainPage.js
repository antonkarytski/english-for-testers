import React from "react";
import classesCss from "./MainPage.module.scss";
import Footer from "./Footer";
import NavigationBar from "./Navigation/NavigationBar";
import DescriptionBlock from "./DescriptionBlock";

const girlStyle = {
  backgroundImage: `url(${process.env.PUBLIC_URL}/static/girl.png)`,
};

export default function MainPage() {
  return (
    <div className={classesCss.MainPage}>
      <div className={classesCss.Bg}>
        <NavigationBar className={classesCss.NavigationZIndex} />
        <div className={classesCss.Girl}>
          <div style={girlStyle} />
        </div>
        <div className={classesCss.Wave} />
        <DescriptionBlock />
        <Footer />
      </div>
    </div>
  );
}
