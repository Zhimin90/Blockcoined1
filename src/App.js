import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Input,
  Header,
  Button,
  Container,
  Dropdown,
  Message,
  Progress
} from "semantic-ui-react";
import _, { isEqual } from "lodash";
import soundfile from "./sound/Cha-ching-sound.mp3";
import Sound from "react-sound";
import AnimaGrid from "./components/PoseGrid/AnimaGrid";
import { Graph } from "./Graph";
import { Animation } from "./Anima";
import posed, { PoseGroup } from "react-pose";
import { tween } from "popmotion";
import styled from "styled-components";
import EOSIOClient from "./eosio-client";
import { renderGrid, poseToggle, setAnimationCtrl } from "./js/actions/index";

import "./AnimaGrid.css";

//import './index.css';

import { Api, JsonRpc, RpcError } from "eosjs";

import JsSignatureProvider from "eosjs/dist/eosjs-jssig"; // development only

const defaultPrivateKey = "5KdYVxFXHXhqU5d53x5bQcPRWfi7FfDJmuhQbb1YU2vqs7QtyE4";
const bob_PrivateKey = "5JwnqdADow3amsqZK7bLU533zFkiLPFPaqYMnjxi8YqFRdoto4e"; // useraaaaaaaa
const alice_PrivateKey = "5HynzjwRBZaaLv1TbhmjRXbj8fq4jLuzesshVJMMXkGwdY49RfY";
const all_keys = "5KefJBcv3KUvHJY8aHtTiUoFn9TX6JjdJipSdwSQAteuR5pfV2n";
const signatureProvider = new JsSignatureProvider([
  all_keys,
  defaultPrivateKey,
  bob_PrivateKey,
  alice_PrivateKey
]);

const fetch = require("node-fetch");
//const rpc = new JsonRpc('http://18.191.77.209:8888', { fetch });
//const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
//const rpc = new JsonRpc('http://192.168.80.131:8888', { fetch });
const rpc = new JsonRpc("https://jungle2.cryptolions.io:443", { fetch });
const api = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
});

const SIZE = 8;
const COLORS = ["blue", "red", "green", "yellow", "orange"];

//react-redux connector
const mapStateToProps = state => {
  return {
    redux_animagrid: state.grid,
    redux_pose_toggle: state.pose_toggle,
    redux_animation: state.animation_ctrl
  };
};

function mapDispatchToProps(dispatch) {
  return {
    renderGrid: grid => dispatch(renderGrid(grid)),
    poseToggle: pose_toggle => dispatch(poseToggle(pose_toggle)),
    setAnimationCtrl: animation => dispatch(setAnimationCtrl(animation))
  };
}

const Winner_Div = styled.h1`
  font-size: 3em;
  text-align: center;
  color: red;
`;

const Item = posed.li({
  enter: { opacity: 1 },
  exit: { opacity: 0 }
});

const StyledItem = styled(Item)`
  padding: 7px;
  list-style-type: none;
  margin: 0px 0px 0px 0px;
  border: 1px solid #e3e3e3;
  float: left;
  display: inline-block;
`;

const ItemList = ({ items }) => {
  //console.log(items);
  return (
    <ul>
      <PoseGroup>
        {Object.keys(items).map(key => (
          <StyledItem key={items[key].indexs}>
            {items[key].challengers}
          </StyledItem>
        ))}
      </PoseGroup>
    </ul>
  );
};

class Position {
  constructor() {
    this.index = 0;
    this.x = 0;
    this.y = 0;
  }
}

const Parent = posed.ul();

const T = styled.div`
  transition: 0.12s;
`;

