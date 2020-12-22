import { portType } from '.'
import { ComponentsStatus } from '..'
import PortHint from './portHint'
import { pushLink, LinkingSuccess, modifiedInto, getCurrentLink } from '../../canvas'

const DATA_PORT_COLOR = '#E6B258'
const MODEL_PORT_COLOR = '#00cbff'
const DISABLE_INIT_COLOR = '#7F7D8E'
const DISABLE_NO_INIT_COLOR = '#7F7D8E'

class Port {
  // type: portType; // 当前接口的类型
  // name: string; // 当前端口的名称
  // tip: string; // 当前标识
  // multiple: boolean; // 是否是多入口

  // disable: boolean; // 是否为不运行组件的端口
  // status: ComponentsStatus;
  // role: Role; // 角色信息

  constructor (name, type, tip, multiple, role, container) {
    this.name = name
    this.type = type
    this.tip = tip
    this.multiple = multiple
    this.role = role
    this.container = container
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
      image: _t.multiple && null, // 引入当前的数据内容
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
      linkFrom: function (eve, startpos, pos2) {
        // 表示从当前点连接出去。
        // 起始点是当前的center内容。
        if (_t.container.currentPort) return void 0
        if (this.isPointInFigure(startpos)) {
          _t.container.currentPort = _t.name
          if (_t.container.isMoving) return void 0
          if (this.isPointInFigure(startpos[0], startpos[1])) {
            pushLink(startpos, pos2, _t.container, _t.name, _t.type)
            _t.container.CheckHint(_t.type)
          } else {
            _t.container = true
          }
        }
        // 通知当前全局移动事件，调整当前的移动事件以及鼠标事件的逻辑。
        // 启动当前提示动画。
      },
      linkIntoPort: function (eve, name) {
        if (name !== this.name) { return void 0 }
        // 设置当前的内容到连接线段。
        getCurrentLink().changeEnd(this.center)
        modifiedInto(this.port.container)
        LinkingSuccess()
        this.container.hintFinished()
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
