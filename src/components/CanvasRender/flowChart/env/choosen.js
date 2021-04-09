import { EventEmitter } from './eventEmitter'

export default class Choosen {
  constructor () {
    this.choosen = null
    this.emiter = new EventEmitter({
      'before': function (choosed) {
        // 触发当前组件的unchoose事件
        choosed.figure.dispatchEvents('unchoose')
      }
    })
  }

  choose (item) {
    this.emiter.setContext(item)
    this.emiter.dispatch('before', this.choose)
    this.choosen = item
    this.choosen.choose && this.choosen.choose()
    this.emiter.dispatch('after', this.choosen)
  }
}
