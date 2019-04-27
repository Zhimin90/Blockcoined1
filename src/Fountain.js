import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Message } from "semantic-ui-react";
import { JsonRpc, RpcError } from "eosjs";
import EOSIOClient from "./eosio-client";
import "./Stats.css";
//import './index.css';
const fetch = require("node-fetch");
//const rpc = new JsonRpc('http://18.191.77.209:8888', { fetch });
//const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
//const rpc = new JsonRpc('http://192.168.80.131:8888', { fetch });
const rpc = new JsonRpc("https://jungle2.cryptolions.io:443", { fetch });
//react-redux connector

const mapStateToProps = state => {
  return {
    redux_network: state.network
  };
};

class Fountain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {},
      game_list: [],
      errormessage: "",
      game_selected: "default"
    };
    this.eosio = new EOSIOClient("blocfountain", {
      redux_network: this.props.redux_network
    });
  }

  async componentDidMount() {
    await this.fetch_game_list();
    //console.log("first game in the list is: ", this.state.game_list[0].value);
  }

  componentWillUnmount() {
    //console.log("unmounted");
  }

  async fetch_game_list() {
    try {
      var resp = await rpc.get_table_rows({
        json: true, // Get the response as json
        code: "blockcoined1", // Contract that we target
        scope: "blockcoined1", // Account that owns the data
        table: "gamelist", // Table name
        limit: 100
      }); // maximum number of rows that we want to get
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }

    var games = [];
    resp.rows.map((game, index) => {
      games[index] = {
        key: index,
        text: "View " + game.host + "'s game",
        value: game.host,
        image: { avatar: false, src: "" }
      };
      return 0;
    });

    this.setState({ game_list: games });
    return games;
  }

  async refill() {
    const actionName = "claim";
    const actionData = {
      recipient: this.eosio.account.name
    };
    try {
      await this.eosio.transaction(actionName, actionData);
    } catch (e) {
      console.log("\nCaught exception: " + e);
      this.setState({ errormessage: "\nCaught exception: " + e });
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }
  }

  render() {
    return (
      <div>
        <Message error content={this.state.errormessage} />
        <Button
          onClick={e => {
            this.refill();
          }}
        >
          Fill token from blocfountain
        </Button>
      </div>
    );
  }
}

const Fountain_wrap = connect(
  mapStateToProps,
  null
)(Fountain);

export default Fountain_wrap;
