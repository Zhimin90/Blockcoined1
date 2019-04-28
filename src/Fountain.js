import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Dropdown, Form, Button, Message } from "semantic-ui-react";
import { JsonRpc, RpcError } from "eosjs";
import { updateNetwork } from "./js/actions/index";
import styled from "styled-components";
import EOSIOClient from "./eosio-client";
import "./Stats.css";

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

const DivStyled = styled.h1`
  font-size: 3em;
  text-align: center;
  color: red;
`;

const endpoint_mainnet = "https://eos.greymass.com:443";
const network_mainnet = {
  blockchain: "eos",
  protocol: "https",
  host: "eos.greymass.com",
  port: 443,
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
};

const endpoint_jungle = "https://jungle2.cryptolions.io:443";
const network_jungle = {
  blockchain: "eos",
  protocol: "https",
  host: "jungle2.cryptolions.io",
  port: 443,
  chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473"
};

const endpoint_local = "http://192.168.0.133:8888";
const network_local = {
  blockchain: "eos",
  protocol: "http",
  host: "192.168.0.133",
  port: 8888,
  chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
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

  async componentDidMount() {}

  componentWillUnmount() {
    //console.log("unmounted");
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.eosio.removeIdentity();
      this.eosio = new EOSIOClient("blocfountain", {
        redux_network: this.props.redux_network
      });
    }
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

  setNetwork(NetworkName) {
    console.log("network selected: ", NetworkName);
    switch (NetworkName) {
      case "mainnet":
        const rpc_m = new JsonRpc(endpoint_mainnet);
        var network_m = {
          rpc: rpc_m,
          endpoint: endpoint_mainnet,
          network: network_mainnet
        };
        this.props.updateNetwork(network_m);
        break;
      case "jungle":
        const rpc_j = new JsonRpc(endpoint_jungle);
        var network_j = {
          rpc: rpc_j,
          endpoint: endpoint_jungle,
          network: network_jungle
        };
        this.props.updateNetwork(network_j);
        break;
      case "local":
        const rpc_l = new JsonRpc(endpoint_local);
        var network_l = {
          rpc: rpc_l,
          endpoint: endpoint_local,
          network: network_local
        };
        this.props.updateNetwork(network_l);
        break;
      default:
    }
  }

  render() {
    return (
      <div>
        <div>
          <DivStyled>
            <Form>
              <Container textAlign="left">
                <Dropdown
                  placeholder="Select Network"
                  fluid
                  selection
                  options={[
                    {
                      key: 0,
                      text: "Mainnet",
                      value: "mainnet",
                      image: { avatar: false, src: "" }
                    },
                    {
                      key: 1,
                      text: "Jungle",
                      value: "jungle",
                      image: { avatar: false, src: "" }
                    },
                    {
                      key: 2,
                      text: "Local",
                      value: "local",
                      image: { avatar: false, src: "" }
                    }
                  ]}
                  onClick={e => {}}
                  onChange={(event, { value }) => {
                    this.setNetwork(value);
                    this.setState({ network_selected: value });
                  }}
                />

                <Message content={this.state.errormessage} />

                <Button
                  onClick={e => {
                    this.refill();
                  }}
                >
                  Fill token from blocfountain
                </Button>
                <Button
                  onClick={e => {
                    this.eosio.removeIdentity();
                  }}
                >
                  Logout
                </Button>

                <Button
                  onClick={e => {
                    this.eosio.connectIdentity();
                  }}
                >
                  Login
                </Button>
              </Container>
            </Form>
          </DivStyled>
        </div>
      </div>
    );
  }
}

const Fountain_wrap = connect(
  mapStateToProps,
  mapDispatchToProps
)(Fountain);

export default Fountain_wrap;
