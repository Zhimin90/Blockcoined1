import {
  RENDER_GRID,
  POSE_TOGGLE,
  ANIMATION,
  UPDATE_GRID,
  NETWORK_POINTER
} from "../constants/action-types";

export function renderGrid(payload) {
  return { type: RENDER_GRID, payload };
}

export function poseToggle(payload) {
  return { type: POSE_TOGGLE, payload };
}

export function setAnimationCtrl(payload) {
  return { type: ANIMATION, payload };
}

export function updateGrid(payload) {
  return { type: UPDATE_GRID, payload };
}

export function updateNetwork(payload) {
  return { type: NETWORK_POINTER, payload };
}
