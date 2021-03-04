import { cloneDeep, eq, isObject } from 'lodash'
import { setAttr } from '../tools/extension/dom'
import { each, toArray } from '../tools/extension/iteration'
import { acquistion } from '../tools/extension/proxy'
import Observer from '../tools/observer'

export default class Attributes {
  // attrs: object 属性存储对象
  constructor (attrs) {
    this.attrs = cloneDeep(attrs) || {}
    this._hasProxy = false
  }

  set (nameOrObj, value) {
    const _t = this
    if (isObject(nameOrObj)) {
      each(nameOrObj)(function (val, key) {
        _t.set(key, val)
      })
    } else if (!eq(this.attrs[nameOrObj], value)) {
      this.attrs[nameOrObj] = value
    }
  }

  get (name) {
    let res
    if (Array.isArray(name)) {
      res = {}
      each(name)(val => {
        res[val] = this.attrs[val]
      })
    } else {
      res = this.attrs[name]
    }
    return res
  }

  remove (name) {
    each(toArray(name))(val => {
      delete this.attrs[val]
    })
  }

  setAttributes (dom) {
    setAttr(dom, this.attrs)
  }

  subscribe (ignore) {
    if (!this._hasProxy) {
      this.attrs = new Observer(this.attrs, ignore).observer
      this._hasProxy = true
    }
  }

  proxy () {
    const defaultHandler = {
      set (target, key, value) {
        target.attrs[key] = value
        return true
      },
      get (target, key) {
        return target.attrs[key]
      }
    }
    return acquistion(this, defaultHandler)
  }
}
