class Anima_slice {
  constructor(anima_slice) {
    this.index = anima_slice.index;
    this.level = anima_slice.level;
    this.pos_num = anima_slice.pos_num;
    this.orientation = anima_slice.orientation;
    this.anima_array = [];

    anima_slice.view.map((view, i) => {
      this.anima_array[i] = {
        view: anima_slice.view[i],
        empty_cells: anima_slice.empty[i],
        board_index: anima_slice.board_index[i],
      };
    });
  }
}

class Animation {
  constructor(anima_table, callback) {
    this.slice = [];
    for (let i = 0; i < anima_table.rows.length; i++) {
      this.slice[i] = new Anima_slice(anima_table.rows[i]);
    }
    //call back for done
    callback.call(this);
  }

  async merge(board, board_index, slice_num) {
    //let size = Object.keys(board).length;

    let size = this.slice[slice_num].anima_array.length;

    console.log('size', size);
    //board.map( (color) => console.log(color));
    /*Object.keys(board).map( (key, index) =>
    board[key].color
    );*/
    //await console.log("board is ", board[0].color)
    //await console.log("slice is ", this.slice[0].orientation)
    //await console.log("slice is ", this.slice[0].empty_cells[0])
    console.log('this slice in merge is: ', this.slice);
    console.log('slice number in merge is', slice_num);
    if (typeof this.slice[0] !== 'undefined') {
      if (typeof this.slice[0].anima_array !== 'undefined') {
        for (let i = 0; i < this.slice[slice_num].anima_array.length; i++) {
          /*console.log(
            '??????????????????????????????',
            this.slice[slice_num].anima_array[i],
          );*/
          if (!this.slice[slice_num].orientation) {
            if (this.slice[slice_num].anima_array[i].empty_cells === 64) {
              //console.log('different at ', i);
              // console.log((this.slice[slice_num].pos_num - 1) * size) + i;
              /*console.log(
                'board index ',
                board_index[(this.slice[slice_num].pos_num - 1) * size + i],
              );
              console.log(
                'animation slice board index ',
                this.slice[slice_num].anima_array[i].board_index,
              );*/
              board_index[
                (this.slice[slice_num].pos_num - 1) * size + i
              ] = this.slice[slice_num].anima_array[i].board_index;
              //board[(this.slice[slice_num].pos_num - 1) * size + i].color = -1;
              //board_index[(this.slice[slice_num].pos_num - 1) * size + i]
            }
          } else {
            if (this.slice[slice_num].anima_array[i].empty_cells === 64) {
              //board[this.slice[slice_num].pos_num - 1 + i * size].color = -1;
              /* console.log('different at ', i);
              console.log(
                'board index ',
                board_index[this.slice[slice_num].pos_num - 1 + i * size],
              );
              console.log(
                'animation slice board index ',
                this.slice[slice_num].anima_array[i].board_index,
              );*/
              board_index[
                this.slice[slice_num].pos_num - 1 + i * size
              ] = this.slice[slice_num].anima_array[i].board_index;
            }
          }
        }
      }
    }

    return { board };
  }
}

export { Animation };
