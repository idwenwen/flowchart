import Panel from '../../panel'
import Callback from './callback'
import EventEmitterForDom from './eventEmmiter'
import GLOBAL from './global'

const preEvents = {
  mouseover (eve) {

  },
  mousemove (eve) {

  },
  mouseout (eve) {

  },
  click (eve) {
    // 点击了空白处，所以无选中
    eve.stopPropagation()
    GLOBAL.choosen.choose(null)
  }
}

export default class BackendPanel {
  constructor (parnet) {
    this.parnet = parnet // 当前canvas的父容器
    this.events = null // 记录本身带生命周期的事件
    this.emmiter = null // 自定义事件触发对象
    this.render()
    this.eventWorks()
  }

  // 绘制当前的全局canvas内容。
  render () {
    this.panel = new Panel({
      id: '_global_canvas',
      styles: {
        width: '100%',
        height: '100%',
        position: 'relative',
        outline: '0 none'
      }
    })
    this.parnet.append(this.panel)
  }
  append (dom) {
    this.panel.append(dom)
  }
  remove (dom) {
    this.panel.removeChild(dom)
  }

  // 当前组件的事件库。
  eventWorks () {
    this.emitter = new EventEmitterForDom(
      this.panel,
      this.eventPreSetting()
    )
  }
  eventPreSetting () {
    const res = {}
    const cb = {}
    for (const key in preEvents) {
      res[key] = new Callback(preEvents[key])
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
    this.emmiter.dispatch(type)
  }
}
