import { each } from '../../../tools/extension/iteration'
import { Exception } from '../../../tools/exception'
import { isObject, toArray, remove } from 'lodash'
import { once } from '../controller/action/action'

class Events {
  // eventsList: Mapping<string, EventNode[]>; 事件管理
  // context: any; // 事件执行上下文
  constructor (context, eventList) {
    this.context = context
    this.eventsList = new Map()
    eventList && this.addEvents(eventList)
  }

  addEvents (name, operationOrOnce, once = false) {
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
      this.eventsList.set(name, list)
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
    try {
      let eve = this.eventsList.get(name) // 获取当前时间函数
      if (!eve) {
        throw new Exception(
          'DonotExist',
          `There has no event name ${name}`,
          Exception.level.Warn,
          false
        )
      }
      // 将当前时间逻辑设置称为一次action的内容统一添加到当前的公共心跳之中。
      once(this.context, () => {
        const willRemove = []
        // 设置当前转变到心跳函数之中，进行同步操作。
        eve = toArray(eve)
        each(eve)((func, index) => {
          func.event.call(this.context, ...meta)
          // 删除单次事件
          if (func.once) willRemove.push(index)
        })
        remove(eve, (_item, index) => {
          willRemove.find((val) => val === index)
        })
        this.eventsList.set(name, eve)
      })
    } finally {
      void 0
    }
  }
}

export default Events
