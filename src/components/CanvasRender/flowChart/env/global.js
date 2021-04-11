import Component from '../content'
import Linking from '../linking'
import { compareToPos } from '../utils'
import Choosen from './choosen'
import Connection from './connection'
import { EventEmitter } from './eventEmitter'
import Icons from './icon'
import LinkingManager from './linking'
import Moving from './moving'
import BackendPanel from './panel'

export class Global extends EventEmitter {
  constructor () {
    super()
    this.choosen = new Choosen(this)
    this.linking = new LinkingManager()
    this.moving = new Moving()
    this.connection = new Connection()

    this.globalIcons = new Icons()
    this.globalComp = new Map()
    this.globalLinking = new Map()
    this.globalHint = new Map()

    // 全局dom内容
    this.globalPanel = new BackendPanel()
  }

  registerComp (id, comp) {
    this.globalComp.set(id, comp)
  }
  registerLinking (id, comp) {
    this.globalLinking.set(id, comp)
  }
  registerHint (id, comp) {
    this.globalHint.set(id, comp)
  }

  removeComp (id) {
    this.globalComp.delete(id)
  }
  removeLinking (id) {
    this.globalLinking.delete(id)
  }
  removeHint (id) {
    this.globalHint.delete(id)
  }
  clearHint () {
    for (const val of this.globalHint) {
      val[1].clearUp()
    }
  }

  // 比对当前所有属性内容是否是
  positionInHint (position) {
    for (const val of this.globalHint) {
      const port = val[1].linkInto(
        compareToPos(position, GLOBAL.globalPanel.getOrigin(), val[1].panel.getOrigin())
      )
      if (port) {
        return port
      }
    }
    return false
  }

  // 创建当前的可用连线
  createLinking (startPoint, endPoint, port) {
    const l = new Linking(startPoint, endPoint)
    const list = port.root().getConnection()
    // 开始连接
    this.dispatch('linkStart')
    l.linkStart() // 创建连线。
    this.createLinkHint(list, port.type)
    this.linking.link(l) // 设置当前的连线信息
    if (port.type.match(/output/i)) { // 当前端口是否是输出端口
      this.linking.from(port)
      l.from = port
    } else {
      this.linking.into(port)
      l.end = port
    }
  }
  // 创建连接。
  createConnection (position, port) {
    const l = this.linking.linking
    if (!l) {
      return void 0
    }
    // 确定当前可以连接的linking
    if (!port) {
      port = this.positionInHint(position)
    }
    if (!port) {
      l.clearUp()
      this.linking.clear()
      this.clearHint()
      // 连接失败
      this.dispatch('linkFailed')
      return void 0
    }

    // 连接成功的时候最后一次变更连线位置
    l.changing(port.currentPosition(this.globalPanel.getOrigin()))

    // 当前端口是否是输出端口
    if (port.type.match(/output/i)) {
      this.linking.from(port)
      l.from = port // 设置linking自身的启始或结束内容
    } else {
      this.linking.into(port)
      l.end = port
    }

    // 通知当前相关port的内容设置。
    l.from.linkOut(l)
    l.end.linkInto(l)
    l.linkEnd()

    // 清除当前可连接提示
    this.clearHint()
    this.linking.clear()

    // 连接成功
    this.dispatch('linkSuccessd')
  }
  createConnectionDir (startPos, endPos, from, end) {
    // 直接连线当前内容。
    const l = new Linking(startPos, endPos, from, end)
    from.addLinkOut(l)
    end.addLinkInto(l)
    l.linkEnd()
  }
  // 创建连接关联提示符。
  createLinkHint (list, type) {
    for (const val of this.globalComp) {
      val[1].checkHintForPort(list, type)
    }
  }

  // 添加组件信息内容
  appendComp (compSetting) {
    this.dispatch('beforeAddCompnent')
    const comp = new Component(compSetting)
    this.dispatch('afterAddComponent', comp)
    return comp
  }
  appendComps (compSettings) {
    this.dispatch('beforeAddComponents')
    for (const val of compSettings) {
      this.appendComp(val)
    }
    this.dispatch('afterAddComponents')
  }
  // 删除组件内容
  deleteComp (id) {
    let comp = id
    if (!comp.toString().match('object')) {
      comp = this.globalComp.get(id)
    }
    if (comp) {
      this.dispatch('beforeDeleteComponent')
      comp.clearUp()
      this.dispatch('afterDeleteComponent')
    }
  }
  deleteComps (ids) {
    this.dispatch('beforeDeleteComponents')
    for (const val of ids) {
      this.deleteComp(val)
    }
    this.dispatch('afterDeleteComponents')
  }

  deleteLink (link) {
    this.dispatch('beforeDeleteLink')
    let res = link
    if (!(link instanceof Linking)) {
      res = this.globalLinking.get('link')
    }
    if (res) {
      res.clearUp()
    }
  }

  // 设置ICON信息
  setIcons (setting) {
    this.globalIcons.loadImages(setting)
  }
  // 获取ICON内容
  getIcon (type) {
    return this.globalIcons.getIcon(type)
  }

  // 设置父类信息
  setParent (parent) {
    this.globalPanel.setParent(parent)
  }

  // 判定当前坐标点是属于哪一个组件或者连线的。
  belongTo (pos) {
    const checking = (map) => {
      for (const val of map) {
        if (val[1].figure.isPointInFigure(
          compareToPos(pos, GLOBAL.globalPanel.getOrigin(), val[1].panel.getOrigin())
        )) {
          return val[1]
        }
      }
      return false
    }
    let comp = checking(this.globalComp)
    if (comp) return comp
    comp = checking(this.globalLinking)
    if (comp) return comp
  }

  // 修改特定的组件的状态。
  changeStatusForComp (id, status) {
    const comp = this.globalComp.get(id)
    if (comp) {
      this.dispatch('beforeComponentChangeStatus', comp)
      comp.changeStatus(status)
      this.dispatch('afterComponentChangeStatus', comp)
    }
  }
  // 为多个组件修改状态。
  changeStatusForComps (setting) {
    this.dispatch('beforeCompoentsChangeStatus')
    for (const key in setting) {
      this.changeStatusForComp(key, setting[key])
    }
    this.dispatch('afterCompoentsChangeStatus', this.globalComp)
  }

  // 清除当前画布上面的内容
  clearCanvas () {
  }
  getInformation () {
    const list = []
    for (const val of this.globalComp) {
      list.push(val[1].getInformation())
    }
    for (const val of this.globalLinking) {
      // 添加linking内容
    }
  }
}

let GLOBAL = new Global()

export default GLOBAL
