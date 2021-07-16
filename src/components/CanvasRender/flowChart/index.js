const { default: Global } = require('./env/global')

export default class ChartFlow {
  constructor (dom) {
    this.dom = dom
    this.global = new Global()
    this.global.setIcons()
    this.global.setParent(dom)
  }

  // 添加单个或者多个组件内容
  append (setting) {
    if (Array.isArray(setting)) {
      this.global.appendComps(setting)
    } else {
      this.global.appendComp(setting)
    }
  }

  changeStatus (setting) {
    this.global.changeStatusForComps(setting)
  }

  getInfo () {
    return this.global.getInformation()
  }

  // 重建当前的DAG内容。
  rebuild (setting) {
    this.global.rebuild(setting)
  }

  clear () {
    this.global.clearCanvas()
  }

  addEvent (name, opera) {
    this.global.addEvent(name, opera)
  }
  addEvents (setting) {
    this.global.addEvents(setting)
  }

  choose (comp) {
    this.global.choosing(comp)
  }

  setOld (id, bool = true) {
    this.global.setOld(id, bool)
  }
  setUnsave (id, bool = true) {
    this.global.setUnsave(id, bool)
  }
  getOld () {
    return this.global.getOld()
  }
  getUnsave () {
    return this.global.getUnsave()
  }

  getCurrentGlobal () {
    return this.global
  }
  setCurrentGlobal (global, willRelease = true) {
    if (this.global) {
      this.global.moveoutFromParent()
    }
    if (willRelease) {
      this.global.release()
    }
    this.global = global || new Global()
    this.global.setIcons()
    this.global.setParent(this.dom)
  }
}
