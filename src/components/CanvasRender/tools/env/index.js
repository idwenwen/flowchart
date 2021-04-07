class Env {
  constructor () {
    this.global = window || global
  }
}

const GLOBAL_CONFIG = new Env()
export default GLOBAL_CONFIG
