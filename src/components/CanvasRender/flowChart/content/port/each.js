import { ComponentsStatus } from '..'
import { DISABLE_NO_INIT_COLOR, DISABLE_INIT_COLOR, DATA_PORT_COLOR, MODEL_PORT_COLOR } from './config'
import { portType } from './portConfig'
import Tree from '../../../tools/tree'
import { toFigure } from '../../../core/figure'
import { compareToPos } from '../../utils'
import LinkHint from '../../subContent/hint'
import GLOBAL from '../../env/global'

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
      return GLOBAL.getIcons('multData')
    } else {
      return GLOBAL.getIcons('multModel')
    }
  }
  return null
}

function getPosition (compWidth, compHeight, center, type, len, num) {
  const vertical = (compHeight / 2) * (type.match(/input/i) ? -1 : 1)
  const piece = (compWidth) / (len + 1)
  const horizen = -((len + 1) / 2 - num - 1) * piece
  return [center[0] + horizen, center[1] + vertical]
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
    this.hasConnect = false

    this.figure = null // 当前对象针对的实例内容。
    this.toRender()
  }

  linkFrom (pos) {
    // 表示当前对象不是outer内容。
    if (!GLOBAL.linking.checkWithFrom(this)) {
      if (!GLOBAL.linking.hasFrom() && !this.hasConnect) {
        // 表示当前内容是否已经可以确定。
        // 计算当前内容的位置是否符合预期。如果是符合预期的则添加相关的连接参数。
        const final = compareToPos(
          pos,
          this.root().panel.getOrigin(),
          GLOBAL.globalPanel.getOrigin()
        )
        GLOBAL.createLinking(final, final, this)
        return true
      }
    }
    return false
  }

  linkOut (linking) {
    if (!this.multiple) {
      this.hasConnect = true
    }
    this.root().addLinkOut(linking)
  }
  linkInto (linking) {
    if (!this.multiple) {
      this.hasConnect = true
    }
    this.root().addLinkInto(linking)
  }

  // 为当前port添加Hint内容。
  linkHint (type) {
    // 当前位置覆盖一个subContent内容。
    // 判定当前的内容是有关联关系
    if ((this.type.match(/input/i) && type.match(/output/i)) ||
      (this.type.match(/output/i) && type.match(/input/i))) {
      if ((this.type.match(/data/i) && type.match(/data/i)) ||
        (this.type.match(/model/i) && type.match(/model/i))) {
        if (!this.hasConnect) {
          const sub = new LinkHint(this)
          this.root().addSub(sub.id, sub) // 添加当前的sub内容
        }
      }
    }
  }

  getParameter () {
    const _t = this
    return {
      name: this.name,
      color () {
        return portColor(this.disable, this.status, _t.type)
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
        return getPosition(this.actualWidth, this.actualHeight, this.center, _t.type, _t.len, _t.num)
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

  currentPosition (target) {
    return !target
      ? this.figure.data.cache.center
      : compareToPos(
        this.figure.data.cache.center,
        this.root().panel.getOrigin(),
        target
      )
  }
}
