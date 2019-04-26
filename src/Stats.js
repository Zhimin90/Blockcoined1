import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import App from "./App";
import Fountain from "./Fountain";
import Howto from "./Howto";
import _ from "lodash";
import { Header, Container, Dropdown } from "semantic-ui-react";
import TablePagination from "./Table";
import { JsonRpc, RpcError } from "eosjs";
import { updateNetwork } from "./js/actions/index";
import CookieConsent from "react-cookie-consent";
import "./Stats.css";
//import './index.css';
const fetch = require("node-fetch");
//const rpc = new JsonRpc('http://18.191.77.209:8888', { fetch });
//const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });
//const rpc = new JsonRpc('http://192.168.80.131:8888', { fetch });
const rpc = new JsonRpc("https://jungle2.cryptolions.io:443", { fetch });

const endpoint_mainnet = "https://jungle2.cryptolions.io:443";
const network_mainnet = {
  blockchain: "eos",
  protocol: "https",
  host: "jungle2.cryptolions.io",
  port: 443,
  chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473"
};

const endpoint_jungle = "https://jungle2.cryptolions.io:443";
const network_jungle = {
  blockchain: "eos",
  protocol: "https",
  host: "jungle2.cryptolions.io",
  port: 443,
  chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473"
};

const endpoint_local = "http://192.168.171.130:8888";
const network_local = {
  blockchain: "eos",
  protocol: "http",
  host: "192.168.171.130",
  port: 8888,
  chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
};

//react-redux connector
const mapStateToProps = state => {
  return {
    redux_network: state.network
  };
};

function mapDispatchToProps(dispatch) {
  return {
    updateNetwork: network => dispatch(updateNetwork(network))
  };
}

class Challengers {
  constructor(challenger, score, num_ticket) {
    this.challengers = challenger;
    this.score = score;
    this.num_ticket = num_ticket;
  }
}

class Queue {
  constructor(index, challenger) {
    this.indexs = index;
    this.challengers = challenger;
  }
}

class Stats_obj {
  constructor(level, challenger_table, queue_table, ticket_table) {
    //console.log(level);
    this.level = level;
    this.roundscore = 0;
    this.challengers = {};
    this.queue = {};
    this.ticket = {};

    var num_ticket;
    for (let i = 0; i < challenger_table.rows.length; i++) {
      num_ticket = 0;
      for (let j = 0; j < ticket_table.rows.length; j++) {
        if (
          challenger_table.rows[i].challenger ===
          ticket_table.rows[j].challenger
        ) {
          num_ticket = ticket_table.rows[j].num_ticket;
        }
      }
      this.challengers[i] = new Challengers(
        challenger_table.rows[i].challenger,
        challenger_table.rows[i].score,
        num_ticket
      );
    }
    //var queue_table = [];

    for (let i = 0; i < queue_table.rows.length; i++) {
      this.queue[i] = new Queue(
        queue_table.rows[i].index,
        queue_table.rows[i].challenger
      );
    }
  }
}

class Stats extends Component {
  constructor(props) {
    super(props);
    this.stats = {};
    this.game_list = [];
    this.first_scan = 1;
    this.state = {
      stats: {},
      game_list: [],
      errormessage: "",
      game_selected: "default",
      network_selected: "local"
    };
    this.rpc = {};
  }

  async componentDidMount() {
    this.mounted = true;
    this.rpc = this.props.redux_network.rpc;
    await this.fetch_game_list();
    //console.log("first game in the list is: ", this.state.game_list[0].value);
    this.timer = setInterval(() => {
      this.fetch_player_table();
    }, 1000);
  }

  componentWillUnmount() {
    console.log("unmounted");
    clearInterval(this.timer);
    this.timer = null; // here...
    this.mounted = false;
  }

