export function funcMiddleware({ getState, dispatch }) {
  return function(next) {
    return function(action) {
      // do your stuff
      //console.log('middleware applied');
      //console.log('action: ', action);

      return next(action);
    };
  };
}

/*function animation_sequencer(newAnimaGrid) {
  console.log("animation: ", this.animation);
  this.animation.merge(
    this.prev_nodes,
    this.prev_board_index,
    this.current_slice
  );
  console.log(
    "before this.props.redux_pose_toggle ",
    this.props.redux_pose_toggle
  );
  this.props.renderGrid(newAnimaGrid);
  this.props.poseToggle(this.props.redux_pose_toggle ? false : true);
  this.posing = true;
  console.log("slice size: ", this.animation.slice.length);
  if (this.current_slice < this.animation.slice.length) {
    this.current_slice = this.current_slice + 1;
    //console.log('newAnimaGrid: ', newAnimaGrid);
  } else {
    console.log("else called  ...................................");
    this.animating_seq = false;
    this.current_slice = 0;
  }
  //this.forceUpdate();
  console.log("current slice is: ", this.current_slice);
}*/
