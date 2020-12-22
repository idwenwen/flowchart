/**
 * 链接内容
 */
import { UUID } from '@cc/tools'
import Diagram from '../../diagram'
import PanelManager from '../panelManager'
import config from './config'
import Curve from './curve'

// type Point = [number, number];

class GlobalLinking {
  // comps: Mapping<string, Linking>;

  set (name, content) {
    this.comps.set(name, content)
  }

  get (name) {
    return this.comps.get(name)
  }
}

export const globalComponents = new GlobalLinking()

const linkingId = new UUID()

class Linking {
  // uuid: string;
  // startPoint: Point; // 连接起始点
  // endPoint: Point; // 连接终点
  // panel: Panel;
  // from: Component 启始组件
  // end: Component 结束关联组件

  constructor (startPoint, endPoint, name, from, end) {
    this.uuid = name || linkingId.get().toString()
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.toSetting()
    this.from = from
    this.end = end
    globalComponents.set(this.uuid, this)
  }

  toParameter () {
    return {
      startPoint () {
        const point = [parseFloat(this.style.top), parseFloat(this.style.left)]
        const width = this.attrs.width
        const height = this.attrs.height
        return [
          point[0] + (height * config.panelBorder) / 2,
          point[1] + (width * config.panelBorder) / 2
        ]
      },
      endPoint () {
        const point = [parseFloat(this.style.top), parseFloat(this.style.left)]
        const width = this.attrs.width
        const height = this.attrs.height
        return [
          point[0] + height - (height * config.panelBorder) / 2,
          point[1] + width - (width * config.panelBorder) / 2
        ]
      },
      choosed: false
    }
  }

  toEvents () {
    return {
      choose: {
        variation: () => { this.choosed = true },
        time: 0
      },
      unchoose: {
        variation: () => { this.choosed = false },
        time: 0
      }
    }
  }

  combine () {
    return {
      data: this.toParameter(),
      events: this.toEvents(),
      children: [new Curve().toSetting()]
    }
  }

  toSetting () {
    const { pos, width, height } = this.getOrigin(
      this.startPoint,
      this.endPoint
    )
    const panel = new PanelManager().toSetting(
      width,
      height,
      pos
    )
    const diagram = this.combine()
    this.diagram = new Diagram(panel, diagram)
    this.PanelManager = this.diagram.panel
  }

  getOrigin (start, end) {
    const pos = [Math.min(start[0], end[0]), Math.min(start[1], end[1])]
    const bot = [Math.max(start[0], end[0]), Math.max(start[1], end[1])]
    const width = bot[1] - pos[1]
    const height = bot[0] - pos[0]
    const widthBorder = (width / (1 - config.panelBorder) - width) / 2
    const heightBorder = (height / (1 - config.panelBorder) - height) / 2
    pos[0] = pos[0] - heightBorder
    pos[1] = pos[1] - widthBorder
    return {
      pos,
      width: width / (1 - config.panelBorder),
      height: height / (1 - config.panelBorder)
    }
  }

  updatePanelAndDiagram () {
    const { pos, width, height } = this.getOrigin(
      this.startPoint,
      this.endPoint
    )
    this.panel.attrs.set({
      width,
      height
    })
    this.panel.style.set({
      top: pos[1] + 'px',
      left: pos[0] + 'px'
    })
  }

  changeStart (point) {
    this.startPoint = point
    this.updatePanelAndDiagram()
  }

  changeEnd (point) {
    this.endPoint = point
    this.updatePanelAndDiagram()
  }

  changePos (startPoint, endPoint) {
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.updatePanelAndDiagram()
  }

  setEndComp (end) {
    this.end = end
  }
}

export default Linking
