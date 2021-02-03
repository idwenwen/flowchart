import { combineInto } from '../../../tools/extension/define'
import { removeStyle, setStyle } from '../../../tools/extension/dom'
import { acquistion } from '../../../tools/extension/proxy'
import Observer from '../../../tools/observer'
import Watcher from '../../../tools/observer/watcher'

const { default: Attributes } = require('./attrs')

class Styles extends Attributes {
  constructor (imply) {
    super(imply)
    this.cache = imply
    // 当前是否已经有在监听。
    this.watching = null
    this._hasProxy = false
  }

  setStyle (dom) {
    setStyle(dom, this.cache)
  }

  removeStyle (dom, styles) {
    removeStyle(dom, styles)
  }

  accordingTo (context) {
    const _t = this
    this.watching = new Watcher(context, this.attrs, (_result) => {
      combineInto(_t.cache, _result)
    })
  }

  subscribe () {
    if (!this._hasProxy) {
      this.cache = new Observer(this.cache).observer
      this._hasProxy = true
    }
  }

  proxy () {
    const defaultHandler = {
      set (target, key, value) {
        if (target.watching) {
          target.watching.getter(key, value)
        } else {
          target.attrs[key] = value
          target.cache[key] = value
        }
        return true
      },
      get (target, key) {
        return target.cache[key]
      }
    }
    return acquistion(this, defaultHandler)
  }
}

export default Styles
