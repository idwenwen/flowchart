import { isFunction } from 'lodash'

export default class Callback {
  constructor (logic, before, after) {
    this.addBefore(before)
    this.addAfter(after)
    this.logic = logic
  }

  addAfter (after) {
    if (!this.after) this.after = []
    if (isFunction(after)) this.after.push(after)
    if (Array.isArray(after)) this.after.push(...after)
  }

  addBefore (before) {
    if (!this.before) this.before = []
    if (isFunction(before)) this.after.push(before)
    if (Array.isArray(before)) this.after.push(...before)
  }

  _callLifeStep (logicList) {
    for (const val of logicList) {
      val()
    }
  }

  bind (...args) {
    const _t = this
    return function (...rest) {
      if (_t.before.length > 0) {
        _t._callLifeStep(_t.before)
      }
      _t.logic(...[...args, ...rest])
      if (_t.after.length > 0) {
        _t._callLifeStep(_t.after)
      }
    }
  }
}
