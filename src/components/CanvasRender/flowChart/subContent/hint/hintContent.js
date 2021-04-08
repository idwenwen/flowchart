import { toRGBA } from '../../../../diagram/tools/extension/color'
import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import { DATA_PORT_COLOR, MODEL_PORT_COLOR } from './config'

export default class HintContent extends Tree {
  constructor () {
    super()
    this.figure = null
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
}