import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import classesCss from "../BookPage.module.scss";
import { useSelector } from "react-redux";
import { MODE_BOOK } from "../../../settings/settings";

export default function PaginationInput({ totalPagesCount, currentPageIndex }) {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(
    totalPagesCount !== 0 ? currentPageIndex + 1 : 0
  );
  const { currentGroup, vocabularyMode, mode, pagesList } = useSelector(
    (store) => store.book
  );
  const history = useHistory();

  function onChangedHandler(e) {
    setValue(e.target.value);
  }

  const deactivateEditMode = () => {
    if (value - 1 !== currentPageIndex) {
      const nextPage =
        mode === MODE_BOOK ? pagesList[currentGroup][value - 1] + 1 : value;
      history.push({
        pathname: `/${mode}/${currentGroup + 1}/${nextPage}`,
        state: { vocabularyMode },
      });
    }
    setEditMode(false);
  };

  useEffect(() => {
    if (editMode) return;

    setValue(currentPageIndex + 1);
    // if (totalPagesCount !== 0) {
    //   if (value !== currentPageIndex + 1) setValue(currentPageIndex + 1);
    // } else {
    //   setValue(0);
    // }
  }, [totalPagesCount, currentPageIndex, value, editMode]);

  return (
    <div className={classesCss.PageCounter}>
      {editMode ? (
        <input
          className={classesCss.SelectedInput}
          value={value}
          onChange={onChangedHandler}
          autoFocus={true}
          onBlur={deactivateEditMode}
        />
      ) : (
        <span onClick={() => setEditMode(true)}>
          {`${value} / ${totalPagesCount}`}
        </span>
      )}
    </div>
  );
}
