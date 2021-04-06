class Env {
  constructor () {
    this.global = window || global
  }
}

const GLOBAL = new Env()
export default GLOBAL
