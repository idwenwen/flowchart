export default class Moving {
  constructor () {
    this.moving = null
    this.currentPoint = null
  }
  setMove (moving) {
    this.moving = moving
    this.currentPosition = this.moving.getPositin()
  }
  getMove () {
    return this.moving
  }
  setPosition (position) {
    const x = position[0] - this.currentPoint[0]
    const y = position[1] - this.currentPotin[1]
    this.moving.changePositin(x, y)
  }
}