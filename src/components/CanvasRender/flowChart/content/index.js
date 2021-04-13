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
import UUID from '../../tools/uuid'
import ICONTip from '../subContent/iconTip'

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
const TreeID = new UUID(index => `figure_${index}`)

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
    this.id = id || TreeID.get()
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
    GLOBAL.registerComp(this.id, this)
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
      choose () {
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
      toppest () {
        _t.panel.styles['z-index'] = 10
      },
      originLevel () {
        _t.panel.styles['z-index'] = 2
      },

      // 最终状态定格
      endChangeStatus (status) {
        _t.status = status
        this.status = status
        if (status === ComponentsStatus.running) {
          _t.figure.dispatchAnimate('loading')
        }
        // 添加相关的sub内容
        if (status === ComponentsStatus.success || status === ComponentsStatus.fail) {
          const icon = new ICONTip(_t, status) // 添加新的ICON
          _t.addSub(icon.uuid, icon)
        }

        _t.isChanging = false
        if (_t.statusChangeList.length > 0) {
          debugger
          _t.figure.dispatchEvents('isChangingStatus', _t.statusChangeList.splice(0, 1)[0])
        }
      },
      isChangingStatus (status) {
        _t.removeICON() // 状态改变移除原有的ICON
        if (_t.status === ComponentsStatus.running) {
          _t.figure.endAnimate('loading')
        }
        // 组件的toStatus方法
        _t.figure.dispatchAnimate('changeStatus', status)
      },
      // 状态修改过程启动
      startChangeStatus (status) {
        const res = matchStatus(status)
        _t.statusChangeList.push(res)
        if (!_t.isChanging) {
        // 如果状态不相同则转变当前状态。
          _t.isChanging = true
          _t.figure.dispatchEvents('isChangingStatus', _t.statusChangeList.splice(0, 1)[0])
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
        // 获取当前port的对象
        const pos = getPos(eve)
        const mid = _t.checkPositionForPort(pos)
        if (mid) {
          mid.linkFrom(pos) // 创建连接,结果表示当前连接创建是否成功
          _t.lastStatus = 'linking'
        } else {
          // 如果当前没有连接的话，设置当前内容为moving
          GLOBAL.moving.setMove(_t)
        }
      },
      'click': function (eve) {
        // 当前内容被选中
        if (_t.lastStatus !== 'moving' && _t.figure.isPointInFigure(getPos(eve))) {
          GLOBAL.choosen.choose(_t)
          eve.stopPropagation()
        }
        _t.lastStatus = 'click'
      }
    }
  }

  // 渲染函数。
  toRender (width, height, point, status) {
    const childList = [
      new Content(),
      new ContentPorts(this.type, this.single, this.role)
    ]
    this.setChildren(childList)
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
    this.changeStatus(status)
    return this.figure
  }

  checkPositionForPort (position) {
    return this.getChildren()[1].inPort(position)
  }
  checkHintForPort (list, type) {
    if (list.indexOf(this) < 0) {
      this.getChildren()[1].linkHint(type)
    }
  }

  choosen () {
    this.figure.dispatchEvents('choose')
  }
  unchoosen () {
    this.figure.dispatchEvents('unchoose')
  }

  addSub (name, subComp) {
    this.subs.add(name, subComp)
    this.panel.append(subComp.panel)
  }
  removeSub (name) {
    const sub = this.subs.remove(name)
    this.panel.remove(sub.panel)
  }
  removeICON () {
    this.subs.filter(function (key) {
      return !!key.match(/ICONTip/)
    })
  }

  addLinkOut (linking) {
    this.linkOut.add(linking)
  }
  removeLinkOut (linking) {
    this.linkOut.delete(linking)
  }
  addLinkInto (linking) {
    this.linkInto.add(linking)
  }
  removeLinkInto (linking) {
    this.linkInto.delete(linking)
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

  // 清除当前对象的数据内容。
  clearUp () {
    // 清除当前的展示内容
    ([...(Array.from(this.linkInto)), ...(Array.from(this.linkOut))]).forEach(val => {
      val.clearUp()
    })
    this.subs.clearUp()
    GLOBAL.globalPanel.remove(this.panel)
    GLOBAL.globalComp.delete(this.id)
  }

  // 获取与当前组件关联的上层组件内容。
  getConnection () {
    const getTopper = function (node) {
      const willNotHint = []
      const final = []
      for (const val of node.linkInto) {
        willNotHint.push(val.from.root())
      }
      for (const val of willNotHint) {
        final.push(...getTopper(val))
      }
      final.push(node)
      return Array.from(new Set(final))
    }
    return getTopper(this)
  }

  // 状态修改函数。
  changeStatus (status) {
    this.figure.dispatchEvents('startChangeStatus', status)
  }
  getInformation () {
    const result = {
      id: this.id,
      type: this.type, // 组件类型
      status: this.status, // 当前组件的状态
      disable: this.disable,

      name: this.name, // 当前组件名称
      role: this.role, // 当前组件针对的角色
      point: this.panel.attrs.point,
      width: this.panel.attrs.width,
      height: this.panel.attrs.height,
      single: this.single
    }

    return result
  }

  getPort (i, type, output) {
    return this.getChildren()[1].checkHint(i, type, output)
  }
}
