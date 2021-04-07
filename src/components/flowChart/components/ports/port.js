import { portType } from '.'
import { ComponentsStatus } from '..'
import PortHint from './portHint'
import { pushLink, LinkingSuccess, modifiedInto, getCurrentLink, getMainCanvas } from '../../canvas'
import { compareToPos } from '../../utils'
import { icons } from '../../loadImage'

const DATA_PORT_COLOR = '#E6B258'
const MODEL_PORT_COLOR = '#00cbff'
const DISABLE_INIT_COLOR = '#7F7D8E'
const DISABLE_NO_INIT_COLOR = '#7F7D8E'

class Port {
  constructor (name, type, tip, multiple, role, container) {
    this.name = name
    this.type = type
    this.tip = tip
    this.multiple = multiple
    this.role = role
    this.container = container
    this.hasConnect = false
  }

  getParameter () {
    const _t = this
    const parameter = {
      name: this.name,
      color: function () {
        return this.disable
          ? this.status === ComponentsStatus.unrun
            ? DISABLE_NO_INIT_COLOR
            : DISABLE_INIT_COLOR
          : _t.type === portType.DataInput || _t.type === portType.DataOutput
            ? DATA_PORT_COLOR
            : MODEL_PORT_COLOR
      },
      image () {
        if (_t.multiple) {
          if (_t.type.toLowerCase().match('data')) {
            return icons.multData
          } else {
            return icons.multModel
          }
        }
        return null
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
      tip: _t.tip
    }
    return parameter
  }

  getEvents () {
    const _t = this
    const events = {
      linkFrom: function (eve, checkPos, startpos, pos2) {
        if (_t.container.currentPort) return void 0
        if (!_t.multiple && _t.hasConnect) {
          _t.container.currentPort = false
        }
        if (this.isPointInFigure(checkPos)) {
          _t.container.currentPort = _t.name
          pushLink(
            compareToPos(this.center, _t.container.panelManager.dom, getMainCanvas().canvas),
            pos2, _t, _t.container.flowPanel)
          _t.container.checkHint(eve, _t.type)
        } else {
          _t.container.currentPort = false
        }
      },
      linkIntoPort: function (eve, name) {
        if (name !== this.name) { return void 0 }
        // 设置当前的内容到连接线段。
        getCurrentLink().changeEnd(
          compareToPos(this.center, _t.container.panelManager.dom, getMainCanvas().canvas)
        )
        modifiedInto(_t)
        LinkingSuccess()
        _t.container.hintFinished()
      }
    }
    return events
  }

  toSetting () {
    return {
      data: this.getParameter(),
      path: this.multiple ? 'icon' : 'rect',
      events: this.getEvents(),
      children: [new PortHint(this).toSetting()]
    }
  }
}

export default Port