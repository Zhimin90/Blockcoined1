import React, { Component } from 'react';
import posed from 'react-pose';
import { tween } from 'popmotion';
import './AnimaGrid.css';

class Node {
  constructor(id, color) {
    this.id = id;
    this.color = color;
    //this.selected = false;
  }
}

class Position {
  constructor() {
    this.index = 0;
    this.x = 0;
    this.y = 0;
    this.offset = { x: 250, y: 25 };
  }
}

function get_coordinate_x(x_pos, y_pos, angle) {
  return x_pos * Math.cos(angle) - y_pos * Math.sin(angle);
}

function get_coordinate_y(x_pos, y_pos, angle) {
  return y_pos * Math.cos(angle) + x_pos * Math.sin(angle);
}
//
class AnimaGrid extends Component {
  constructor(props, callback) {
    super(props);
    this.grid_size = 80;
    this.size = 8;
    this.nodes = {};
    this.positions = {}; //get default preset positions
    this.board_index = {};

    for (let i = 0; i < 8 * 8; i++) {
      this.nodes[i] = new Node(i, 'red');
      let newPosition = new Position();
      newPosition.index = i;
      newPosition.x =
        newPosition.offset.x +
        get_coordinate_x((i % 8) * 80, Math.floor(i / 8) * 80, 0.785398);
      newPosition.y =
        newPosition.offset.y +
        get_coordinate_y((i % 8) * 80, Math.floor(i / 8) * 80, 0.785398);
      //newPosition.x = i % 8 * this.grid_size;
      // newPosition.y =  0 ;
      this.positions[i] = newPosition;
    }

    this.state = {
      init: 0,
      pose: this.props.pose,
    };
  }

  componentDidMount() {
    this.setState({ init: 1 });
    this.nodes = this.props.animagrid.nodes;
    //console.log(this.props.animagrid.nodes)
  }

  drawAnimaGrid() {
    const Circle = posed.div({
      hoverable: true,
      pressable: true,

      init: {
        scale: 1,
        x: ({ x }) => x,
        y: ({ y }) => 0,
        position: 'absolute',
        boxShadow: '0px 0px 0px rgba(0,0,0,0)',
      },
      move: {
        scale: 1,
        x: ({ x }) => x,
        y: ({ y }) => y,
        position: 'absolute',
        boxShadow: '0px 0px 0px rgba(0,0,0,0)',
      },
      hover: {
        x: ({ x }) => x,
        y: ({ y }) => y,
        scale: 1.2,
        boxShadow: '0px 5px 10px rgba(0,0,0,0.2)',
      },
      press: {
        scale: 1.3,
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
      },
    });
    console.log('pose', this.props.pose);

    let rows = Object.keys(this.positions).map(key => {
      let classString = 'circle' + ' ' + this.nodes[key].color;
      return (
        <Circle
          className={classString}
          key={this.this.positions[key].index}
          pose={[this.props.pose]}
          x={this.positions[key].x}
          y={this.positions[key].y}
          onClick={e => {
            this.setState({ init: true });
            this.props.clickHandler(this.nodes[key].id);
          }}
        />
      );
    });
    return <div className="AnimaGrid">{rows}</div>;
  }

  render() {
    this.nodes = this.props.animagrid.nodes;
    this.positions = this.props.animagrid.positions;
    return <div>{this.drawAnimaGrid()}</div>;
  }
}

export default AnimaGrid;

/*
//*/
