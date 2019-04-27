import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Message } from "semantic-ui-react";
import { RpcError } from "eosjs";
import EOSIOClient from "./eosio-client";
import "./Stats.css";

//react-redux connector

const mapStateToProps = state => {
  return {
    redux_network: state.network
  };
};

class Airgrab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {},
      game_list: [],
      errormessage: "",
      game_selected: "default"
    };
    this.eosio = new EOSIOClient("blocointoken", {
      redux_network: this.props.redux_network
    });
  }

  async componentDidMount() {}

  componentWillUnmount() {
    //console.log("unmounted");
  }

  async grab() {
    const actionName = "signup";
    const actionData = {
      owner: this.eosio.account.name,
      quantity: "0.0000 BLC"
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
            this.grab();
          }}
        >
          Sign-up by this Button
        </Button>
      </div>
    );
  }
}

const Airgrab_wrap = connect(
  mapStateToProps,
  null
)(Airgrab);

export default Airgrab_wrap;
