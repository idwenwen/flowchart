/**
 * 链接内容
 */
import UUID from '@/tools/uuid'
import { each } from '../../../../tools/extension/iteration'
import Diagram from '../../diagram'
import { getCurrentLink, getMainCanvas, linkingFail, setChoosen } from '../canvas'
import PanelManager from '../panelManager'
import { compareToPos, getPos } from '../utils'
import config from './config'
import Curve from './curve'
import { globalComponents } from '../components'
import { Exception } from '../../../../tools/exception'

// type Point = [number, number];

class GlobalLinking {
  // comps: Mapping<string, Linking>;
  constructor () {
    this.comps = new Map()
  }

  set (name, content) {
    this.comps.set(name, content)
  }

  get (name) {
    return this.comps.get(name)
  }

  delete (name) {
    this.comps.delete(name)
  }
}

export const globalLinking = new GlobalLinking()

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
    this.fromPort = null
    this.endPort = null
    this.isChoose = false
    this.saved = true
    globalLinking.set(this.uuid, this)
  }

  toParameter () {
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

  toEvents () {
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
      },
      linkSuccessed () {
        _t.diagram.dispatchEvents('toSolid')
        _t.diagram.panel.styles['z-index'] = 1
      },
      linkFailedCheck () {
        linkingFail()
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

  toPanelEvents () {
    const _t = this
    return {
      'mouseup': function originMouseup (eve) {
        // 删除当前的currentlink都要验证
        const curret = getCurrentLink()
        if (eve.target === curret.panelManager.dom) {
          each(globalComponents.comps)(function (val, key) {
            each(val)(content => {
              content.diagram.dispatchEvents('linkInto', eve, getPos(eve, content.panelManager.dom))
              content.diagram.dispatchEvents('linkHide')
            })
          })
          _t.diagram.dispatchEvents('linkFailedCheck')
        }
      },
      'click': function originClick (eve) {
        if (this.diagram.isPointInFigure(getPos(eve))) {
          setChoosen(_t)
        }
      }
    }
  }

  toSetting () {
    const { pos, width, height } = this.getOrigin(
      this.startPoint,
      this.endPoint
    )
    pos[0] = pos[0] + width / 2
    pos[1] = pos[1] + height / 2
    const panel = new PanelManager().toSetting(
      width,
      height,
      pos,
      {
        startPoint: this.startPoint,
        endPoint: this.endPoint
      }
    )
    panel.events = this.toPanelEvents()
    const diagram = this.combine()
    this.diagram = new Diagram(panel, diagram)
    this.panelManager = this.diagram.panel
  }

  getOrigin (start, end) {
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

  updatePanelAndDiagram () {
    const { pos, width, height } = this.getOrigin(
      this.startPoint,
      this.endPoint
    )
    this.panelManager.attrs.origin.set({
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

  setEndComp (end) {
    this.end = end
  }

  choose () {
    this.diagram.dispatchEvents('choose')
  }

  unchoose () {
    this.diagram.dispatchEvents('unchoose')
  }

  deleteComponent () {
    this.from.deleteLinkOut(this.fromPort.type, this)
    this.end.deleteLinkIn(this.endPort.type, this)
    this.fromPort.hasConnect = false
    this.endPoint.hasConnect = false

    getMainCanvas().container.removeChild(this.panelManager.dom)

    this.from = null
    this.end = null
    this.endPoint = null
    this.fromPoint = null
    this.panelManager = null
    this.diagram.clearTree && this.diagram.clearTree()
    globalLinking.delete(this.uuid)
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
  getMainCanvas().container.append(linking.panelManager.dom)
  linking.diagram.dispatchEvents('linkSuccessed')
  return linking
}
