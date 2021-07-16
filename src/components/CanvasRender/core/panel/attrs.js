import { cloneDeep, eq, isObject } from 'lodash'
import { setAttr } from '../../tools/dom'
import { each, toArray } from '../../tools/iteration'
import { acquistion } from '../../tools/proxy'
import Observer from '../../tools/observer'

export default class Attributes {
  // attrs: object 属性存储对象
  constructor (attrs) {
    this.attrs = cloneDeep(attrs) || {}
    this._hasProxy = false
  }

  // 属性对象的数值设置。
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

  // 属性获取
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

  // 属性移除
  remove (name) {
    each(toArray(name))(val => {
      delete this.attrs[val]
    })
  }

  // 属性设置到相关的dom内容之中
  setAttributes (dom) {
    setAttr(dom, this.attrs)
  }

  // 当前属性对象需要被订阅
  subscribe (ignore) {
    if (!this._hasProxy) {
      this.attrs = new Observer(this.attrs, ignore).observer
      this._hasProxy = true
    }
  }

  // 属性对象代理，默认获取attrs对象之中的数值
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

  release () {
    this.attrs && this.attrs['_origin_'] && this.attrs['_origin_'].release()
    this.attrs = null
  }
}
