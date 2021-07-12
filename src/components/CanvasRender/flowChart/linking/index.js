/**
 * 链接内容
 */
import UUID from '../../tools/uuid'
import PanelManager from '../panelManager'
import config from './config'
import Curve from './curve'
import Tree from '../../tools/tree'
import Diagram from '../../core/diagram'
import { getPos } from '../utils'

const linkingId = new UUID()
class Linking extends Tree {
  // uuid: string;
  // startPoint: Point; // 连接起始点
  // endPoint: Point; // 连接终点
  // panel: Panel;
  // from: Component 启始组件
  // end: Component 结束关联组件

  constructor (global, startPoint, endPoint, from, end, id) {
    super()
    this.global = global
    if (id) {
      this.uuid = id
      linkingId.set()
    } else {
      this.uuid = linkingId.get().toString()
    }
    this.startPoint = startPoint
    this.endPoint = endPoint

    // 当前连出与连入组件
    this.from = from
    this.end = end

    // 连出端口与连入端口
    this.fromPort = null
    this.endPort = null

    this.toRender()
    // 注册当前的连线内容
    this.global.registerLinking(this.uuid, this)
  }

  // figure的相关配置
  getParameter () {
    const _t = this
    return {
      startPoint () {
        return this.attrs.startPoint
      },
      endPoint () {
        return this.attrs.endPoint
      },
      leftTop () {
        return this.attrs.point
      },
      choosed () {
        return _t.isChoose
      },
      save () {
        return _t.saved
      }
    }
  }
  getEvents () {
    const _t = this
    return {
      isSaving () {
        _t.saved = false
        this.saved = false
      },
      hasSave () {
        _t.saved = true
        this.saved = true
      },
      choose () {
        _t.isChoose = true
        this.choosed = true
      },
      unchoose () {
        _t.isChoose = false
        this.choosed = false
      }
    }
  }

  // 获取当前的panel本身的大小
  _getOrigin (start, end) {
    const pos = [Math.min(start[0], end[0]), Math.min(start[1], end[1])]
    const bot = [Math.max(start[0], end[0]), Math.max(start[1], end[1])]
    const width = bot[0] - pos[0]
    const height = bot[1] - pos[1]
    const widthBorder = config.panelBorder
    const heightBorder = config.panelBorder
    pos[0] = pos[0] - heightBorder
    pos[1] = pos[1] - widthBorder
    return {
      pos,
      width: width + widthBorder * 2,
      height: height + widthBorder * 2
    }
  }
  getPanelParameter () {
    const { pos, width, height } = this._getOrigin(
      this.startPoint,
      this.endPoint
    )
    pos[0] = pos[0] + width / 2
    pos[1] = pos[1] + height / 2
    return {
      width,
      height,
      point: pos,
      attrs: {
        startPoint: this.startPoint,
        endPoint: this.endPoint
      }
    }
  }
  getPanelEvents () {
    const _t = this
    return {
      click: function (eve) {
        if (_t.figure.isPointInFigure(getPos(eve), true)) {
          _t.global.choosen.choose(_t)
          eve.stopPropagation()
        }
      }
    }
  }

  toRender () {
    this.panel = new PanelManager(
      Object.assign({}, this.getPanelParameter(), { events: this.getPanelEvents() })
    ).panel
    this.setChildren([
      new Curve()
    ])
    this.figure = new Diagram(this.panel, {
      data: this.getParameter(),
      events: this.getEvents(),
      children: (() => {
        const res = []
        this.getChildren().forEach(val => {
          res.push(val.figure)
        })
        return res
      })()
    })
    this.global.globalPanel.append(this.panel)
    return this.figure
  }

  // 当前内容为位移改变
  updatePanelAndDiagram () {
    const { pos, width, height } = this._getOrigin(
      this.startPoint,
      this.endPoint
    )
    this.panel.attrs.origin.set({
      width,
      height,
      point: pos,
      startPoint: this.startPoint,
      endPoint: this.endPoint
    })
  }
  translateStart (x, y) {
    const origin = this.startPoint
    this.startPoint = [origin[0] + x, origin[1] + y]
    this.updatePanelAndDiagram()
  }
  translateEnd (x, y) {
    const origin = this.endPoint
    this.endPoint = [origin[0] + x, origin[1] + y]
    this.updatePanelAndDiagram()
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
  changing (point) {
    if (this.from) {
      this.changeEnd(point)
    } else if (this.end) {
      this.changeStart(point)
    }
  }

  // 选中事件触发
  choosen () {
    this.figure.dispatchEvents('choose')
  }
  unchoosen () {
    this.figure.dispatchEvents('unchoose')
  }

  linkStart () {
    this.panel.styles['z-index'] = 3
  }
  linkEnd () {
    this.panel.styles['z-index'] = 1
    this.figure.dispatchEvents('toSolid')
  }

  clearUp () {
    // 清除异己解绑当前的数据关系
    this.global.globalPanel.remove(this.panel)
    this.global.globalLinking.delete(this.uuid)
    if (this.from) {
      this.from.closeConnect(this)
    }
    if (this.end) {
      this.end.closeConnect(this)
    }
  }
}

export default Linking