const C = posed(T)({
  hoverable: true,
  pressable: true,
  enter: {
    opacity: 1,
    x: ({ x }) => x,
    y: ({ y }) => y,
    scale: ({ i }) => i,
    text: ({ text }) => text,
    position: "absolute"
  },
  exit: {
    opacity: 0,
    x: ({ x }) => x,
    y: ({ y }) => y,
    scale: ({ i }) => i,
    text: ({ text }) => text,
    position: "absolute"
  },
  pose1: {
    //opacity: 0,
    x: ({ x }) => x,
    y: ({ y }) => y,
    text: ({ text }) => text,
    scale: ({ i }) => i,
    position: "absolute"
  },
  pose2: {
    //opacity: 0,
    x: ({ x }) => x,
    y: ({ y }) => y,
    text: ({ text }) => text,
    scale: ({ i }) => i,
    position: "absolute"
  },
  draggable: true,
  init: {
    x: ({ x }) => x,
    y: ({ y }) => y,
    text: ({ text }) => text,
    position: "absolute",
    scale: ({ i }) => i,
    boxShadow: "0px 0px 0px rgba(0,0,0,0)"
  },
  hover: {
    x: ({ x }) => x,
    y: ({ y }) => y,
    text: ({ text }) => text,
    position: "absolute",
    scale: 1.2,
    boxShadow: "0px 5px 10px rgba(0,0,0,0.2)"
  },
  press: {
    x: ({ x }) => x,
    y: ({ y }) => y,
    text: ({ text }) => text,
    position: "absolute",
    scale: 1.3,
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
  }
});

const Circle = styled(C)`
  background-color: ${props => props.c || props.possible_move1};
`;

class MyComponentWithSound extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.enterPose === this.props.enterPose) {
      return false;
    } else {
      return true;
    }
  }
  render() {
    var props = {};
    return <Sound {...this.props} />; // Check props in next section
  }
}

function get_coordinate_x(x_pos, y_pos, angle) {
  return x_pos * Math.cos(angle) - y_pos * Math.sin(angle);
}

function get_coordinate_y(x_pos, y_pos, angle) {
  return y_pos * Math.cos(angle) + x_pos * Math.sin(angle);
}

class BoardGrid extends React.Component {
  async componentDidUpdate() {
    //console.log('BoardGrid rendered');
  }

  render() {
    return <PoseGroup {...this.props} />;
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.restart = this.restart.bind(this);
    this.create_game = this.create_game.bind(this);
    this.cellClick = this.cellClick.bind(this);
    this.posed = this.posed.bind(this);

    this.nodes = {};
    this.board_index = {};
    this.prev_nodes = {};
    this.prev_board_index = {};
    this.clicked = false;
    this.first_scan = 0;
    this.graph = new Graph(SIZE);
    this.score = 0;
    this.queue_pos_max = 0;
    this.game_turn = 0;
    this.Loaded = false;
    this.animation = [];
    this.current_slice = 0;
    this.animating_seq = false;
    this.posing = false;
    this.queue_save = {};

    this.state = {
      pose_toggle: false,
      //animagrid: new AnimaGrid(SIZE), //moved to redux store
      clicked_cell_1: null,
      clicked_cell_2: null,
      challenger_name: "eoszhiminzou",
      errormessage: "",
      game_selected: "eoszhiminzou",
      token_qty: "10.0000 BLC",
      winner: "none"
    };
    this.eosio = new EOSIOClient("blockcoined1");
  }

  /*shouldComponentUpdate(nextProps, nextState) {
    if (nextProps !== this.props || nextState !== this.state) {
      return true;
    } else {
      return false;
    }
  }*/

