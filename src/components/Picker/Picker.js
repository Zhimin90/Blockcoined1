import React from 'react';

import './Picker.css';

const Picker = ({ color, colorIndex, clickHandler, incrementCount }) => {
  let className = color + ' picker';
  return (
    <div
      className={className}
      onClick={e => {
        incrementCount();
        clickHandler(colorIndex);
      }}
    />
  );
};

export default Picker;
