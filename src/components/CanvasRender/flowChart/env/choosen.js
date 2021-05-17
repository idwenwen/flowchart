import Linking from '../linking'
import GLOBAL from './global'

export default class Choosen {
  constructor (main) {
    this.choosen = null
    this.emiter = main
  }

  choose (item) {
    this.emiter.setContext(item)
    this.emiter.dispatch('beforeChoose', this.choosen)
    if (this.choosen) {
      this.choosen.unchoosen && this.choosen.unchoosen()
    }
    this.choosen = item
    if (this.choosen) {
      this.choosen.choosen && this.choosen.choosen()
    }
    this.emiter.dispatch('afterChoose', this.choosen)
  }

  deleteChoose () {
    if (this.choosen) {
      if (this.choosen instanceof Linking) {
        GLOBAL.deleteLink(this.choosen)
      } else {
        GLOBAL.deleteComp(this.choosen.id || this.choosen.uuid, true, this.choosen)
      }
    }
  }
}
