import Panel from '../panel'
import { each, toArray } from '../../../tools/extension/iteration'
import renderController, { Drawable } from '../controller/drawing'

const { default: Figure, toFigure } = require('../figure')

class Diagram extends Figure {
  constructor (panelSetting, {name, data, path, events, animate, display, children}) {
    super(name, data, path, events, animate, display)
    panelSetting.diagram = this
    this._panel = new Panel(panelSetting)
    this.dataSupport(undefined, this._panel)
    // 构建figureTree
    each(toArray(children))(child => {
      toFigure(child, this)
    })
    // this.render() // 首次创建自动渲染。
  }

  // 渲染当前的图形树
  render () {
    if (this._panel && this._panel.dom) {
      renderController.add(new Drawable(this._panel.dom, this.drawing(), this._uuid, this))
    }
  }

  set panel (panelSetting) {
    return (this._panel = new Panel(panelSetting))
  }
  get panel () {
    return this._panel
  }
}

export default Diagram
