import { throttle, isArray, isNil } from 'lodash'
import { create } from '../../../tools/extension/dom'
import { each } from '../../../tools/extension/iteration'
import Watcher from '../../../tools/observer/watcher'
import { default as Attributes } from './attrs'
import Classes from './classes'
import { default as Styles } from './styles'
import Transform from './transform'

class Panel {
  static EventBetween = 20
  // content: Diagram
  // Dom : HTMLElement
  // attrs : 常用属性设置
  // styles : 样式表设置。
  // transform : 变换情况。
  // classes : 样式列表
  constructor ({id, attrs = {}, styles = {}, transform, classes, events, diagram}) {
    this.dom = create('canvas')
    this.id = id
    this.diagram = diagram
    if (id) attrs.id = id

    this._attrs = new Attributes(attrs)
    this._styles = new Styles(this.transformToStyle(styles))
    this._transform = new Transform(transform)
    this._classes = new Classes(classes)
    this._events = events

    this.attrs = this._attrs.proxy()
    this.styles = this._styles.proxy()
    this.transform = this._transform.proxy()
    this.classes = this._classes.proxy()
    this.connection()
    this.willUpdate()
    this._setEvents()
  }

  transformToStyle (styleSetting) {
    function splicing (str, ...checked) {
      let res = each(str)((val, index) => {
        val = val.replace(')', '').replace(' ', '')
        if (val.search('scale') >= 0) {
          if (checked[index] !== 1) {
            return val + '(' + checked[index] + ')'
          }
        } else if (val !== '') {
          if (checked[index] !== 0) {
            return val + '(' + checked[index] + ')'
          }
        }
        return ''
      }).join(' ')
      if (res.search(/[a-zA-Z]/) < 0) {
        res = ''
      }
      return res
    }
    styleSetting.translate =
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
    this._styles.accordingTo(this)
  }

  willUpdate () {
    const _t = this
    this._attrs.subscribe()
    this.attrWatcher = new Watcher(this.attrs, function () {
      if (this && this['origin'] && this['origin'].attrs) {
        const keys = Object.keys(this['origin'].attrs)
        // eslint-disable-next-line no-constant-condition
        if (!isNil(this['origin'].attrs[keys[0]]) || true) { return this }
      }
    }, () => {
      _t._attrs.setAttributes(_t.dom)
    })

    this._styles.subscribe()
    let stylesOrigin = null
    this.styleWatcher = new Watcher(this.styles, function () {
      if (this && this['origin'] && this['origin'].cache) {
        const keys = Object.keys(this['origin'].cache)
        if (!stylesOrigin) stylesOrigin = this
        // eslint-disable-next-line no-constant-condition
        if (!isNil(this['origin'].cache[keys[0]]) || true) { return this }
      }
    }, (_result) => {
      _t._styles.setStyle(_t.dom)
      if (stylesOrigin.width !== _result.width || stylesOrigin.height !== _result.height) {
        // 当宽高变化的时候重新渲染当前内容。
        _t.diagram.render()
        stylesOrigin = _result
      }
    })

    this._classes.subscribe()
    this.classWatcher = new Watcher(this.classes, function () {
      if (Object.keys(this).length >= 0) {
        return this
      }
    }, () => {
      _t._classes.setClass(_t.dom)
    })
  }

  _setEvents (setting) {
    const _t = this
    setting = setting || this._events
    if (setting) {
      each(setting)((val, key) => {
        const thro = throttle((eve) => {
          const list = isArray(_t._events[key]) ? _t._events[key] : [_t._events[key]]
          each(list)(item => {
            item.call(_t, eve)
          })
        }, Panel.EventBetween)
        this.dom.addEventListener(key, (eve) => {
          thro(eve)
        })
      })
    }
  }

  addEvents (type, func) {
    const origin = this._events[type] || []
    const list = isArray(func) ? func : [func]
    origin.push(...list)
    this._events = origin
  }

  removeEvents (type, from, len) {
    const origin = this._events[type] || []
    const res = origin.splice(from, len)
    this._events = origin
    return res
  }

  translateX (x) {
    this.styles.left = (parseFloat(this.styles.left) + x) + 'px'
  }

  translateY (y) {
    this.styles.top = (parseFloat(this.styles.top) + y) + 'px'
  }

  translate (x, y) {
    this.styles.left = (parseFloat(this.styles.left) + x) + 'px'
    this.styles.top = (parseFloat(this.styles.top) + y) + 'px'
  }

  measureText (text, fontStyle = {}) {
    if (this.dom && this.dom.getContext) {
      const ctx = this.dom.getContext('2d')
      each(fontStyle)((item, key) => {
        ctx[key] = item
      })
      return ctx.measureText(text)
    }
    return null
  }

  hidden () {
    this.styles.disable = 'none'
  }

  showing () {
    this.styles.disable = 'auto'
  }
}

export default Panel

export const calculateCanvas = new Panel({id: '_calculate_Panel', attrs: {width: 500, height: 500}})
