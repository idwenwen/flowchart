import { toChain } from '../../../core/controller/action'
import Action from '../../../core/controller/action/action'
import Diagram from '../../../core/diagram'
import UUID from '../../../tools/uuid'
import PanelManager from '../../panelManager'
import { getPos } from '../../utils'

const ContentLockUUID = new UUID(index => `ContentLock_${index}`)

export default class ContentLock {
  constructor (main, global) {
    this.uuid = ContentLockUUID.get()
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
        return this.attrs.width
      },
      height () {
        return this.attrs.height
      },
      center () {
        return [
          this.attrs.width / 2,
          this.attrs.height / 2
        ]
      },
      image () {
        return _t.global.globalIcons.getIcon('contentLock')
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
      -3,
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
    this.panel = null
    this.figure = null
  }

  disRender () {
    this.main.panel.remove(this.panel)
  }
}
