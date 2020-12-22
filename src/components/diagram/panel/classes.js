const { setClass } = require('../../../tools/extension/dom')
const { default: Attributes } = require('./attrs')

class Classes extends Attributes {
  setClass (dom) {
    setClass(dom, this.attrs)
  }
}

export default Classes
