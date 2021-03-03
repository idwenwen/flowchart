import Diagram from '../../../diagram'
import PanelManager from '../../panelManager'
import PanelOperation from '../../panelManager/panelOperation'

export default class SubIcon extends PanelOperation {
  constructor (connectTo, width, height, point, img) {
    super()
    this.connectTo = connectTo
    this.panelManager = null
    this.flowPanel = this.connectTo.flowPanel
    this.img = img
    this.render(width, height, point)
  }

  getParameter () {
    return {
      img: this.img,
      center: function () {
        const height = parseFloat(this.attrs.height)
        const width = parseFloat(this.attrs.width)
        const top = parseFloat(this.styles.top)
        const left = parseFloat(this.styles.left)
        return [
          left + width / 2,
          top + height / 2
        ]
      },
      width: function () {
        return parseFloat(this.attrs.width)
      },
      height: function () {
        return parseFloat(this.attrs.height)
      }
    }
  }

  toSetting () {
    return {
      data: this.getParameter(),
      path: 'icon'
    }
  }

  // 展示当前内容。
  render (width, height, point) {
    const panelSetting = new PanelManager().toSetting(width, height, point, {}, {position: 'absolute'})
    const diagram = new Diagram(panelSetting, this.toSetting())
    this.diagram = diagram
    this.panelManager = diagram.panel
    this.flowPanel.append(this.panelManager.domContainer)
  }

  updatePostion (x, y) {

  }
}
