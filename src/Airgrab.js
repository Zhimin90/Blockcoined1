import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Form, Divider, Button, Message } from "semantic-ui-react";
import { RpcError } from "eosjs";
import styled from "styled-components";
import EOSIOClient from "./eosio-client";
import "./Stats.css";

//react-redux connector

const mapStateToProps = state => {
  return {
    redux_network: state.network
  };
};

const DivStyled = styled.h1`
  font-size: 3em;
  text-align: center;
  color: red;
`;

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
    if (typeof this.eosio.account !== "undefined") {
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
    } else {
      this.setState({ errormessage: "Scatter is not connected!!" });
    }
  }

  getError() {
    if (this.state.errormessage !== "") {
      return <Message error content={this.state.errormessage} />;
    }
  }

  render() {
    return (
      <div>
        <div>
          <DivStyled />
          <Form>
            <Container textAlign="left">
              <b>Blockcoined Token Airgrab</b>
              <Divider />
              <p>
                By signing-up to this BLC token airgrab, your account will
                allocate a small amount of RAM in order to retain BLC token
                information. Snapshot of player who has claimed BLC token will
                be take once 1000 players has participated in the claim or
                airgrab sign-up process. 2 months after snapshot has been taken,
                BLC token will drop to players with ratio of 50 BLC token to 1
                EOS token. Before airdrop execute, players can try Blockcoined
                by using Token Fountain from link above. Each player will have
                limited access of 50 BLC tokens per day. By claiming BLC token
                thru Token Fountain, player will automatic recieve airdrop.
              </p>
              <Divider />
              <Message
                content={`Claim Status:
              Snapshot has not yet been taken. Additional player sign-up needed!`}
              />
              <Divider />
              {this.getError()}
              <Button
                color="red"
                onClick={e => {
                  this.grab();
                }}
              >
                Sign-up Airgrab
              </Button>
            </Container>
          </Form>
        </div>
      </div>
    );
  }
}

const Airgrab_wrap = connect(
  mapStateToProps,
  null
)(Airgrab);

export default Airgrab_wrap;
