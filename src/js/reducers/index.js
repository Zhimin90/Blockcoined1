// src/js/reducers/index.js
import {
  RENDER_GRID,
  POSE_TOGGLE,
  ANIMATION,
  UPDATE_GRID
} from "../constants/action-types";

const initialState = {
  grid: [],
  pose_toggle: 0,
  animation_ctrl: {}
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
  return state;
}

export default rootReducer;
