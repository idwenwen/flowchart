
import { throttle } from 'lodash'
import Panel from '../../core/panel'
import { getPos } from '../utils'
import Callback from './callback'
import { EventEmitterForDom } from './eventEmitter'

let origin = null
let hasMoving = false
let isHolding = false
let sensible = true
const MOVING_FUNC = throttle(function (m, pos) {
  const x = pos[0] - origin[0]
  const y = pos[1] - origin[1]
  const list = Array.isArray(m) ? m : [m]
  for (const val of list) {
    val.translate({
      x, y
    })
  }
  origin = pos
}, 50)
// 对于当前移位的敏感性进行干预。
const SENSIBILITY = (pos) => {
  if (origin && sensible) {
    if (Math.abs(pos[0] - origin[0]) >= 10 || Math.abs(pos[1] - origin[1]) >= 10) {
      sensible = false
    }
  }
}

const preEvents = (global) => {
  return {
    mousedown (eve) {
      isHolding = true
      origin = getPos(eve, global.globalPanel.getOrigin())
    },
    mousemove (eve) {
      if (isHolding) {
        const l = global.linking.linking
        const pos = getPos(eve, global.globalPanel.getOrigin())
        SENSIBILITY(pos)
        if (l) {
          l.changing(pos)
          hasMoving = true
        }
        const m = global.moving.getMove()
        if (m && !sensible) {
          MOVING_FUNC(m, pos)
          m.lastStatus = 'moving'
          hasMoving = true
        }
        if (!l && !m) {
        // 表示当前的内容是全局移动。
          const changing = global.getComps()
          MOVING_FUNC(changing, pos)
        }
      }
    },
    mouseup (eve) {
      if (isHolding) {
        const l = global.linking.linking
        const pos = getPos(eve, global.globalPanel.getOrigin())
        SENSIBILITY(pos)
        if (l) {
          global.createConnection(pos)
        }
        const m = global.moving.getMove()
        if (m) {
          MOVING_FUNC(m, pos)
          global.moving.setMove()
        }
      }
      isHolding = false
    },
    mouseenter (eve) {
      if (isHolding) {
        const current = eve.target || eve.srcElement
        const pos = getPos(eve, global.globalPanel.getOrigin())
        if (current === global.globalPanel.getOrigin()) {
          const l = global.linking.linking
          if (l) {
            global.createConnection(pos)
          }
          const m = global.moving.getMove()
          if (m) {
            MOVING_FUNC(m, pos)
            global.moving.setMove()
          }
          isHolding = false
        }
      }
    },
    click (eve) {
    // 点击了空白处，所以无选中
    // eve.stopPropagation()
      if (!hasMoving) {
        global.choosen.choose(global.belongTo(getPos(eve, global.globalPanel.getOrigin())) || null)
      }
      hasMoving = false
      sensible = true
    },
    keydown (eve) {
      const keyCode = eve.keyCode
      if (keyCode === 8 || keyCode === 27 || keyCode === 46) {
        global.choosen.deleteChoose()
      }
    }
  }
}

export default class BackendPanel {
  constructor (global, parent) {
    this.global = global
    this.events = null // 记录本身带生命周期的事件
    this.emitter = null // 自定义事件触发对象
    this.render()
    this.setParent(parent)
    this.eventWorks()
  }

  // 绘制当前的全局canvas内容。
  render () {
    this.panel = new Panel({
      id: '_global_canvas',
      attrs: {
        tabindex: '-1'
      },
      styles: {
        width: '100%',
        height: '100%',
        position: 'relative',
        outline: '0 none'
      }
    })
  }
  append (dom) {
    this.panel.append(dom)
  }
  remove (dom) {
    this.panel.remove(dom)
  }
  setParent (parent) {
    this.parent = parent
    if (this.parent) {
      this.parent.append(this.panel.getOrigin())
    }
  }
  moveoutFromParent () {
    this.parent.removeChild(this.panel.getOrigin())
  }

  // 当前组件的事件库。
  eventWorks () {
    this.emitter = new EventEmitterForDom(
      this.panel.getOrigin(),
      this.eventPreSetting()
    )
  }
  eventPreSetting () {
    const res = {}
    const cb = {}
    const events = preEvents(this.global)
    for (const key in events) {
      res[key] = new Callback(events[key])
      cb[key] = res[key].bind()
    }
    this.events = res
    return cb
  }
  eventBefore (type, logic) {
    const cbObj = this.events[type]
    if (cbObj) { cbObj.addBefore(logic) }
  }
  eventAfter (type, logic) {
    const cbObj = this.events[type]
    if (cbObj) { cbObj.addAfter(logic) }
  }
  // 触发自定义事件
  eventDispatch (type) {
    this.emitter.dispatch(type)
  }

  getOrigin () {
    return this.panel.domContainer
  }
  getCanvas () {
    return this.panel.dom
  }
  release () {
    this.events = null
    this.emitter.clearUp()
    this.panel.release()
    this.global = null
  }
}