  async componentDidMount() {
    this.mounted = true;
    try {
      if (this.first_scan === 0) {
        // await this.create_game();
      }
      this.props.renderGrid(this.get_newAnimaGrid());

      this.timer = setInterval(() => {
        //console.log('animating_seq: ', this.animating_seq);
        if (typeof this.eosio.account === "undefined") {
          this.setState({
            errormessage: "\nCan't connect to Scatter account! "
          });
          Object.assign(this.eosio, { account: { name: "none" } });
        }
        this.fetch_array();
        //console.log('game_selected is: ', this.props.game_selected);
        let score = 0;
        //this.updateScore(score);
        let newAnimaGrid = this.get_newAnimaGrid();
        let equal = _.isEqual(newAnimaGrid, this.props.redux_animagrid);

        if (!equal && this.first_scan) {
          this.current_slice = 0;
          let score = 0;

          //if (!this.state.animating) {
          console.log("called sequencer from DidMount");
          console.log();
          this.fetch_animation_table(() => {
            this.animating_seq = true;
            this.props.setAnimationCtrl({
              animation: this.animation,
              current_slice: this.current_slice,
              animating_seq: this.animating_seq,
              posing: this.posing
            });

            this.animation_sequencer(newAnimaGrid);
          });
          //}
        }
      }, 1000);
    } catch (e) {
      await this.create_game();
    }
  }

  animation_sequencer(newAnimaGrid) {
    console.log("animation: ", this.animation);
    /*if (this.current_slice < this.animation.slice.length) {
      this.animation.merge(
        this.prev_nodes,
        this.prev_board_index,
        this.current_slice,
      );
    }*/
    console.log(
      "before this.props.redux_pose_toggle ",
      this.props.redux_pose_toggle
    );
    this.props.renderGrid(newAnimaGrid);
    this.props.poseToggle(this.props.redux_pose_toggle ? false : true);
    this.posing = true;
    console.log("slice size: ", this.animation.slice.length);
    if (this.current_slice < this.animation.slice.length) {
      this.animating_seq = false;
      this.current_slice = 0;
      // this.current_slice = this.current_slice + 1;
      //console.log('newAnimaGrid: ', newAnimaGrid);
    } else {
      console.log("else called  ...................................");
      this.animating_seq = false;
      this.current_slice = 0;
    }
    //this.forceUpdate();
    console.log("current slice is: ", this.current_slice);
  }

  async componentDidUpdate() {
    //console.log('render done');
    if (this.animating_seq === true && this.posing === false) {
      //console.log('called sequencer from on DidUpdate');
      //this.animation_sequencer(this.get_newAnimaGrid());
    }
  }

  get_newAnimaGrid() {
    let newAnimaGrid = new AnimaGrid(SIZE);
    Object.keys(newAnimaGrid.nodes).map(key => {
      //console.log(this.board_index[key]);
      if (typeof this.nodes[key] !== "undefined") {
        newAnimaGrid.nodes[key].color = COLORS[this.nodes[key].color];
      } else {
        newAnimaGrid.nodes[key].color = 0;
      }
      if (typeof this.board_index[key] !== "undefined") {
        newAnimaGrid.positions[key].index = this.board_index[key];
      } else {
        newAnimaGrid.positions[key].index = key;
      }
      newAnimaGrid.positions[key].x =
        newAnimaGrid.positions[key].offset.x +
        get_coordinate_x((key % 8) * 80, Math.floor(key / 8) * 80, 0.785398);
      newAnimaGrid.positions[key].y =
        newAnimaGrid.positions[key].offset.y +
        get_coordinate_y((key % 8) * 80, Math.floor(key / 8) * 80, 0.785398);
    });

    return newAnimaGrid;
  }

  get_coordinate(key) {
    var i;
    for (i = 0; i < 64; i++) {
      if (this.board_index[i] === key) {
        return i;
      }
    }
    return 0;
  }

  componentWillUnmount() {
    console.log("unmounted");
    clearInterval(this.timer);
    clearInterval(this.timer2);

    this.timer = null; // here...
    this.timer2 = null;
    this.mounted = false;
  }

