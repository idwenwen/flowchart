import config from '../config'

class Curve {
  toParameter () {
    return {
      // 开始点
      startPoint () {
        return this.startPoint
      },
      // 结束点
      endPoint () {
        return this.endPoint
      },
      color () {
        if (this.choosed) {
          return config.LINE_BRIGHT_STYLE
        } else {
          return config.LINE_STYLE
        }
      },
      lineWidth () {
        let origin = config.maxLineWidth
        if (this.choosed) {
          return origin * config.lineBright
        } else {
          return origin
        }
      },
      arrow: config.withArrow,
      dash: true // 当前线为虚线
    }
  }

  toEvents () {
    return {
      toSolid: {
        // 修改当前特性为实线
        variation: () => { this.dash = false },
        time: 0
      },
      toDash: {
        variation: () => { this.dash = true },
        time: 0
      },
      showArrow: {
        variation: () => { this.arrow = true },
        time: 0
      },
      hideArrow: {
        variation: () => { this.arrow = false },
        time: 0
      }
    }
  }

  toSetting () {
    return {
      data: this.toParameter,
      path: 'curve',
      events: this.toEvents()
    }
  }
}

export default Curve
