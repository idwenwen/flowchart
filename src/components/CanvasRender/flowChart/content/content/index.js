import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import ContentBody from './contentBody'
import ContentBorder from './contentBorder'
import ContentText from './contentText'

export default class Content extends Tree {
  constructor () {
    super()
    this.figure = null
    this.toRender()
  }

  getParameter () {
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
      choose () {
        return this.choose
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

  getChildsFigure () {
    const final = []
    for (const val of this.getChildren()) {
      final.push(val.figure)
    }
    return final
  }

  toRender () {
    this.setChildren([
      new ContentBody(),
      new ContentBorder(),
      new ContentText()
    ])
    this.figure = toFigure({
      data: this.getParameter(),
      children: this.getChildsFigure()
    })
    return this.figure
  }
}
