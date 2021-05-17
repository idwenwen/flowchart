export default class Moving {
  constructor () {
    this.moving = null
  }
  setMove (moving) {
    // if (this.moving) {
    //   this.moving.figure.dispatchEvents('originLevel')
    // }
    this.moving = moving
    // if (this.moving) {
    // this.moving.figure.dispatchEvents('toppest')
    // }
  }
  getMove () {
    return this.moving
  }
}
