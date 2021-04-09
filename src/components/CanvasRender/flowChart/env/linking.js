export default class LinkingManager {
  constructor () {
    this.outter = null
    this.inner = null
    this.outerPosition = null
    this.linking = null
  }

  // 连出的组件
  from (outter) {
    this.outter = outter
  }
  fromPos (position) {
    this.outerPosition = position
  }
  // 连入的组件
  into (inner) {
    this.inner = inner
  }
  // 关联对象
  link (linking) {
    this.linking = linking
  }

  // 与目前的出处内容进行比对。
  checkWithFrom (comp) {
    return this.outter && this.outter === comp
  }
  checkWithInto (comp) {
    return this.inner && this.inner === comp
  }

  // 是否有连线内容
  hasFrom () {
    return !!this.outter
  }
  hasInner () {
    return !!this.inner
  }

  clear () {
    this.outter = null
    this.inner = null
    this.outerPosition = null
    this.linking = null
  }
}
