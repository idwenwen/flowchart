import { each, toArray } from '../../../../tools/extension/iteration'
import { isFunction } from 'lodash'
import PanelOperation from '../panelManager/panelOperation'

/**
 * 当前对象主要管理组件之间的关联关系
 */
class SubCompManager {
  constructor () {
    // component实例 与 多个组件实例进行关联
    this.connect = new Map()
  }

  /**
   *
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
  add (main, sub) {
    const list = this.connect.get(main) || []
    if (!list.find(item => item.uuid === sub.uuid)) {
      list.push(sub)
      this.connect.set(main, sub)
    }
  }

  remove (main, subId) {
    const list = this.connect.get(main)
    if (list.length > 0) {
      each(toArray(subId))(val => {
        const index = list.findIndex(item => item === val)
        if (index >= 0) {
          list.splice(index, 1)
        }
      })
      this.connect.set(main, list)
    }
  }

  notify (main) {
    const list = this.connect.get(main)
    each(list)(val => {
      this.updatePosition(main, val)
    })
  }

  updatePosition (main, sub) {
    each(toArray(sub))((val) => {
      const res = {}
      if (val.imply) {
        each(val.imply)((item, key) => {
          res[key] = isFunction(item) ? item.call(main) : item
        })
      } else {
        res.position = main.getPosition()
        res.width = main.getWidth()
        res.height = main.getHeight()
      }
      if (val instanceof PanelOperation) {
        val.updated(res)
      } else {
        val.component.updated(res)
      }
    })
  }
}

export default SubCompManager
