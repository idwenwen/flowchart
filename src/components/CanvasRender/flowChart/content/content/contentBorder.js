import { ComponentsStatus } from '..'
import { toChain } from '../../../core/controller/action'
import Action from '../../../core/controller/action/action'
import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import { CHOOSE, COULDNOTRUN, ERROR, SUCCESS, UNRUN } from './config'

// 计算当前border组件的颜色
function borderStyle (choosed, status, disable) {
  if (choosed) {
    return CHOOSE
  } else if (disable && status !== ComponentsStatus.unrun) {
    return UNRUN
  } else if (disable && status === ComponentsStatus.unrun) {
    return COULDNOTRUN
  } else if (status === ComponentsStatus.success) {
    return SUCCESS
  } else if (status === ComponentsStatus.running) {
    return SUCCESS
  } else if (status === ComponentsStatus.fail) {
    return ERROR
  } else if (status === ComponentsStatus.unrun) {
    return UNRUN
  }
}

export default class ContentBorder extends Tree {
  constructor () {
    super()
    this.figure = null
    this.toRender()
  }

  changeStatus () {
    // 颜色渐变改变当前展示样式。
    let originColor
    return toChain({
      list: [
        {
          variation (progress, status) {
            if (!originColor) originColor = this.color
            const target = borderStyle(this.choose, status, this.disable)
            this.color = Action.get('color')(progress, originColor, target)
          },
          time: 500
        },
        {
          variation () {
            originColor = null
          },
          time: 0
        }
      ]
    })
  }

  toRender () {
    this.figure = toFigure({
      data: {
        width () {
          return this.width
        },
        height () {
          return this.height
        },
        radius () {
          return this.radius
        },
        color () {
          return borderStyle(this.choose, this.status, this.disable)
        },
        center () {
          return this.center
        },
        stroke: true
      },
      path: 'rect',
      animate: {
        changeStatus: this.changeStatus()
      }
    })
    return this.figure
  }
}
