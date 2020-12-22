import { throttle, toArray } from 'lodash'
import { create } from '../../../tools/extension/dom'
import { each } from '../../../tools/extension/iteration'
import Watcher from '../../../tools/observer/watcher'
import { default as Attributes } from './attrs'
import Classes from './classes'
import { default as Styles } from './styles'
import Transform from './transform'

class Panel {
  // content: Diagram
  // Dom : HTMLElement
  // attrs : 常用属性设置
  // styles : 样式表设置。
  // transform : 变换情况。
  // classes : 样式列表
  constructor ({id, attrs, styles, transform, classes, events, Diagram}) {
    this.dom = create('canvas')
    this.id = id
    this.diagram = Diagram
    if (id) attrs.id = id
    this._attrs = new Attributes(attrs)
    this._styles = new Styles(this.transformToStyle(styles))
    this._transform = new Transform(transform)
    this._classes = new Classes(classes)
    this._events = events
    this.connection()

    this.attrs = this._attrs.proxy()
    this.styles = this._styles.proxy()
    this.transform = this._transform.proxy()
    this.classes = this._classes.proxy()
    this.willUpdate()
  }

  transformToStyle (styleSetting) {
    function splicing (str, ...checked) {
      return each(str)((val, index) => {
        if (val.search('scale') >= 0) {
          if (checked[index] !== 1) {
            return val + '(' + checked[index] + ')'
          }
        } else {
          if (checked[index] !== 0) {
            return val + '(' + checked[index] + ')'
          }
        }
      }).join(' ')
    }
    styleSetting.translate =
    styleSetting['-webkit-transform'] =
    styleSetting['-moz-transform'] =
    styleSetting['-webkit-transform'] = function () {
      const trans = this.transform
      return splicing`translateX(${trans.translateX}) translateY(${trans.translateY}) rotateX(${trans.rotateX}) rotateY(${trans.rotateY}) scaleX(${trans.scaleX}) scaleY(${trans.scaleY})`
    }
    return styleSetting
  }

  connection () {
    this._attrs.subscribe()
    this._transform.subscribe()
    this.styles.accordingTo(this)
  }

  willUpdate () {
    const _t = this
    this._attrs.subscribe()
    this.attrWatcher = new Watcher(this.attrs, function () {
      if (Object.keys(this) >= 0) {
        return this
      }
    }, () => {
      _t._attrs.setDom(this.dom)
    })

    this._styles.subscribe()
    let stylesOrigin = null
    this.styleWatcher = new Watcher(this.styles, function () {
      if (Object.keys(this) >= 0) {
        if (!stylesOrigin) stylesOrigin = this
        return this
      }
    }, (_result) => {
      _t._styles.setStyle(this.dom)
      if (stylesOrigin.width !== _result.width || stylesOrigin.height !== _result.height) {
        // 当宽高变化的时候重新渲染当前内容。
        _t.diagram.render()
        stylesOrigin = _result
      }
    })

    this._classes.subscribe()
    this.classWatcher = new Watcher(this.classes, function () {
      if (Object.keys(this) >= 0) {
        return this
      }
    }, () => {
      _t._classes.setClass(this.dom)
    })
  }

  _setEvents (setting) {
    const _t = this
    each(setting)((val, key) => {
      const thro = throttle((eve) => {
        each(toArray(val))(item => {
          item.call(_t, eve)
        })
      })
      this.dom.addEventListener(key, (eve) => {
        thro(eve)
      })
    })
  }

  addEvents (type, func) {
    const origin = this._events[type] || []
    origin.push(...toArray(func))
    this._events = origin
  }

  removeEvents (type, from, len) {
    const origin = this._events[type] || []
    const res = origin.splice(from, len)
    this._events = origin
    return res
  }

  translateX (x) {
    this.styles.set({
      left: (parseFloat(this.styles.left) + x) + 'px'
    })
  }

  translateY (y) {
    this.styles.set({
      top: (parseFloat(this.styles.top) + y) + 'px'
    })
  }

  translate (x, y) {
    this.styles.set({
      left: (parseFloat(this.styles.left) + x) + 'px',
      top: (parseFloat(this.styles.top) + y) + 'px'
    })
  }
}

export default Panel
