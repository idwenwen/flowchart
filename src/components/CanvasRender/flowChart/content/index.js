import { record } from '../../tools/exception'
import Tree from '../../tools/tree'
import { each } from '../../tools/iteration'
import ContentPorts from './port'
import Content from './content'
import PanelManager from '../panelManager/index.JS'
import Diagram from '../../core/diagram'
import GLOBAL from '../env/global'
import SubCompManager from '../subContent'
import { getPos } from '../utils'

export const ComponentsStatus = {
  unrun: 'unrun|waiting',
  running: 'running',
  fail: 'failed|error|canceled',
  success: 'success|complete'
}

export const Role = {
  Guest: 'guest',
  Host: 'host',
  Arbit: 'arbit'
}

function matchStatus (status) {
  status = status.toLowerCase()
  let res
  each(ComponentsStatus)((val, key) => {
    if (val.search(status) >= 0) {
      res = key
      record('Breaking',
        'Breaking from iteration')
    }
  })
  return ComponentsStatus[res]
}
// 匹配当前的用户内容
function matchRole (role) {
  role = role.toLowerCase()
  let res
  each(Role)((val, key) => {
    if (val.search(role) >= 0) {
      res = key
      record('Breaking',
        'Breaking from iteration')
    }
  })
  return Role[res]
}

class GlobalNameCheck {
  constructor () {
    this.record = {}
  }
  getName (type) {
    let index = this.record[type] || 0
    this.record[type] = index + 1
    return type + '_' + index
  }
}
const defaultName = new GlobalNameCheck()

export default class Component extends Tree {
  constructor (
    {
      id,
      type, // 组件类型
      status = ComponentsStatus.unrun, // 当前组件的状态
      disable, // 当前组件是否是不需要运行的。

      name, // 当前组件名称
      role, // 当前组件针对的角色
      choose = false, // 当前组件是否被选择

      single = false,

      width,
      height,
      point
    }
  ) {
    super()
    this.id = id
    this.type = type
    this.status = matchStatus('unrun')
    this.disable = disable

    this.name = name || defaultName.getName(this.type)
    this.role = matchRole(role)
    this.choose = choose
    this.single = single

    this.saved = true // 表示当前组件是否被存储。
    this.subs = new SubCompManager(this) // 辅组件

    // 异步状态改变状态确定，辅助状态改变。
    this.statusChangeList = []
    this.isChanging = false
    this.lastStatus = ''

    // 记录当前连线数值内容。
    this.linkOut = new Set()
    this.linkInto = new Set()

    this.figure = null
    this.panel = null
    this.toRender(width, height, point, status)
  }

  // diagram 组件的配置信息与组件内容。
  getDiagramParameter () {
    const _t = this
    return {
      name () {
        return _t.name
      },
      saved () {
        return _t.saved
      },
      width () {
        return parseFloat(this.attrs.width) - 10 * 2
      },
      height () {
        let portW = parseFloat(this.attrs.width) * 0.02
        portW = (portW < 12 ? 12 : portW) + 1
        return parseFloat(this.attrs.height) - portW * 2
      },
      radius () {
        const times = 0.005
        const minRadius = 2
        const maxRadius = 20
        const width = parseFloat(this.attrs.width)
        let radius = width * times
        radius =
        radius < minRadius
          ? minRadius
          : radius > maxRadius
            ? maxRadius
            : radius
        return radius
      },
      choosed () {
        return _t.choose
      },
      status () {
        return _t.status
      },
      disable () {
        return _t.disable
      },
      center () {
        return [
          parseFloat(this.attrs.width) / 2,
          parseFloat(this.attrs.height) / 2
        ]
      }
    }
  }
  getDiagramEvents () {
    const _t = this
    return {
      // 状态修改
      isSaving () {
        _t.saved = false
        this.saved = false
      },
      hasSave () {
        _t.saved = true
        this.saved = true
      },
      choose () {
        _t.choose = true
        this.choose = true
      },
      unchoose () {
        _t.choose = false
        this.choose = false
      },
      disable () {
        _t.disable = true
        this.disable = true
      },
      able () {
        _t.disable = false
        this.disable = false
      },

      // 最终状态定格
      endChangeStatus (status) {
        _t.status = status
        this.status = status
        if (status === ComponentsStatus.running) {
          _t.figure.dispatchAnimate('loading')
        }
        let type = null
        if (this.status === ComponentsStatus.fail) {
          type = this.disable ? 'disableError' : 'error'
        } else if (this.status === ComponentsStatus.success) {
          type = this.disable ? 'disableComplete' : 'complete'
        }
        // 添加相关的sub内容
        if (type) {
          _t.addSubsIcon(type)
        } else {
          _t.removeStatusIcon('statusIcon')
        }

        _t.isChanging = false
        if (_t.statusChangeList.length > 0) {
          _t.figure.dispatchAnimate('startChangeStatus', _t.statusChangeList.splice(0, 1))
        }
      },
      // 状态修改过程启动
      startChangeStatus (status) {
        const res = matchStatus(status)
        _t.statusChangeList.push(res)
        if (!_t.isChanging) {
        // 如果状态不相同则转变当前状态。
          _t.isChanging = true
          if (_t.status === ComponentsStatus.running) {
            _t.figure.endAnimate('loading')
          }
          // 组件的toStatus方法
          _t.figure.dispatchAnimate('changeStatus', res)
        }
      }
    }
  }

