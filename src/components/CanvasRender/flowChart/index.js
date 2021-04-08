const { default: GLOBAL } = require('./env/global')

export default function ChartFlow (dom, setting) {
  GLOBAL.setParent(dom)
  GLOBAL.setIcons(setting)
  return GLOBAL
}
