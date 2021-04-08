import { toChain } from '../../../core/controller/action'
import Action from '../../../core/controller/action/action'
import Diagram from '../../../core/diagram'
import Tree from '../../../tools/tree'
import UUID from '../../../tools/uuid'
import GLOBAL from '../../env/global'
import PanelManager from '../../panelManager'
import HintBorder from './hintBorder'
import HintContent from './hintContent'

const hintUUID = new UUID((index) => `hint_${index}`)

export default class LinkHint extends Tree {
  constructor (main) {
    super()
    this.id = hintUUID.get()
    this.main = main // 存储当前对照的port信息
    this.figure = null
    this.panel = null
    this.toRender()

    // 存储到全局内容之中。
    GLOBAL.registerHint(this.id, this)
  }

  getParameter () {
    return {
      width () {
        return this.attr.width * 0.9
      },
      height () {
        return this.attr.height * 0.9
      },
      center () {
        return [
          this.attr.width / 2,
          this.attr.height / 2
        ]
      }
    }
  }

  getPanelParameter () {
    const rectWidth = 35
    const point = this.main.figure.center
    return {
      width: rectWidth,
      height: rectWidth,
      point
    }
  }

  displayAnimate () {
    let originWidth = null
    let originHeight = null
    return toChain([{
      variation (progress) {
        if (!originWidth) originWidth = this.width
        if (!originHeight) originHeight = this.height
        this.width = Action.get('number')(progress, 0, originWidth)
        this.height = Action.get('number')(progress, 0, originHeight)
      },
      time: 500
    }, {
      variation (_progress) {
        originWidth = null
        originHeight = null
      },
      time: 0
    }])
  }

  hiddenAnimate () {
    const _t = this
    let originWidth = null
    let originHeight = null
    return toChain([{
      variation (progress) {
        if (!originWidth) originWidth = this.width
        if (!originHeight) originHeight = this.height
        this.width = Action.get('number')(progress, originWidth, 0)
        this.height = Action.get('number')(progress, originWidth, 0)
      },
      time: 500
    }, {
      variation (_progress) {
        originWidth = null
        originHeight = null
        _t.clearUp()
      },
      time: 0
    }])
  }

  toRender () {
    this.panel = new PanelManager(this.getPanelParameter()).panel
    this.setChildren([
      new HintContent(),
      new HintBorder()
    ])
    this.figure = new Diagram(this.panel, {
      data: this.getParameter(),
      animates: {
        showOn: this.displayAnimate
      },
      children: (() => {
        const res = []
        this.getChildren().forEach(val => {
          res.push(val.figure)
        })
        return res
      })()
    })
    // 主组件内容之中添加当前内容的panel信息
    this.main.root().panel.append(this.panel)
    return this.figure
  }

  linkInto (pos) {
    // 在当前范围内的时候，将当前内容的port的相关内容关联起来。
    if (this.figure.isPointInPath(pos)) {
      return this.main
    }
    return false
  }

  clearUp () {
    const root = this.main.root()
    root.panel.remove(this.panel)
    GLOBAL.removeHint(this.id)
  }
}