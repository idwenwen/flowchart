import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import Port from './each'
import { getPortConfig } from './portConfig'

export default class ContentPorts extends Tree {
  constructor (type, single = false, role) {
    super()
    this.figure = null
    this.type = type
    this.single = single
    this.role = role
    this.toRender()
  }

  getParameter () {
    return {
      radius: function () {
        return this.radius
      },
      width: function () {
        const times = 0.02
        const min = 12
        let width = this.width * times
        width = width < min ? min : width
        return width
      },
      actualWidth: function () {
        return this.width
      },
      height: function () {
        const times = 0.01
        const min = 4
        let width = this.width * times
        width = width < min ? min : width
        return width
      },
      actualHeight: function () {
        return this.height
      },
      center: function () {
        return this.center
      },
      status () {
        return this.status
      },
      type () {
        return this.type
      },
      disable () {
        return this.disable
      }
    }
  }

  toRender () {
    const port = getPortConfig(this.type, this.single)
    let childList = []

    port.input.forEach((val, index) => {
      const comp = new Port(val)
      comp.len = port.input.length
      comp.num = index
      childList.push(comp)
    })
    port.output.forEach((val, index) => {
      const comp = new Port(val)
      comp.len = port.output.length
      comp.num = index
      childList.push(comp)
    })
    this.setChildren(childList)

    const getFigures = function () {
      const final = []
      childList.forEach(val => {
        final.push(val.figure)
      })
      return final
    }

    this.figure = toFigure({
      data: this.getParameter(),
      children: getFigures()
    })
    return this.figure
  }

  inPort (position) {
    for (const val of this.getChildren()) {
      const mid = val.inPort(position)
      if (mid) return mid
    }
    return false
  }

  linkHint (type) {
    for (const val of this.getChildren()) {
      val.linkHint(type)
    }
  }

  checkHint (i, type, output = false) {
    for (const val of this.getChildren()) {
      const tip = val.checkWhichPort(i, type, output)
      if (tip) {
        return tip
      }
    }
  }

  dataOutputCount () {
    const list = this.getChildren()
    let count = 0
    for (const val of list) {
      if (val.name.match(/output/i) && val.name.match(/data/i)) {
        count++
      }
    }
    return count
  }

  modelOutputCount () {
    const list = this.getChildren()
    let count = 0
    for (const val of list) {
      if (val.name.match(/output/i) && val.name.match(/model/i)) {
        count++
      }
    }
    return count
  }
}
