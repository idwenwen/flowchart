export default class Choosen {
  constructor (main) {
    this.choosen = null
    this.emiter = main
  }

  choose (item) {
    this.emiter.setContext(item)
    this.emiter.dispatch('beforeChoose', this.choose)
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
      this.choosen.clearUp()
    }
  }
}
