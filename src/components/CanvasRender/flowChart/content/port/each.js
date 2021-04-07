import { ComponentsStatus } from '..'
import GLOBAL from '../../../tools/env'
import { DISABLE_NO_INIT_COLOR, DISABLE_INIT_COLOR, DATA_PORT_COLOR, MODEL_PORT_COLOR } from './config'
import { portType } from './portConfig'
import Tree from '../../../tools/tree'
import { toFigure } from '../../../core/figure'

function portColor (disable, status, type) {
  return disable
    ? status === ComponentsStatus.unrun
      ? DISABLE_NO_INIT_COLOR
      : DISABLE_INIT_COLOR
    : type === portType.DataInput || type === portType.DataOutput
      ? DATA_PORT_COLOR
      : MODEL_PORT_COLOR
}

function getImage (multiple, type) {
  if (multiple) {
    if (type.toLowerCase().match('data')) {
      return icons.multData
    } else {
      return icons.multModel
    }
  }
  return null
}

function getPosition (compWidth, compHeight, type, len, num) {
  const vertical = (compHeight / 2) * (type.match(/input/i) ? -1 : 1)
  const piece = (compWidth) / len
  const horizen = -(len / 2 - num - 1) * piece
  return [this.center[0] + horizen, this.center[1] + vertical]
}

export default class Port extends Tree {
  constructor ({name, type, tip, multiple}) {
    super()
    this.name = name
    this.type = type
    this.tip = tip
    this.multiple = multiple

    this.num = 0 // 当前port内容属于相关类型之中的第几项
    this.len = 0 // 相同位置port内容的个数
    this.figure = null // 当前对象针对的实例内容。
    this.toRender()
  }

  linking (figure, point) {
    // 表示当前对象不是outer内容。
    if (GLOBAL.linking.checkWithFrom(this)) {
      if (GLOBAL.linking.hasFrom()) { // 表示当前内容是否已经可以确定。
        // 计算当前内容的位置是否符合预期。如果是符合预期的则添加相关的连接参数。
      }
    }
  }

  // 为当前port添加Hint内容。
  linkingHint (figure, type) {

  }

  getParameter () {
    const _t = this
    return {
      name: this.name,
      color () {
        portColor(this.disable, this.status, _t.type)
      },
      image () {
        return getImage(_t.multiple, _t.type)
      },
      radius () {
        return this.radius
      },
      width () {
        return this.width
      },
      height () {
        return this.height
      },
      center () {
        return getPosition(this.actualWidth, this.actualHeight, _t.type, _t.len, _t.num)
      },
      tip: _t.tip
    }
  }

  toRender () {
    const _t = this
    this.figure = toFigure({
      data: this.getParameter(),
      path: this.multiple ? 'icon' : 'rect',
      events: {
        linking (eve, position) {
          _t.linking(this, position)
        },
        linkingHint (eve, type) {
          _t.linkingHint(this, type)
        }
      }
    })
    return this.figure
  }

  inPort (position) {
    if (this.figure.isPointInFigure(position)) {
      return this
    }
    return false
  }

  currentPosition () {
    return this.figure.center
  }
}
