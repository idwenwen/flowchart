import Container from './container'
import TextMeasure from './text'

// 当前实例主要管理component的展示主体
class Content {
  constructor (container) {
    this.container = container
  }
  toParameter () {
    return {
      text () {
        return this.name // 获取组件名称
      },
      width () {
        return this.width
      },
      height () {
        return this.height
      },
      // 当前组件的状态，以便方便判定颜色与状态。
      status () {
        return this.status
      },
      choosed () {
        return this.choosed
      }, // 当前组件是否被选中
      disable () {
        return this.disable
      },
      center () {
        return this.center
      },
      radius () {
        return this.radius
      }
    }
  }

  toEvent () {
    return {
    }
  }

  toSetting () {
    return {
      parameter: this.toParameter(),
      events: this.toEvent(),
      children: [new Container().toSetting(), new TextMeasure().toSetting()]
    }
  }
}

export default Content
