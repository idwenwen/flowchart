import { toChain } from '../../../core/controller/action'
import Action from '../../../core/controller/action/action'
import Diagram from '../../../core/diagram'
import UUID from '../../../tools/uuid'
import { ComponentsStatus } from '../../content'
import PanelManager from '../../panelManager'
import { getPos } from '../../utils'

const ICONTIPID = new UUID(index => `ICONTip_${index}`)

export default class ICONTip {
  constructor (main, status, global) {
    this.uuid = ICONTIPID.get()
    this.status = status
    this.main = main
    this.figure = null
    this.panel = null
    this.global = global
    this.toRender()
  }

  getParameter () {
    const _t = this
    return {
      width () {
        return this.attrs.width * 0.9
      },
      height () {
        return this.attrs.height * 0.9
      },
      center () {
        return [
          this.attrs.width / 2,
          this.attrs.height / 2
        ]
      },
      image () {
        if (_t.status === ComponentsStatus.success) {
          return _t.global.globalIcons.getIcon('complete')
        } else if (_t.status === ComponentsStatus.fail) {
          return _t.global.globalIcons.getIcon('error')
        }
      }
    }
  }

  showInto () {
    let originWidth = null
    let originHeight = null
    return toChain({
      list: [{
        variation: function (progress) {
          if (!originWidth) originWidth = this.width
          if (!originHeight) originHeight = this.height
          this.width = Action.get('number')(progress, 0, originWidth)
          this.height = Action.get('number')(progress, 0, originHeight)
        },
        time: 200
      }, {
        variation: function (progress) {
          originWidth = null
          originHeight = null
        },
        time: 0
      }]
    })
  }

  getPanelParameter () {
    const rectWidth = 15
    const rectHeight = 15
    let point = this.main.figure.data.cache.center
    point = [
      point[0] + this.main.figure.data.cache.width / 2 + 10,
      point[1]
    ]
    return {
      width: rectWidth,
      height: rectHeight,
      point
    }
  }

  getPanelEvent () {
    const _t = this
    return {
      click: function (eve) {
        if (_t.figure.isPointInFigure(getPos(eve))) {
          _t.global.choosen.choose(_t.main)
          eve.stopPropagation()
        }
      }
    }
  }

  toRender () {
    this.panel = new PanelManager(
      Object.assign({}, this.getPanelParameter(), { events: this.getPanelEvent() })
    ).panel
    this.figure = new Diagram(this.panel, {
      data: this.getParameter(),
      path: 'icon',
      animate: {
        showOn: this.showInto()
      }
    })
    this.figure.dispatchAnimate('showOn')
    return this.figure
  }

  clearUp () {
    this.disRender()
    this.figure.release()
    this.panel = null
    this.figure = null
  }

  release () {
    this.clearUp()
  }

  disRender () {
    this.main.panel.remove(this.panel)
  }
}
