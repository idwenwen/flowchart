import { combineInto } from '../../../tools/extension/define'
import { removeStyle, setStyle } from '../../../tools/extension/dom'
import { acquistion } from '../../../tools/extension/proxy'
import Observer from '../../../tools/observer'
import { Watcher } from '../../../tools/observer/watcher'

const { default: Attributes } = require('./attrs')

class Styles extends Attributes {
  constructor (imply) {
    super(imply)
    this.cache = imply
    // 当前是否已经有在监听。
    this.watching = null
  }

  setStyle (dom) {
    setStyle(dom, this.cache)
  }

  removeStyle (dom, styles) {
    removeStyle(dom, styles)
  }

  accordingTo (context) {
    this.watching = new Watcher(context, this.attrs, (_result) => {
      combineInto(this.cache, _result)
    })
  }

  subscribe () {
    if (!(this.cache instanceof Proxy)) {
      this.cache = new Observer(this.cache).observer
    }
  }

  proxy () {
    const defaultHandler = {
      set (target, key, value) {
        this.attrs[key] = value
        if (target.watching) {
          target.watching.imply(key, value)
        } else {
          target.cache[key] = value
        }
      },
      get (target, key) {
        return target.cache[key]
      }
    }
    return acquistion(this, defaultHandler)
  }
}

export default Styles
