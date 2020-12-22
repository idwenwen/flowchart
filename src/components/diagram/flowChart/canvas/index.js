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
      height: parentStyle.height + 'px'
    }
    const container = create('div') // 创建画布容器
    setStyle(container, presetstyle)
    this.container = container

    const canvas = create('canvas')
    setStyle(container, presetstyle)
    setAttr(canvas, {
      width: parentStyle.width,
      height: parentStyle.height
    })
    container.append(canvas)
    this.canvas = canvas
  }

  append (dom) {
    this.container.append(dom)
  }

  remove (dom) {
    this.container.removeChild(dom)
  }

  canvasEvent () {
    addEvents(this.container, {
      'mousemove': (eve) => {
        if (CanvasPanel.currentLink) {
          // 改变当前的连接线的位置。
          CanvasPanel.currentLink.changeEnd(getPos(eve))
        }
      }
    })
  }

  setParent (parent) {
    this.parent = parent
    if (this.parent) {
      this.containerCreate()
      this.parent.appendChild(this.container)
    }
  }
}

CanvasPanel.currentLink = null
CanvasPanel.outFrom = null // 连出组件
CanvasPanel.into = null // 连入组件

export function pushLink (startPos, endPos, from, Panel) {
  CanvasPanel.outFrom = from
  CanvasPanel.currentLink = new Linking(startPos, endPos, null, from)
  // 添加当前连线内容
  Panel.append(CanvasPanel.currentLink.panelManager.dom)
}

export function getCurrentLink () {
  return CanvasPanel.currentLink
}

export function modifiedInto (into) {
  CanvasPanel.into = into
}

function init () {
  CanvasPanel.currentLink = null
  CanvasPanel.outFrom = null // 连出组件
  CanvasPanel.into = null // 连入组件
}

// 连接成功。
export function LinkingSuccess () {
  if (CanvasPanel.outFrom && CanvasPanel.into && CanvasPanel.currentLink) {
    CanvasPanel.outFrom.linkOut(CanvasPanel.currentLink)
    CanvasPanel.into.linkIn(CanvasPanel.currentLink)
  }
  init()
}

export function linkingFail (panel) {
  if (CanvasPanel.currentLink) {
    panel.remove(CanvasPanel.currentLink.panelManager.dom)
  }
  init()
}

export default CanvasPanel
