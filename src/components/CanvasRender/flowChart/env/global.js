import Choosen from './choosen'
import Linking from './linking'
import Moving from './moving'

class Global {
  constructor () {
    this.choosen = new Choosen()
    this.linking = new Linking()
    this.moving = new Moving()

    this.globalComp = new Map()
    this.globalLinking = new Map()
    this.globalHint = new Map()
  }

  registerComp (id, comp) {
    this.globalComp.set(id, comp)
  }
  registerLinking (id, comp) {
    this.globalLinking.set(id, comp)
  }
  registerHint (id, comp) {
    this.globalHint.set(id, comp)
  }

  removeComp (id) {
    this.globalComp.delete(id)
  }
  removeLinking (id) {
    this.globalLinking.delete(id)
  }
  removeHint (id) {
    this.globalHint.delete(id)
  }
}

const GLOBAL = new Global()

export default GLOBAL
