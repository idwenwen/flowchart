import { EventEmitter } from './eventEmmiter'

export default class Choosen {
  constructor () {
    this.choosen = null
    this.emiter = new EventEmitter()
  }

  choose (item) {
    this.emiter.setContext(item)
    this.emiter.dispatch('before')
    this.choosen = item
    this.emiter.dispatch('after')
  }
}
