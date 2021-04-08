import Diagram from '../../diagram'
import PanelManager from '../panelManager'
import config from './config'
import PanelOperation from '../panelManager/panelOperation'
import UUID from '../../tools/uuid'

const ICONId = new UUID(index => `icon_${index}`)

function getImage (type, disable) {
  return type
}

class ICONPanel extends PanelOperation {
  constructor (pos, width, height, type, disable) {
    super()
    this.uuid = ICONId.get()
    const panel = new PanelManager({
      width,
      height,
      point: pos
    }).panel
    const diagramSetting = this.toSetting(type, disable)
    this.diagram = new Diagram(panel, diagramSetting)
  }

  toParameter (type) {
    return {
      image: getImage(type),
      width () {
        return this.attrs.width * (1 - config.panelBorder)
      },
      height () {
        return this.attrs.height * (1 - config.panelBorder)
      },
      center () {
        return [
          this.attrs.width / 2,
          this.attrs.height / 2
        ]
      }
    }
  }

  toSetting (type, disable) {
    return {
      data: this.toParameter(type, disable),
      path: 'icon'
    }
  }
}
export default ICONPanel

export function createIcon (setting) {
  return new ICONPanel(setting.pos, setting.width, setting.height, setting.type)
}
