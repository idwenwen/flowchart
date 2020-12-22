import { UUID } from '@cc/tools'
import { toArray } from 'lodash'

const PanelId = new UUID((index) => `panel_${index}`)

// 当前组件主要用于管理Panel内容的相关推算以及diagram之中Panel对象的修改
class PanelManager {
  static width = 400;
  static height = 150;
  static point = [0, 0];

  // uuid: string; // 唯一标识符

  constructor () {
    this.uuid = PanelId.get().toString()
    // 当前panel的设置内容。
  }

  // panel内容设置。
  panelSetting (
    width,
    height,
    point,
    style = {},
    transform = {},
    classes
  ) {
    return {
      id: this.uuid,
      attrs: {
        width: width,
        height: height
      },
      style: Object.assign(
        {
          position: 'absolute', // 绝对布局形式
          top: point[1] + 'px', // 绝对布局上偏移
          left: point[0] + 'px', // 绝对布局左偏移
          width () {
            return this.width + 'px'
          },
          height () {
            return this.height + 'px'
          }
        },
        style
      ),
      transform,
      classes: toArray(classes)
    }
  }

  toSetting (
    width = PanelManager.width,
    height = PanelManager.height,
    point = PanelManager.point,
    style,
    transform,
    classes
  ) {
    return this.panelSetting(width, height, point, style, transform, classes)
  }

  getPos (panel) {
    return [
      parseFloat(panel.style.get('left')),
      parseFloat(panel.style.get('top'))
    ]
  }

  getWidth (panel) {
    return panel.attrs.get('width')
  }

  getHeight (panel) {
    return panel.attrs.get('height')
  }
}

export default PanelManager
