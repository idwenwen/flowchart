import { each } from '../../tools/iteration'

/**
 * 当前对象主要管理组件之间的关联关系
 */
class SubCompManager {
  constructor (connectTo) {
    // component实例 与 多个组件实例进行关联
    this.connectTo = connectTo
    this.connect = new Map()
  }

  /**
   * 添加辅助组件
   * @param {Component} main 主要的components内容
   * @param {object} sub 辅组件内容。但是有一个相关的位置映射换算。
   * {
   *  component: subComponent
   *  imply: {
   *    // 三个相关映射公式。会在添加的时候首次计算，将main作为this调用。
   *    position,
   *    width,
   *    height,
   *  }
   * }
   */
  add (key, sub) {
    return this.connect.set(key, sub)
  }

  // 依据subID删除已有的副组件内容。
  remove (key) {
    if (this.connect.get(key)) {
      this.connect.get(key).disRender()
    }
    return this.connect.delete(key)
  }

  filter (opera) {
    for (const val of this.connect) {
      if (opera(val[0])) {
        this.remove(val[0])
      }
    }
  }

  updatePosition (x, y) {
    each(this.connect, (val) => {
      val.updatePosition(x, y)
    })
  }

  clear (type) {
    const comp = this.connect.get(type)
    if (this.connect.get(type) && comp) {
      comp.clearUp()
      this.connect.delete(type)
    }
  }
  clearUp () {
    for (const val of this.connect) {
      this.clear(val[0])
    }
  }
}

export default SubCompManager
