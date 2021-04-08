/**
 * 链接内容
 */
import UUID from '../../tools/uuid'
import { each } from '../../tools/extension/iteration'
import Diagram from '../../diagram'
import { getMainCanvas } from '../canvas'
import PanelManager from '../panelManager'
import { compareToPos } from '../utils'
import config from './config'
import Curve from './curve'
import { Exception } from '../../tools/exception'
import Tree from '../../tools/tree'
import GLOBAL from '../env/global'

const linkingId = new UUID()
class Linking extends Tree {
  // uuid: string;
  // startPoint: Point; // 连接起始点
  // endPoint: Point; // 连接终点
  // panel: Panel;
  // from: Component 启始组件
  // end: Component 结束关联组件

  constructor (startPoint, endPoint, from, end) {
    super()
    this.uuid = name || linkingId.get().toString()
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
    GLOBAL.registerLinking(this.uuid, this)
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
    return {
      'click': function (eve) {

      }
    }
  }

  toRender () {
    this.panel = new PanelManager(
      Object.assign({}, this.getPanelParameter(), {events: this.getPanelEvents()})
    ).panel
    this.setChildren([
      new Curve()
    ])
    this.figure = new Diagram(this.panel, {
      data: this.getParameter(),
      events: this.getEvents(),
      children: (() => {
        const res = []
        this.children.forEach(val => {
          res.push(val.figure)
        })
        return res
      })()
    })
  }

  // 当前内容为位移改变
  updatePanelAndDiagram () {
    const { pos, width, height } = this.getOrigin(
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
  changeStart (point) {
    this.startPoint = point
    this.updatePanelAndDiagram()
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
  changeEnd (point) {
    this.endPoint = point
    this.updatePanelAndDiagram()
  }
  changePos (startPoint, endPoint) {
    this.startPoint = startPoint
    this.endPoint = endPoint
    this.updatePanelAndDiagram()
  }

  // 选中事件触发
  choose () {
    this.diagram.dispatchEvents('choose')
  }
  unchoose () {
    this.diagram.dispatchEvents('unchoose')
  }

  linkStart () {
    this.panel.styles['z-index'] = 3
  }
  linkEnd () {
    this.panel.styles['z-index'] = 1
  }

  clearUp () {
    // 清除异己解绑当前的数据关系
    GLOBAL.globalPanel.remove(this.panel)
  }
}

export default Linking

function findInTree (comp, name) {
  let point = [0, 0]
  comp.diagram.notify(function () {
    if (this.data.cache.name && this.data.cache.name === name) {
      point = this.data.cache.center
      point = compareToPos(point, this.root().panel.dom, getMainCanvas().canvas)
      throw new Exception('BreakingException', 'Ending iteration', Exception.level.Warn)
    }
  })
  return point
}

export function linkComps (fromComp, toComp, fromPort, toPort) {
  const fromPortName = fromPort.join('|') + '_Output'
  const toPortName = toPort.join('|') + '_Input'
  const from = findInTree(fromComp, fromPortName)
  const end = findInTree(toComp, toPortName)
  const linking = new Linking(from, end, null, fromComp, toComp)
  linking.fromPort = (() => {
    let res = null
    each(fromComp.borderPorts[fromPort[0] + 'Output'])(function (port) {
      if (port.name === fromPortName) {
        res = port
        throw new Exception('BreakingException', 'Ending iteration', Exception.level.Warn)
      }
    })
    return res
  })()
  linking.endPort = (() => {
    let res = null
    each(toComp.borderPorts[toPort[0] + 'Input'])(function (port) {
      if (port.name === toPortName) {
        res = port
        throw new Exception('BreakingException', 'Ending iteration', Exception.level.Warn)
      }
    })
    return res
  })()
  getMainCanvas().container.append(linking.panelManager.domContainer)
  linking.diagram.dispatchEvents('linkSuccessed')
  return linking
}
