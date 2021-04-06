export default class Exception extends Error {
  constructor (alias, msg) {
    super(msg)
    this.alias = alias
  }

  toMsg () {
    return `${this.alias}: ${this.msg}`
  }
}
