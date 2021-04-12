const { default: GLOBAL } = require('./env/global')

export default class ChartFlow {
  constructor (dom) {
    GLOBAL.setParent(dom)
    GLOBAL.setIcons()
  }

  // 添加单个或者多个组件内容
  append (setting) {
    if (Array.isArray(setting)) {
      GLOBAL.appendComps(setting)
    } else {
      GLOBAL.appendComp(setting)
    }
  }

  changeStatus (setting) {
    GLOBAL.changeStatusForComps(setting)
  }

  getInfo () {
    return GLOBAL.getInformation()
  }

  // 重建当前的DAG内容。
  rebuild (setting) {
    GLOBAL.rebuild(setting)
  }

  clear () {
    GLOBAL.clearCanvas()
  }

  addEvent (name, opera) {
    GLOBAL.addEvent(name, opera)
  }
  addEvents (setting) {
    GLOBAL.addEvents(setting)
  }
}
