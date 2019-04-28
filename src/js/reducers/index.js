// src/js/reducers/index.js
import {
  RENDER_GRID,
  POSE_TOGGLE,
  ANIMATION,
  UPDATE_GRID,
  NETWORK_POINTER
} from "../constants/action-types";
import { JsonRpc } from "eosjs";

const fetch = require("node-fetch");

const endpoint_mainnet = "https://eos.greymass.com:443";
const network_mainnet = {
  blockchain: "eos",
  protocol: "https",
  host: "eos.greymass.com",
  port: 443,
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
};

const rpc = new JsonRpc(endpoint_mainnet, { fetch });

const initialState = {
  grid: [],
  pose_toggle: 0,
  animation_ctrl: {},
  network: { rpc: rpc, endpoint: endpoint_mainnet, network: network_mainnet }
};

function rootReducer(state = initialState, action) {
  if (action.type === RENDER_GRID) {
    return Object.assign({}, state, {
      grid: action.payload
    });
  }

  if (action.type === POSE_TOGGLE) {
    return Object.assign({}, state, {
      pose_toggle: action.payload
    });
  }

  if (action.type === ANIMATION) {
    return Object.assign({}, state, {
      animation_ctrl: action.payload
    });
  }

  if (action.type === UPDATE_GRID) {
    return Object.assign({}, state, {
      grid: action.payload,
      pose_toggle: action.payload,
      animation_ctrl: action.payload
    });
  }

  if (action.type === NETWORK_POINTER) {
    return Object.assign({}, state, {
      network: action.payload
    });
  }
  return state;
}

export default rootReducer;
