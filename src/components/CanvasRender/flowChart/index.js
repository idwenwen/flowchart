const { default: GLOBAL } = require('./env/global')

export default function chartFlow (dom) {
  GLOBAL.setParent(dom)
  return GLOBAL
}

export class ChartFlow {
  constructor (dom, setting) {
    GLOBAL.setParent(dom)
    GLOBAL.setIcons(setting)
  }

  // 添加单个或者多个组件内容
  append (setting) {
    if (Array.isArray(setting)) {
      GLOBAL.appendComps(setting)
    } else {
      GLOBAL.appendComp(setting)
    }
  }

  // 重建当前的DAG内容。
  rebuild (setting) {

  }
}
