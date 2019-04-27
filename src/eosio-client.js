import React from "react";
import { Api, JsonRpc } from "eosjs";
import ScatterJS from "scatterjs-core";
import ScatterEOS from "scatterjs-plugin-eosjs2";
//import { defaultCipherList } from "constants";
//const rpc = new JsonRpc('http://145.239.133.201:8888', { fetch });
//const endpoint = 'http://192.168.80.131:8888';

class EOSIOClient extends React.Component {
  constructor(contractAccount, { redux_network }) {
    super(contractAccount);
    this.contractAccount = contractAccount;
    this.redux_network = redux_network;
    ScatterJS.plugins(new ScatterEOS());

    try {
      ScatterJS.scatter.connect(this.contractAccount).then(connected => {
        if (!connected) return console.log("Issue Connecting");
        const scatter = ScatterJS.scatter;
        const requiredFields = {
          accounts: [this.redux_network.network] // We defined this above
        };
        scatter.getIdentity(requiredFields).then(() => {
          this.account = scatter.identity.accounts.find(
            x => x.blockchain === "eos"
          );
          const rpc = new JsonRpc(this.redux_network.endpoint);
          this.eos = scatter.eos(this.redux_network.network, Api, {
            rpc
          });
        });
        window.ScatterJS = null; // Don't forget to do this!
      });
    } catch (error) {
      console.log(error);
    }

    console.log("Connected to: ", contractAccount);
  } // Close the constructor function

  transaction = (action, data) => {
    return this.eos.transact(
      {
        actions: [
          {
            account: this.contractAccount,
            name: action,
            authorization: [
              {
                actor: this.account.name,
                permission: this.account.authority
              }
            ],
            data: {
              ...data
            }
          }
        ]
      },
      {
        blocksBehind: 3,
        expireSeconds: 30
      }
    );
  };

  tokenTransfer = data => {
    return this.eos.transact(
      {
        actions: [
          {
            account: "blocointoken",
            name: "transfer",
            authorization: [
              {
                actor: this.account.name,
                permission: this.account.authority
              }
            ],
            data: {
              from: this.account.name,
              to: data.to,
              quantity: data.quantity,
              memo: data.memo
            }
          }
        ]
      },
      {
        blocksBehind: 3,
        expireSeconds: 30
      }
    );
  };
}

export default EOSIOClient;
