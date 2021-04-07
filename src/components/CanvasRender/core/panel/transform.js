import { cloneDeep, remove } from 'lodash'
import { each } from '../tools/extension/iteration'

const { default: Attributes } = require('./attrs')

const BasicTrans = {
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  rotateX: 0,
  rotateY: 0
}

function format (cus, standard) {
  const attrs = Object.assign({}, standard, cloneDeep(cus))
  const attrKeys = Object.keys(attrs)
  const standardKeys = Object.keys(standard)
  remove(attrKeys, item => standardKeys.find(val => val === item))
  each(attrKeys)(val => {
    delete attrs[val]
  })
  return attrs
}

class Transform extends Attributes {
  constructor (trans) {
    super(format(trans, BasicTrans))
  }

  rotate (angle) {
    this.attrs.rotateX = angle
    this.attrs.rotateY = -angle
  }

  translate (x, y) {
    this.attrs.translateX = x
    this.attrs.translateY = y
  }

  scale (times) {
    this.attrs.scaleX = times
    this.attrs.scaleY = times
  }
}

export default Transform
