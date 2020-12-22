import { toArray } from 'lodash'
import Panel from '../panel/indexs'
import { each } from '../../../tools/extension/iteration'
import renderController, { Drawable } from '../controller/drawing'

const { default: Figure, toFigure } = require('../figure')

class Diagram extends Figure {
  constructor (panelSetting, {name, data, path, events, animate, display, children}) {
    super(name, data, path, events, animate, display)
    // 构建figureTree
    each(toArray(children))(child => {
      const res = toFigure(child)
      this.child = res
    })

    panelSetting.diagram = this
    this._panel = new Panel(panelSetting)
    this.dataSupport(undefined, this._panel)
    this.render() // 首次创建自动渲染。
  }

  // 渲染当前的图形树
  render () {
    renderController.add(new Drawable(this._panel.dom, this.drawing))
  }

  set panel (panelSetting) {
    return (this._panel = new Panel(panelSetting))
  }
  get panel () {
    return this._panel
  }
}

export default Diagram
