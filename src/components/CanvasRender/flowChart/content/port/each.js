import { ComponentsStatus } from '..'
import { DISABLE_NO_INIT_COLOR, DISABLE_INIT_COLOR, DATA_PORT_COLOR, MODEL_PORT_COLOR } from './config'
import { portType } from './portConfig'
import Tree from '../../../tools/tree'
import { toFigure } from '../../../core/figure'
import { compareToPos } from '../../utils'
import LinkHint from '../../subContent/hint'
import { isNil } from 'lodash'

function portColor (disable, status, type) {
  return disable
    ? status === ComponentsStatus.unrun
      ? DISABLE_NO_INIT_COLOR
      : DISABLE_INIT_COLOR
    : type === portType.DataInput || type === portType.DataOutput
      ? DATA_PORT_COLOR
      : MODEL_PORT_COLOR
}

function getImage (global, multiple, type) {
  if (multiple) {
    if (type.toLowerCase().match('data')) {
      return global.globalIcons.getIcon('multData')
    } else {
      return global.globalIcons.getIcon('multModel')
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
  constructor ({ name, type, tip, multiple }, global) {
    super()
    this.global = global
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

  linkFrom (_pos) {
    // 表示当前对象不是outer内容。
    if (!this.global.linking.checkWithFrom(this)) {
      if (!this.global.linking.hasFrom() && !this.hasConnect) {
        // 表示当前内容是否已经可以确定。
        // 计算当前内容的位置是否符合预期。如果是符合预期的则添加相关的连接参数。
        const final = compareToPos(
          this.figure.data.cache.center,
          this.root().panel.getOrigin(),
          this.global.globalPanel.getOrigin()
        )
        return this.global.createLinking(final, final, this) !== false
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
        if (!this.hasConnect && !this.root().isOld()) {
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
        return getImage(_t.global, _t.multiple, _t.type)
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
      path: this.multiple && !this.type.match(/output/i) ? 'icon' : 'rect',
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
    const width = this.figure.data.cache.width
    const height = this.figure.data.cache.height
    const center = this.figure.data.cache.center
    // let checkPos = position
    if (
      Math.abs(position[0] - center[0]) <= width * 1.5 &&
      Math.abs(position[1] - center[1]) <= height * 2
    ) {
      // checkPos = center
      return this
    }
    // if (this.figure.isPointInFigure(checkPos)) {
    //   return this
    // }
    return false
  }

  // 获取相关的位置信息内容
  currentPosition (target) {
    return !target
      ? this.figure.data.cache.center
      : compareToPos(
        this.figure.data.cache.center,
        this.root().panel.getOrigin(),
        target
      )
  }

  // 关闭当前的连接。
  closeConnect (linking) {
    this.hasConnect = false // 设置当前的关联情况为false
    if (this.type.match(/output/i)) {
      this.root().removeLinkOut(linking)
    } else if (this.type.match(/input/i)) {
      this.root().removeLinkInto(linking)
    }
  }

  // 获取当前port信息的排位
  getWhichPort () {
    const index = this.name.split('|')[1].split('_')[0]
    return parseInt(index)
  }
  // 核对当前节点是否符合节点情况。
  checkWhichPort (i, type, output) {
    const infos = this.name.split('|')
    if (!isNil(i)) {
      const detail = infos[1].split('_')
      if (parseInt(detail[0]) === i) {
        if (type && infos[0] !== type) {
          return false
        }
        if (output && !detail[1].match(output ? /output/i : /input/i)) {
          return false
        }
        return this
      }
    }
  }
}
