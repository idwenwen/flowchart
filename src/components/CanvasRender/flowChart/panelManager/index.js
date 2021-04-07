import UUID from '../../tools/uuid'
import { toArray } from '../../tools/extension/iteration'
import PanelOperation from './panelOperation'
import Panel from '../../core/panel'

const PanelId = new UUID((index) => `panel_${index}`)

function getLeftTop (width, height, position) {
  if (!position) {
    return PanelManager.point
  } else {
    return [
      position[0] - width / 2,
      position[1] - height / 2
    ]
  }
}

// 当前组件主要用于管理Panel内容的相关推算以及diagram之中Panel对象的修改
class PanelManager extends PanelOperation {
  static width = 240;
  static height = 55;
  static point = [0, 0];

  // uuid: string; // 唯一标识符

  constructor (setting) {
    super()
    // 当前panel的设置内容。
    this.uuid = PanelId.get().toString()
    this.panel = null
    this.toRender(setting)
  }

  // panel内容设置。
  getParameter (
    width,
    height,
    point,
    attrs,
    style = {},
    transform = {},
    classes
  ) {
    return {
      id: this.uuid,
      attrs: Object.assign({}, attrs, {
        width: width || PanelManager.width,
        height: height || PanelManager.height,
        point
      }),
      styles: Object.assign(
        {
          position: 'absolute', // 绝对布局形式
          top () {
            return this.attrs.point[1] + 'px'
          }, // 绝对布局上偏移
          left () {
            return this.attrs.point[0] + 'px'
          }, // 绝对布局左偏移
          width () {
            return this.attrs.width + 'px'
          },
          height () {
            return this.attrs.height + 'px'
          },
          'z-index': 2
        },
        style
      ),
      transform,
      classes: toArray(classes)
    }
  }

  toRender (
    {
      width = PanelManager.width,
      height = PanelManager.height,
      point,
      attrs,
      style,
      transform,
      classes,
      events
    }
  ) {
    point = getLeftTop(width, height, point)
    this.panel = new Panel(
      Object.assign(
        this.getParameter(width, height, point, attrs, style, transform, classes),
        {events}
      )
    )
    return this.panel
  }
}

export default PanelManager
