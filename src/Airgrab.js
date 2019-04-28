import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Container,
  Dropdown,
  Form,
  Divider,
  Button,
  Message
} from "semantic-ui-react";
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
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.eosio.removeIdentity();
      this.eosio = new EOSIOClient("blocointoken", {
        redux_network: this.props.redux_network
      });
    }
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
              <Divider />
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
        </div>
      </div>
    );
  }
}

const Airgrab_wrap = connect(
  mapStateToProps,
  mapDispatchToProps
)(Airgrab);

export default Airgrab_wrap;
