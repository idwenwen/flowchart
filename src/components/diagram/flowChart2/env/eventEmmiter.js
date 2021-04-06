import { isFunction } from 'lodash'
import record, { Exception } from '../../tools/exception'
import { toArray } from '../../tools/extension/iteration'

export class EventEmitter {
  constructor (context) {
    this.context = context
    this.events = new Map()
  }

  setContext (context) {
    this.context = context
  }

  addEvent (type, eve) {
    const list = this.events.get(type)
    if (isFunction) list.push(eve)
    else if (Array.isArray(eve)) list.push(...eve)
    else {
      record(new Exception('TypedError',
        'Need type as function or Array<Function>',
        Exception.level.Warn,
        false))
    }
    this.events.set(type, list)
  }
  addEvents (obj) {
    for (const key in obj) {
      this.addEvent(key, obj[key])
    }
  }

  removeEvent (type, eve) {
    const list = this.events.get(type)
    const willRemove = toArray(eve)
    list.filter(val => {
      return val.indexOf(willRemove) >= 0
    })
    this.events.set(type, list)
  }
  removeType (type) {
    this.events.delete(type)
  }

  dispatch (type, ...rest) {
    const list = this.events.get(type)
    if (list.length > 0) {
      list.forEach(val => {
        if (this.context) {
          val.call(this.context, ...rest)
        }
      })
    } else {
      record(new Exception(
        'NullStackException',
        'There has no events pre setting into emitter',
        Exception.level.Warn,
        false
      ))
    }
  }

  clearUp () {
    for (const val of this.events) {
      this.removeType(val[0])
    }
  }
}

export class EventEmitterForDom extends EventEmitter {
  constructor (dom, eves) {
    super(dom)
    this.dom = dom
    this.listener = new Map()
    eves && this.addEvents(eves)
  }

  // 添加实践内容。
  addEvent (type, eve) {
    super.addEvent(type, eve)
    this._bindEvents(type)
  }

  // 删除事件内容
  removeEvent (type, eve) {
    super.removeEvent(type, eve)
    this._unbindEvents(type)
  }
  removeType (type) {
    super.removeType(type)
    this._unbindEvents(type)
  }

  // dom绑定当前的事件内容。
  _bindEvents (type) {
    // 绑定运行情况
    // 判定当前的listener是否已经被绑定
    if (!this.listener.get(type) && this.events.get(type)) {
      const _t = this
      const listener = function (eve) {
        _t.events.get(type).forEach(val => {
          val(eve)
        })
      }
      // 触发事件以及自定义事件对象的缓存。
      const memories = { listener }
      this.dom.addEventListener(type, listener)
      if (this.dom[`on${type}`] !== undefined) {
        memories.parameter = new CustomEvent(type)
      }
      this.listener.set(type, memories)
    }
  }

  _unbindEvents (type) {
    // 如果有相关数据才会进行解绑
    if (this.listener.get(type)) {
      const memories = this.listener.get(type)
      if (memories.listener) {
        this.dom.removeEventListener(type, memories.listener) // 删除dom对应的节点
      }
      this.listener.delete(type)
    }
  }

  dispatch (type) {
    let listener = this.listener.get(type)
    if (!listener) {
      this._bindEvents(type)
      listener = this.listener.get(type)
    }
    if (!listener) {
      record(new Exception('MsgError',
        'There has no events register in EventEmitter typed ' + type,
        Exception.level.Warn,
        false))
    }
    // 如果有parameter参数的话，则触发，否则则是当前dom的原生事件。
    if (listener.parameter) { this.dom.dispatch(listener.parameter) }
  }
}
