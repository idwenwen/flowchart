import { combineInto } from '../../tools/define'
import { removeStyle, setStyle } from '../../tools/dom'
import { acquistion } from '../../tools/proxy'
import Observer from '../../tools/observer'
import Watcher from '../../tools/observer/watcher'

const { default: Attributes } = require('./attrs')

class Styles extends Attributes {
  constructor (imply) {
    super(imply)
    this.cache = imply
    // 当前是否已经有在监听。
    this.watching = null
    this._hasProxy = false
  }

  // 常规style属性设置
  setStyle (dom) {
    setStyle(dom, this.cache)
  }
  removeStyle (dom, styles) {
    removeStyle(dom, styles)
  }

  // 当前style属性订阅相关上下文
  accordingTo (context) {
    const _t = this
    this.watching = new Watcher(context, this.attrs, (_result) => {
      combineInto(_t.cache, _result)
    })
  }

  // 当前style属性作为订阅者进行关联
  subscribe () {
    if (!this._hasProxy) {
      this.cache = new Observer(this.cache).observer
      this._hasProxy = true
    }
  }

  // 相关代理处理
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

  release () {
    super.release()
    this.cache && this.cache['_origin_'] && this.cache['_origin_'].release()
    this.watching && this.watching.release()
  }
}

export default Styles
