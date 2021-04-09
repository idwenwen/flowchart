import Panel from '../panel'
import { each, toArray } from '../../tools/iteration'
import renderController, { Drawable } from '../controller/drawing'

const { default: Figure, toFigure } = require('../figure')

class Diagram extends Figure {
  constructor (panelOrSetting, {name, data, path, events, animate, display, children}) {
    super(name, data, path, events, animate, display)
    const _t = this
    if (panelOrSetting instanceof Panel) {
      panelOrSetting.diagram = this
      this._panel = panelOrSetting
    } else {
      panelOrSetting.diagram = this
      this._panel = new Panel(panelOrSetting)
    }
    this.dataSupport(undefined, this._panel)
    // 构建figureTree
    each(toArray(children))(child => {
      toFigure(child, _t)
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
