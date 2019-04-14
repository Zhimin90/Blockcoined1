import React from 'react';
import ReactDOM from "react-dom";
import posed from "react-pose";
import './AnimaGrid.css';
import { rgbUnit } from 'style-value-types';

const Circle = posed.div({
  hoverable: true,
  pressable: true,
  draggable: true,
  
  init: {
    scale: 1,
    x: ({ x }) => x,
    y: ({ y }) => y,  
    position: "absolute",
    boxShadow: "0px 0px 0px rgba(0,0,0,0)"
  },
  hover: {
    scale: 2,
    boxShadow: "0px 5px 10px rgba(0,0,0,0.2)"
  },
  press: {
    scale: 3,
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
  }
});

/*const StyledSquare = styled(Box)`
  width: 100px;
  height: 100px;
  background: red;
`;*/



/*const AnimaGrid = function Number_map({positions}) {
    return Object.keys(positions).map(x => <Box className="box" pose={["init"]} x={1} />);
}*/


const AnimaGrid = (props) => {
   //console.log(props);
  let rows = props.positions.map((positions) => {
    let classString ="circle" + " " + positions.color;
    return <Circle className={classString} pose={["init"]} x={positions.x} y={positions.y} key={positions.x+positions.y+positions.color}/>
  });

  return (<div className="AnimaGrid" >{rows}</div>);
}

/*
id={v} color={colors[grid.nodes[v].color]} size={grid.size} clickHandler={clickHandler}
*/

//<Number_map numbers={numbers} />

export default AnimaGrid;