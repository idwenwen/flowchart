import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import config from '../config'

function toCurvesPoints (point1, point2) {
  if (point1[0] === point2[0] || point1[1] === point2[1]) {
    return [point1, point2]
  } else {
    const distanceY = point2[1] - point1[1]
    const mid1 = [point1[0], point1[1] + distanceY * 0.2]
    const mid2 = [point2[0], point2[1] - distanceY * 0.2]
    return [point1, mid1, mid2, point2]
  }
}

class Curve extends Tree {
  constructor () {
    super()
    this.isDash = true
    this.figure = null
    this.toRender()
  }

  getParameter () {
    const _t = this
    return {
      // 开始点
      points () {
        return toCurvesPoints([
          this.startPoint[0] - this.leftTop[0],
          this.startPoint[1] - this.leftTop[1]
        ], [
          this.endPoint[0] - this.leftTop[0],
          this.endPoint[1] - this.leftTop[1]
        ])
      },
      color () {
        if (this.choosed) {
          return config.LINE_BRIGHT_STYLE
        } else {
          return config.LINE_STYLE
        }
      },
      lineWidth () {
        let origin = config.minLineWidth
        if (this.choosed) {
          return origin * config.lineBright
        } else {
          return origin
        }
      },
      arrow: config.withArrow,
      dash () {
        return _t.isDash
      } // 当前线为虚线
    }
  }

  getEvents () {
    const _t = this
    return {
      toSolid () {
        _t.isDash = false
        this.dash = false
      },
      toDash () { this.dash = true },
      showArrow () { this.arrow = true },
      hideArrow () { this.arrow = false }
    }
  }

  toRender () {
    this.figure = toFigure({
      data: this.getParameter(),
      path: 'curve',
      events: this.getEvents()
    })
    return this.figure
  }
}

export default Curve
