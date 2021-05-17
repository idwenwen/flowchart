import Diagram from '../../../diagram'
import PanelManager from '../../panelManager'
import PanelOperation from '../../panelManager/panelOperation'

export default class SubIcon extends PanelOperation {
  constructor (connectTo, width, height, point, img) {
    super()
    this.connectTo = connectTo
    this.panelManager = null
    this.img = img
    this.render(width, height, point)
  }

  getParameter () {
    return {
      image: this.img,
      center: function () {
        const height = parseFloat(this.attrs.height)
        const width = parseFloat(this.attrs.width)
        return [
          width / 2,
          height / 2
        ]
      },
      width: function () {
        return parseFloat(this.attrs.width) - 10
      },
      height: function () {
        return parseFloat(this.attrs.height) - 10
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
    const _t = this
    const panelSetting = new PanelManager().toSetting(width, height, point, {}, { position: 'absolute' })
    const diagram = new Diagram(panelSetting, this.toSetting())
    this.diagram = diagram
    this.panelManager = diagram.panel
    this.connectTo.panelManager.domContainer.append(this.panelManager.domContainer)
    _t.diagram.render()
  }

  disRender () {
    this.connectTo.panelManager.domContainer.removeChild(this.panelManager.domContainer)
    this.destory()
  }

  destory () {
    this.img = null
    this.panelManager = null
    this.connectTo = null
  }

  updatePostion (x, y) {
    this.panelManager.attr.point[0] += x
    this.panelManager.attr.point[1] += y
  }
}