  // panel相关测试与事件
  getPanelEvents () {
    const _t = this
    return {
      'mousedown': function (eve) {
        // 记录当前的点击位置
        eve.stopPropagation()
        // 获取当前port的对象
        const mid = _t.checkPositionForPort(getPos(eve))
        if (mid) {
          mid.linkFrom(eve) // 创建连接,结果表示当前连接是否成功
        } else {
          // 如果当前没有连接的话，设置当前内容为moving
          GLOBAL.moving.setMove(_t)
        }
      },
      'click': function (eve) {
        // 当前内容被选中
        eve.stopPropagation()
        if (_t.lastStatus !== 'moving') {
          GLOBAL.choosen.choose(_t)
        }
      }
    }
  }

  toRender (width, height, point, status) {
    const childList = [
      new Content(),
      new ContentPorts(this.type, this.single, this.role)
    ]
    this.panel = new PanelManager({
      width,
      height,
      point,
      events: this.getPanelEvents()}
    ).panel
    this.figure = new Diagram(this.panel, {
      data: this.getDiagramParameter(),
      events: this.getDiagramEvents(),
      children: (() => {
        const res = []
        childList.forEach(val => {
          res.push(val.figure)
        })
        return res
      })()
    })
    GLOBAL.globalPanel.append(this.panel) // 全局环境下添加当前的展示内容。
    this.figure.dispatchEvents('startChangeStatus', status)
    return this.figure
  }

  checkPositionForPort (position) {
    return this.getChildren()[1].inPort(position)
  }

  addSub (name, subComp) {
    this.subs.add(name, subComp)
    this.panel.append(subComp.panel)
  }
  removeSub (name) {
    const sub = this.subs.remove(name)
    this.panel.remove(sub.panel)
  }

  addLinkOut (linking) {
    this.linkOut.add(linking)
  }
  addLinkInto (linking) {
    this.linkInto.add(linking)
  }

  // 当前panel移位
  translate ({x: xDistance, y: yDistance}) {
    const origin = this.panel.attrs.point
    this.panel.attrs.point = [
      origin[0] + xDistance,
      origin[1] + yDistance
    ]
    // 相关连线移动
    for (const val of this.linkInto) {
      val.translateEnd(xDistance, yDistance)
    }
    for (const val of this.linkOut) {
      val.translateStart(xDistance, yDistance)
    }
  }

  clearUp () {
    // 清除当前的展示内容
    ([...(Array.from(this.linkInto)), ...(Array.from(this.linkOut))]).forEach(val => {
      val.clearUp()
    })
    this.subs.clearUp()
    GLOBAL.globalPanel.remove(this.panel)
  }
}
