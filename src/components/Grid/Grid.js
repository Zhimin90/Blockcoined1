import React from 'react';
import Cell from '../Cell/Cell';
import './Grid.css';

const Grid = ({ grid, colors, clickHandler }) => {
  let rows = Object.keys(grid.nodes).map(v => {
    return (
      <Cell
        key={v}
        id={v}
        color={colors[grid.nodes[v].color]}
        size={grid.size}
        clickHandler={clickHandler}
      />
    );
  });

  return <div className="grid">{rows}</div>;
};

export default Grid;
