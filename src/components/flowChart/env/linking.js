export default class Linking {
  constructor () {
    this.outter = null
    this.inner = null
    this.linking = null
  }

  // 连出的组件
  from (outter) {
    this.outter = outter
  }
  // 连入的组件
  into (inner) {
    this.inner = inner
  }
  // 关联对象
  linking (linking) {
    this.linking = linking
  }
}
