import { ComponentsStatus } from '..'
import { DISABLE_NO_INIT_COLOR, DISABLE_INIT_COLOR, DATA_PORT_COLOR, MODEL_PORT_COLOR } from './config'
import { portType } from './portConfig'

let NODE_ID = 0

export default class Port {
  constructor (config) {
    // 当前组件内容的
    this.id = NODE_ID
    this.name = config.name
    this.type = config.type
    this.tip = config.tip
    this.multiple = !!config.multiple
    this.panel = null // 表示当前的figure对象

    NODE_ID++
  }

  // 获取port当前状态下的颜色
  getColor (disable, status) {
    return disable
      ? status === ComponentsStatus.unrun
        ? DISABLE_NO_INIT_COLOR
        : DISABLE_INIT_COLOR
      : this.type === portType.DataInput || this.type === portType.DataOutput
        ? DATA_PORT_COLOR
        : MODEL_PORT_COLOR
  }
  getImage () {
    if (this.multiple) {
      if (this.type.toLowerCase().match('data')) {
        return icons.multData
      } else {
        return icons.multModel
      }
    }
    return null
  }

  // 组件的可操作事件
  /**
   * 从当前端口连接出去
   * @param {Object} eve 事件对象
   * @param {[Number, Number]} position 位置对象
   */
  linking (eve, position) {
    if ()
  }

  getParameter () {
    const _t = this
    const parameter = {
      name: _t.name,
      color: function () {
        _t.getColor(this.disable, this.status)
      },
      image () {
        _t.getImage()
      },
      tip: _t.tip
    }
  }
}
