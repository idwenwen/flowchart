import { ComponentsStatus } from '..'
import { toFigure } from '../../../core/figure'
import Tree from '../../../tools/tree'
import { config } from '../config'
import { BALCK_TEXT, DEF_FONT_SIZE, DISABLE_TEXT, WHITE_TEXT } from './config'

function fontColor (disable, status, choosed) {
  if (disable && status !== ComponentsStatus.unrun) {
    if (choosed) {
      return WHITE_TEXT
    } else {
      return BALCK_TEXT
    }
  } else if (disable && status === ComponentsStatus.unrun) {
    if (choosed) {
      return WHITE_TEXT
    } else {
      return DISABLE_TEXT
    }
  } else if (status === ComponentsStatus.success) {
    return WHITE_TEXT
  } else if (status === ComponentsStatus.running) {
    return BALCK_TEXT
  } else if (status === ComponentsStatus.fail) {
    return WHITE_TEXT
  } else if (status === ComponentsStatus.unrun) {
    return WHITE_TEXT
  }
}

function fontSize (height) {
  let size = height * config.fontSize
  if (size > DEF_FONT_SIZE) size = DEF_FONT_SIZE
  return `${size}px ${config.fontStyle} ${config.fontFamily} `
}

export default class ContentText extends Tree {
  constructor () {
    super()
    this.figure = null
    this.toRender()
  }

  getParameter () {
    return {
      text () {
        return this.text
      },
      maxHeight () {
        return this.height * config.maxHeight
      },
      maxWidth () {
        return this.width * config.maxWidth
      },
      font () {
        return fontSize(this.height)
      },
      color () {
        return fontColor(this.disable, this.status, this.choose)
      },
      center () {
        return this.center
      }
    }
  }

  toRender () {
    this.figure = toFigure({
      data: this.getParameter(),
      path: 'text'
    })
    return this.figure
  }
}
