import { cloneDeep, eq, isObject, toArray } from 'lodash'
import { setAttr } from '../../../tools/extension/dom'
import { each } from '../../../tools/extension/iteration'
import { acquistion } from '../../../tools/extension/proxy'
import Observer from '../../../tools/observer'

export default class Attributes {
  // attrs: object 属性存储对象
  constructor (attrs) {
    this.attrs = cloneDeep(attrs)
  }

  set (nameOrObj, value) {
    if (isObject(nameOrObj)) {
      each(nameOrObj)((val, key) => {
        this.set(key, val)
      })
    } else if (!eq(this.attrs[name], value)) {
      this.attrs[name] = value
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
    if (!(this.attrs instanceof Proxy)) {
      this.attrs = new Observer(this.attrs, ignore).observer
    }
  }

  proxy () {
    const defaultHandler = {
      set (target, key, value) {
        return (target.attrs[key] = value)
      },
      get (target, key) {
        return target.attrs[key]
      }
    }
    return acquistion(this, defaultHandler)
  }
}
