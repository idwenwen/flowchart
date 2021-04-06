import { ComponentsStatus } from '..'
import { config } from '../config'

const DefFontSize = 16

const BALCK_TEXT = '#6A6C75'
const WHITE_TEXT = '#ffffff'
const DISABLE_TEXT = '#534C77'

class TextMeasure {
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
        let size = this.height * config.fontSize
        if (size > DefFontSize) size = DefFontSize
        return `${size}px ${config.fontStyle} ${config.fontFamily} `
      },
      color () {
        if (this.disable && this.status !== ComponentsStatus.unrun) {
          if (this.choosed) {
            return WHITE_TEXT
          } else {
            return BALCK_TEXT
          }
        } else if (this.disable && this.status === ComponentsStatus.unrun) {
          if (this.choosed) {
            return WHITE_TEXT
          } else {
            return DISABLE_TEXT
          }
        } else if (this.status === ComponentsStatus.success) {
          return WHITE_TEXT
        } else if (this.status === ComponentsStatus.running) {
          return BALCK_TEXT
        } else if (this.status === ComponentsStatus.fail) {
          return WHITE_TEXT
        } else if (this.status === ComponentsStatus.unrun) {
          return WHITE_TEXT
        }
      },
      center () {
        return this.center
      }
    }
  }

  toSetting () {
    return {
      data: this.getParameter(),
      path: 'text'
    }
  }
}

export default TextMeasure
