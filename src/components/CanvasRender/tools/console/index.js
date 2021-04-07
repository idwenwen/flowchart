const { default: GLOBAL } = require('../env')

class Exhibition {
  constructor () {
    this.console = GLOBAL.global.console
  }

  exhibition (level, content) {
    const cons = this.console[level.toLowerCase()] || this.console.log
    cons(content)
  }
  log (content) {
    this.console.log(content)
  }
  warn (content) {
    this.console.warn(content)
  }
  debug (content) {
    this.console.debug(content)
  }
  error (content) {
    this.console.error(content)
  }
}

const EXHIBITION = new Exhibition()
export default EXHIBITION
