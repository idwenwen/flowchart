import Linking from '../linking'
import { getPos } from '../utils'

const { create, setStyle, setAttr, addEvents } = require('../../../../tools/extension/dom')

/**
 * 全局画布
 */
export class CanvasPanel {
  static currentLink; // 当前正在展开的连线

  // parentDom: // 当前全局canvas的父元素
  constructor (parent) {
    this.setParent(parent)
  }

  styles (dom) {
    // 获取当前的元素的宽高属性。
    const styles = getComputedStyle(dom)
    return {
      width: parseFloat(styles.width),
      height: parseFloat(styles.height)
    }
  }

  containerCreate () {
    const parentStyle = this.styles(this.parent)
    const presetstyle = {
      position: 'relative',
      width: parentStyle.width + 'px',
      height: parentStyle.height + 'px',
      outline: '0 none'
    }
    const container = create('div') // 创建画布容器
    setStyle(container, presetstyle)
    setAttr(container, 'tabindex', '1')
    this.container = container

    const canvas = create('canvas')
    setStyle(container, presetstyle)
    setAttr(canvas, {
      width: parentStyle.width,
      height: parentStyle.height
    })
    container.append(canvas)
    this.canvas = canvas
    this.canvasEvent()
  }

  append (dom) {
    this.container.append(dom)
  }

  remove (dom) {
    this.container.removeChild(dom)
  }

  canvasEvent () {
    // const _t = this
    addEvents(this.container, {
      'mousemove': (eve) => {
        if (CanvasPanel.currentLink) {
          // 改变当前的连接线的位置。
          CanvasPanel.currentLink.changeEnd(getPos(eve, getMainCanvas().container))
        }
      }
    })
  }

  setParent (parent) {
    this.parent = parent
    if (this.parent) {
      this.containerCreate()
      this.parent.appendChild(this.container)
      this.setEventsForParent()
    }
  }

  setEventsForParent () {
    const events = {
      'click': function () {
        if (!CanvasPanel.choosenChange) {
          if (CanvasPanel.choosen) {
            CanvasPanel.choosen.unchoose()
          }
          CanvasPanel.choosen = null
        }
        CanvasPanel.choosenChange = false
      },
      'keydown': function (eve) {
        const keyCode = eve.keyCode
        if (keyCode === 8 || keyCode === 27 || keyCode === 46) {
          if (CanvasPanel.choosen) {
            CanvasPanel.choosen.deleteComponent()
          }
        }
      }
    }
    addEvents(this.container, events)
  }
}

CanvasPanel.currentLink = null
CanvasPanel.outFrom = null // 连出组件
CanvasPanel.into = null // 连入组件
CanvasPanel.main = null // 主体canvas内容
CanvasPanel.successed = false
CanvasPanel.choosen = null // 当前选中的组件内容。Linking或者components
CanvasPanel.choosenChange = false

// CanvasPanel主体
export function setMainCanvas (canvas) {
  CanvasPanel.main = canvas
}

export function setChoosen (choosen) {
  if (CanvasPanel.choosen) {
    CanvasPanel.choosen.unchoose()
  }
  CanvasPanel.choosen = choosen
  CanvasPanel.choosenChange = true
  if (CanvasPanel.choosen) {
    CanvasPanel.choosen.choose()
  }
}

// 获取CanvasPanel内容
export function getMainCanvas () {
  return CanvasPanel.main
}

export function pushLink (startPos, endPos, from, Panel) {
  CanvasPanel.outFrom = from
  CanvasPanel.currentLink = new Linking(startPos, endPos, null, from)
  // 添加当前连线内容
  Panel.append(CanvasPanel.currentLink.panelManager.domContainer)
}

export function getCurrentLink () {
  return CanvasPanel.currentLink
}

export function modifiedInto (into) {
  CanvasPanel.into = into
}

function init () {
  CanvasPanel.successed = false
  CanvasPanel.currentLink = null
  CanvasPanel.outFrom = null // 连出组件
  CanvasPanel.into = null // 连入组件
}

// 连接成功。
export function LinkingSuccess () {
  if (CanvasPanel.outFrom && CanvasPanel.into && CanvasPanel.currentLink) {
    CanvasPanel.currentLink.from = CanvasPanel.outFrom.container
    CanvasPanel.currentLink.fromPort = CanvasPanel.outFrom
    CanvasPanel.currentLink.end = CanvasPanel.into.container
    CanvasPanel.currentLink.endPort = CanvasPanel.into
    CanvasPanel.outFrom.hasConnect = true
    CanvasPanel.into.hasConnect = true
    CanvasPanel.outFrom.container.linkOut(CanvasPanel.currentLink)
    CanvasPanel.into.container.linkIn(CanvasPanel.currentLink)
  }
  CanvasPanel.currentLink.diagram.dispatchEvents('linkSuccessed')
  init()
}

export function linkingFail (panel) {
  if (CanvasPanel.currentLink && !CanvasPanel.successed) {
    panel = panel || getMainCanvas().canvas.parentNode
    panel.removeChild(CanvasPanel.currentLink.panelManager.domContainer)
    init()
  }
}

export function setSuccess () {
  CanvasPanel.successed = true
}

export default CanvasPanel
