import { toRGBA } from '../../../tools/color'
import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import { DATA_PORT_COLOR, MODEL_PORT_COLOR } from './config'

export default class HintContent extends Tree {
  constructor (main) {
    super()
    this.main = main
    this.figure = null
    this.toRender()
  }

  getParameter () {
    const color = ((type) => {
      return toRGBA(type.match(/data/i) ? DATA_PORT_COLOR : MODEL_PORT_COLOR)
    })(this.main.type)
    return {
      radius () {
        const small = this.width < this.height ? this.width : this.height
        return small / 2
      },
      center () {
        return this.center
      },
      color: color,
      stroke: true
    }
  }

  toRender () {
    this.figure = toFigure({
      data: this.getParameter(),
      path: 'circle'
    })
    return this.figure
  }

  clearUp () {
    this.main = null
    this.figure = null
  }

  release () {
    this.clearUp()
  }
}
