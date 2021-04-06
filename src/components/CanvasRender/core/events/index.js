import { each, toArray } from '../../utils/iteration'
import { isObject, remove } from 'lodash'
import { once } from '../controller/action/action'
import { record } from '../../utils/exception'

class Events {
  // eventsList: Mapping<string, EventNode[]>; 事件管理
  // context: any; // 事件执行上下文
  constructor (context, eventList) {
    this.context = context
    this.eventsList = new Map()
    eventList && this.addEvents(eventList)
  }

  // 事件对象事件添加。
  addEvents (name, operationOrOnce, once = false) {
    // 当前name是对照的事件对象。
    if (isObject(name)) {
      each(name)((val, key) => {
        this.addEvents(key, val, operationOrOnce)
      })
    } else {
      const list = each(toArray(operationOrOnce))((func) => {
        return {
          event: func,
          once
        }
      })
      const origin = this.eventsList.get(name) || []
      this.eventsList.set(name, [...origin, ...list])
    }
  }

  // 删除某一类事件
  removeEvents (name) {
    name = toArray(name)
    each(name)((val) => {
      this.eventsList.delete(val)
    })
  }

  // 事件触发。
  dispatch (name, ...meta) {
    let eve = this.eventsList.get(name) // 获取当前时间函数
    if (!eve) {
      record('DonotExist',
        `There has no event name ${name}`)
      return false
    }

    const _t = this
    // 将当前时间逻辑设置称为一次action的内容统一添加到当前的公共心跳之中。
    once(this.context, () => {
      const willRemove = []
      // 设置当前转变到心跳函数之中，进行同步操作。
      const evelist = toArray(eve)
      each(evelist)((func, index) => {
        func.event.call(_t.context, ...meta)
        // 删除单次事件
        if (func.once) willRemove.push(index)
      })
      remove(evelist, (_item, index) => {
        willRemove.find((val) => val === index)
      })
      _t.eventsList.set(name, evelist)
    })
    return true
  }
}

export default Events
