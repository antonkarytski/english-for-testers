import React, { useState, useEffect } from "react";

const Timer = (props) => {
  const { isActive, onCountdownFinish, initialTime, value } = props;

  useEffect(() => {
    if (value <= 0) {
      onCountdownFinish();
    }
  }, [onCountdownFinish, value]);

  return <>{value}</>;
};

export default Timer;
