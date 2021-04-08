import Component from '../content'
import { compareToPos } from '../utils'
import Choosen from './choosen'
import { EventEmitter } from './eventEmitter'
import Icons from './icon'
import Linking from './linking'
import Moving from './moving'
import BackendPanel from './panel'

export class Global extends EventEmitter {
  constructor () {
    super()
    this.choosen = new Choosen()
    this.linking = new Linking()
    this.moving = new Moving()

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
    l.linkStart()
    this.linking.link(l) // 设置当前的连线信息
    if (port.type.match(/output/i)) { // 当前端口是否是输出端口
      this.linking.from(port)
      l.end = port // 设置linking自身的启始或结束内容
    } else {
      this.linking.into(port)
      l.from = port
    }
  }
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
    }
    l.changeEnd(position)
    if (port.type.match(/output/i)) { // 当前端口是否是输出端口
      this.linking.from(port)
      l.end = port // 设置linking自身的启始或结束内容
    } else {
      this.linking.into(port)
      l.from = port
    }
    // 通知当前相关port的内容设置。
    l.changeEnd(port.currentPosition(this.globalPanel.getOrigin()))
    l.from.linkFrom(l)
    l.end.linkInto(l)
    l.linkEnd()
  }
  createConnectionDir (startPos, endPos, from, end) {
    const l = new Linking(startPos, endPos, from, end)
    from.addLinkOut(l)
    end.addLinkInto(l)
    l.linkEnd()
  }

  getIcon (type) {
    return this.globalIcons.getIcon(type)
  }
  appendComp (compSetting) {
    return new Component(compSetting)
  }
  setIcons (setting) {
    this.globalIcons.loadImages(setting)
  }
  setParent (parent) {
    this.globalPanel.setParent(parent)
  }
}

let GLOBAL = new Global()

export default GLOBAL
