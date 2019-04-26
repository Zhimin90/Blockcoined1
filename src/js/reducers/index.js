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

const endpoint_jungle = "https://jungle2.cryptolions.io:443";

const rpc = new JsonRpc(endpoint_jungle, { fetch });

const network_jungle = {
  blockchain: "eos",
  protocol: "https",
  host: "jungle2.cryptolions.io",
  port: 443,
  chainId: "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473"
};

const initialState = {
  grid: [],
  pose_toggle: 0,
  animation_ctrl: {},
  network: { rpc: rpc, endpoint: endpoint_jungle, network: network_jungle }
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
