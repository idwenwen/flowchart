import Choosen from './choosen'
import Linking from './linking'

export default class Global {
  constructor () {
    this.choosen = new Choosen()
    this.linking = new Linking()
  }
}
