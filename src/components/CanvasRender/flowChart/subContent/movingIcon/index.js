import Diagram from '../../../diagram'
import { icons } from '../../loadImage'
import PanelManager from '../../panelManager'
import PanelOperation from '../../panelManager/panelOperation'

export default class MovingIcon extends PanelOperation {
  constructor (connectTo, width, height, point) {
    super()
    this.connectTo = connectTo
    this.panelManager = null
    this.img = icons.complete
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
      path: 'icon',
      event: {
        toError () {
          this.image = icons.error
        },
        toSuccess () {
          this.image = icons.complete
        }
      }
    }
  }

  // 展示当前内容。
  render (width, height, point) {
    const _t = this
    const panelSetting = new PanelManager().toSetting(width, height, point, {}, {position: 'absolute'})
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
}
