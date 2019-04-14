import React from 'react';
import './Cell.css';

const Cell = ({ id, color, size, clickHandler }) => {
  let classString = 'cell-' + size + ' ' + color;
  return (
    <div
      className={classString}
      onClick={e => {
        //console.log(id);
        clickHandler(id);
      }}
    />
  );
};

export default Cell;