  async fetch_player_table() {
    try {
      var resp = await this.props.redux_network.rpc.get_table_rows({
        json: true, // Get the response as json
        code: "blockcoined1", // Contract that we target
        scope: this.state.game_selected, // Account that owns the data
        table: "challengers", // Table name
        limit: 100
      }); // maximum number of rows that we want to get

      var resp2 = await this.props.redux_network.rpc.get_table_rows({
        json: true, // Get the response as json
        code: "blockcoined1", // Contract that we target
        scope: this.state.game_selected, // Account that owns the data
        table: "gamequeue", // Table name
        limit: 100
      }); // maximum number of rows that we want to get

      var resp3 = await this.rpc.get_table_rows({
        json: true, // Get the response as json
        code: "blockcoined1", // Contract that we target
        scope: this.state.game_selected, // Account that owns the data
        table: "tickettable", // Table name
        limit: 100
      }); // maximum number of rows that we want to get
    } catch (e) {
      console.log("\nCaught exception: " + e);
      if (e instanceof RpcError) console.log(JSON.stringify(e.json, null, 2));
    }

    let stats = new Stats_obj(1, resp, resp2, resp3);
    //this.setState({ stats: stats });
    let equal = _.isEqual(stats, this.state.stats);
    this.stats = stats;
    if (this.first_scan === 1 || !equal) {
      this.setState({ stats: stats });
      this.first_scan = 0;
    }
  }

  async fetch_game_list() {
    try {
      var resp = await this.rpc.get_table_rows({
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
    console.log(this.rpc);
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

  get_currentplayer() {
    try {
      //console.log(this.state.stats.queue[0].challengers);
      return this.state.stats.queue[0].challengers;
    } catch (e) {
      //console.log(e);
    }
  }

  get_default_game() {
    if (this.state.game_selected === "default") {
      //console.log('true');
      this.setState({ game_selected: this.state.game_list[0].value });
      return this.state.game_list[0].value;
    } else {
      return this.state.game_selected;
    }
  }

  render_state() {
    //console.log(this.state.stats.queue);
    try {
      if (
        typeof this.state.stats.challengers !== undefined &&
        typeof this.state.stats.queue !== undefined &&
        this.state.stats.challengers.length !== 0 &&
        this.state.stats.queue.length !== 0
      ) {
        //console.log("challenger is: ", this.state.stats.challengers)
        return (
          <div className="stats">
            <Dropdown
              placeholder="Select Network"
              fluid
              selection
              options={this.state.game_list}
              onClick={e => this.setNetwork(this.state.network_selected)}
              onChange={(event, { value }) => {
                this.setState({ game_selected: value });
              }}
            />

            <Dropdown
              placeholder="Select Game to Join"
              fluid
              selection
              options={this.state.game_list}
              onClick={e => this.fetch_game_list()}
              onChange={(event, { value }) => {
                this.setState({ game_selected: value });
              }}
            />
            <Header as="h2">
              Current Player is: {this.get_currentplayer()}
            </Header>
            <App
              game_selected={this.get_default_game()}
              queue={this.state.stats.queue}
            />

            <TablePagination
              challengers={this.state.stats.challengers}
              ticket={this.state.stats.ticket}
              key={this.state.stats.challengers.key}
            />
            <CookieConsent>
              This website uses cookies to enhance the user experience.
            </CookieConsent>
          </div>
        );
      } else {
        console.log("else");
      }
    } catch (e) {}
  }

  setNetwork(NetworkName) {
    switch (NetworkName) {
      case "mainnet":
        const rpc_m = new JsonRpc(endpoint_mainnet);
        var network_m = {
          rpc: rpc_m,
          endpoint: endpoint_mainnet,
          network: network_mainnet
        };
        this.props.updateNetwork(network_m);
      case "jungle":
        const rpc_j = new JsonRpc(endpoint_jungle);
        var network_j = {
          rpc: rpc_j,
          endpoint: endpoint_jungle,
          network: network_jungle
        };
        this.props.updateNetwork(network_j);
      case "local":
        const rpc_l = new JsonRpc(endpoint_local);
        var network_l = {
          rpc: rpc_l,
          endpoint: endpoint_local,
          network: network_local
        };
        this.props.updateNetwork(network_l);
      default:
    }
  }

  render() {
    return <Container className="stats_box">{this.render_state()}</Container>;
  }
}

const ReduxStats = connect(
  mapStateToProps,
  mapDispatchToProps
)(Stats);

function Home() {
  return <ReduxStats />;
}

function Fountain_func() {
  return <Fountain />;
}

function How() {
  return <Howto />;
}

function RouteEx() {
  return (
    <Router>
      <div>
        <Link to="/">BlockCoined | </Link>
        <Link to="/fountain">Token Fountain | </Link>
        <Link to="/howto">How to play </Link>
        <Route exact path="/" component={Home} />
        <Route exact path="/fountain" component={Fountain_func} />
        <Route exact path="/howto" component={How} />
      </div>
    </Router>
  );
}

export default RouteEx;