  async fetch_array() {
    try {
      var resp = await rpc.get_table_rows({
        json: true, // Get the response as json
        code: "blockcoined1", // Contract that we target
        scope: this.props.game_selected, // Account that owns the data
        table: "jgames", // Table name
        limit: 100
      }); // maximum number of rows that we want to get
      //console.log(resp);

      this.score = resp.rows[0].host_score;
      this.queue_pos_max = resp.rows[0].Queue_pos_max;
      this.game_turn = resp.rows[0].Game_turn;
      //console.log(resp.rows[0]);

      let nGraph = new Graph(SIZE);
      let board64 = resp.rows[0].board;
      var nNode = nGraph.nodes[1];
      let nBoard_Index = resp.rows[0].board_index;
      //var nIndex
      //console.log("board64 ", board64)
      this.prev_nodes = this.nodes;
      this.prev_board_index = this.board_index;
      for (let i = 0; i < board64.length; i++) {
        nNode = Object.assign({ id: i, color: board64[i] - 65 });
        nGraph.nodes[i] = nNode;
        this.nodes[i] = nNode;
        this.board_index[i] = resp.rows[0].board_index[i];
      }

      if (resp.rows[0].winner !== "none") {
        this.setState({ winner: resp.rows[0].winner });
      }

      //this.setState({graph_save: nGraph})
      if (this.first_scan === 0) {
        this.graph = nGraph;
        this.first_scan = 1;
      }
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async fetch_animation_table(callback) {
    try {
      var resp = await rpc.get_table_rows({
        json: true, // Get the response as json
        code: "blockcoined1", // Contract that we target
        scope: this.props.game_selected, // Account that owns the data
        table: "animaindex", // Table name
        limit: 100
      }); // maximum number of rows that we want to get
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
    console.log(resp);
    let board = this.graph;
    this.animation = new Animation(resp, function() {
      //board = this.merge(board.nodes, 8);
    });

    //await console.log("board passed back is", board);
    let nodes = board;
    let nGraph = this.graph;
    //let board64 = resp.rows[0].board;
    //var nNode = nGraph.nodes[1];
    var nNode = {};
    for (let i = 0; i < nodes.length; i++) {
      nNode = Object.assign({ id: i, color: nodes[i] });
      nGraph.nodes[i] = nNode;
    }

    callback.call(this);
  }

  async close_game() {
    const actionName = "close";
    const actionData = {
      challenger: this.eosio.account.name,
      host: this.props.game_selected
    };
    try {
      const result = await this.eosio.transaction(actionName, actionData);
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async create_game(host) {
    console.log("tried to create game");
    const actionName = "createjgames";
    const actionData = {
      host: this.eosio.account.name
    };
    try {
      const result = await this.eosio.transaction(actionName, actionData);
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async move(C1, C2) {
    const actionName = "move";
    const actionData = {
      host: this.props.game_selected,
      //by: this.state.challenger_name,
      by: this.eosio.account.name,
      cell_clicked1: C1,
      cell_clicked2: C2
    };
    try {
      const result = await this.eosio.transaction(actionName, actionData);
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async buyqueue() {
    console.log("buy queue");
    try {
      const result = await api.transact(
        {
          actions: [
            {
              account: "blockcoined1",
              name: "buyqueue",
              authorization: [
                {
                  actor: this.state.challenger_name,
                  permission: "active"
                }
              ],
              data: {
                host: this.props.game_selected,
                buyer: this.state.challenger_name,
                quantity: 1
              }
            }
          ]
        },
        {
          blocksBehind: 6,
          expireSeconds: 60
        }
      );
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async stealturn() {
    console.log("stealturn");
    const actionName = "stealturn";
    const actionData = {
      host: this.props.game_selected,
      by: this.eosio.account.name
    };
    try {
      const result = await this.eosio.transaction(actionName, actionData);
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async joingame() {
    const actionName = "joinhostgame";
    const actionData = {
      host: this.props.game_selected,
      challenger: this.eosio.account.name
    };
    console.log("join game");
    try {
      const result = await this.eosio.transaction(actionName, actionData);
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async enqueue() {
    const actionName = "buyqueue";
    const actionData = {
      host: this.props.game_selected,
      buyer: this.eosio.account.name,
      quantity: 3
    };
    try {
      const result = await this.eosio.transaction(actionName, actionData);
      console.log(result);
      //this.getBalance(); // We can check a user's EOS balance.
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async refund() {
    const actionName = "refundtoken";
    const actionData = {
      host: this.props.game_selected,
      challenger: this.eosio.account.name
    };
    try {
      const result = await this.eosio.transaction(actionName, actionData);
      console.log(result);
      //this.getBalance(); // We can check a user's EOS balance.
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  async invoice_token_scatter() {
    console.log(this.state.token_qty);
    const actionData = {
      to: "blockcoined1",
      quantity: this.state.token_qty,
      memo: this.props.game_selected
    };
    try {
      const result = await this.eosio.tokenTransfer(actionData);
      console.log(result);
      //this.getBalance(); // We can check a user's EOS balance.
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  incrementCount() {
    this.score = this.score + 1;
  }

  restart() {
    this.close_game();
    //this.create_game;
    this.setState({
      graph: new Graph(SIZE),
      score: 0
    });
    this.componentDidMount();
  }

  cellClick(id) {
    this.clicked = true;
    console.log("clicked ", id);
    var id_prev = this.state.clicked_cell_1;
    //this.state.graph.cellClick(id);
    //console.log("clicked id is: ", id);
    this.setState(
      {
        clicked_cell_1: id,
        clicked_cell_2: id_prev
      },
      () => {
        this.checkClicks();
      }
    );
  }

  checkClicks() {
    if (Math.abs(this.state.clicked_cell_1 - this.state.clicked_cell_2) === 8) {
      this.sendClicks();
    }
    if (Math.abs(this.state.clicked_cell_1 - this.state.clicked_cell_2) === 1) {
      this.sendClicks();
    }
  }

  sendClicks() {
    console.log("click 1 sent: ", this.state.clicked_cell_1);
    console.log("click 2 sent: ", this.state.clicked_cell_2);
    this.move(this.state.clicked_cell_1, this.state.clicked_cell_2);
    this.setState(
      {
        clicked_cell_1: null,
        clicked_cell_2: null
      },
      () => {
        this.animating_seq = false;
      }
    );
  }

  posed() {
    console.log(
      "before this.props.redux_pose_toggle",
      this.props.redux_pose_toggle
    );
    this.props.poseToggle(this.props.redux_pose_toggle ? false : true);

    if (this.current_slice > 0) {
      console.log("called sequencer from posed()");
      this.animation_sequencer(this.get_newAnimaGrid());
    }
    //toggle state on PoseGroup to propogate animation to childrens aka a list of Circle

    this.posing = false;

    console.log("current_slice onRest is : ", this.current_slice);
    if (this.current_slice < this.animation.slice.length) {
      this.current_slice = this.current_slice + 1;
    } else {
      this.animating_seq = false;
      this.current_slice = 0;
      //console.log('animation slice zeroed in Pose Group');
    }
    console.log("calling next sequencer");
  }

  getPossibleMove(key) {
    var color = "";
    const near = [1, -1, 8, -8];
    near.map(num => {
      if (
        this.state.clicked_cell_1 + num ===
          this.props.redux_animagrid.nodes[key].id &&
        this.state.clicked_cell_1 !== null
      ) {
        color = color + "magenta";
      }
    });
    //console.log("color is ", color);
    return color;
  }

  drawAnimaGrid() {
    if (typeof this.board_index[0] !== "undefined") {
      //console.log('gridDrawn');
      //console.log('this.props.redux_animagrid: ', this.props.redux_animagrid);
      let ArrayofNodes = [];
      var i;
      for (i = 0; i < SIZE * SIZE; i++) {
        ArrayofNodes[i] = {
          key: this.props.redux_animagrid.positions[i].index,
          color: this.props.redux_animagrid.nodes[i].color,
          x: this.props.redux_animagrid.positions[i].x,
          y: this.props.redux_animagrid.positions[i].y
        };
      }

      var count = 0;

      return (
        <div className="board">
          <BoardGrid
            className="AnimaGrid"
            animateOnMount={true}
            enterPose={this.props.redux_pose_toggle ? "enter" : "init"}
            flipMove={false}
            onRest={e => {
              console.log("________________________Group Animation Complete");
              //this.posed();
            }}
          >
            {ArrayofNodes.map((node, key) => {
              //console.log(this.props.redux_animagrid.positions[key].x)
              return (
                <Circle
                  className={
                    "circle" + " " + this.props.redux_animagrid.nodes[key].color
                  }
                  key={node.key}
                  x={this.props.redux_animagrid.positions[key].x}
                  y={this.props.redux_animagrid.positions[key].y}
                  i={1.05}
                  c={
                    this.state.clicked_cell_1 ===
                    this.props.redux_animagrid.nodes[key].id
                      ? "red"
                      : ""
                  }
                  possible_move1={this.getPossibleMove(key)}
                  onClick={e => {
                    this.cellClick(this.props.redux_animagrid.nodes[key].id);
                  }}
                >
                  {" "}
                  {node.key}{" "}
                </Circle>
              );
            })}
          </BoardGrid>
        </div>
      );
    }
  }

  Draw_error() {
    if (this.state.errormessage !== "") {
      this.timer2 = setInterval(() => {
        this.setState({ errormessage: "" });
      }, 10000);
      //console.log('error message: ', this.state.errormessage);
      return <Message error content={this.state.errormessage} />;
    }
  }

  play_sound() {
    //console.log('sound loaded ', this.Loaded);
    if (this.first_scan === 1) {
      return (
        <MyComponentWithSound
          url={soundfile}
          playStatus={this.Loaded ? Sound.status.PLAYING : Sound.status.STOPPED}
          onLoad={e => {
            this.Loaded = true;
          }}
          autoLoad={true}
          enterPose={this.props.redux_pose_toggle ? "enter" : "init"}
        />
      );
    } else {
      return false;
    }
  }

  getWinner() {
    if (this.state.winner !== "none") {
      return (
        <div>
          <Winner_Div>
            Game Over!! Winner is{" "}
            <font color="black">{" " + this.state.winner}</font>
          </Winner_Div>
          <Winner_Div>
            Tokens will be distributed after the host closes his game.
          </Winner_Div>
        </div>
      );
    }
  }

  render() {
    return (
      <Container>
        <div className="queue">
          <ItemList items={this.props.queue} />
        </div>

        <div className="buyheader">
          <Button onClick={e => this.enqueue()}>Buy Queues</Button>
          <Input
            action={
              <Button
                color="red"
                labelPosition="right"
                icon="currency"
                content="Send to blockcoined1"
                onClick={e => {
                  console.log("clicked");
                  this.invoice_token_scatter();
                }}
              />
            }
            actionPosition="left"
            placeholder="Search..."
            defaultValue="10.0000 BLC"
            onChange={(e, data) => {
              console.log(data);
              this.setState({ token_qty: data.value });
            }}
          />
        </div>
        <div className="header">
          <Button onClick={e => this.restart()}>Close Game</Button>
          <Button onClick={e => this.create_game(this.state.challenger_name)}>
            New Game
          </Button>
          <Button onClick={e => this.stealturn()}>Steal Turn</Button>
          <Button onClick={e => this.joingame()}>Join Game</Button>
          <Button onClick={e => this.refund()}>Refund Token</Button>
        </div>
        <div>{this.Draw_error()}</div>
        {this.getWinner()}
        {this.drawAnimaGrid()}
        {this.play_sound()}
        <Progress
          progress="value"
          value={this.game_turn}
          total={this.queue_pos_max}
        />
      </Container>
    );
  }
}

const reduxApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default reduxApp;
