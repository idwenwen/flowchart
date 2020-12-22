import { config } from './config'
import {each} from '@/tools/extension/iteration'
import PanelManager from '../panelManager'
import Diagram from '../../diagram'
import PanelOperation from '../panelManager/panelOperation'
import UUID from '@/tools/uuid'

const tiktokId = new UUID(index => `tiktok_${index}`)

class Tiktok extends PanelOperation {
  static width = 80
  static height = 20
  constructor (time, pos, width = Tiktok.width, height = Tiktok.height) {
    super()
    this.uuid = tiktokId.get()
    const {hour, min, sec} = this.toClock(time)
    this.hour = hour
    this.minutes = min
    this.second = sec
    this.diagram = this.toSetting(pos, width, height)
    this.panelManager = this.diagram.panel
  }

  toClock (time) {
    return time
  }

  formatTime (str, ...content) {
    const list = each(content)(val => {
      if (val === 0) {
        return '00'
      } else if (val < 10) {
        return '0' + val
      } else {
        return val
      }
    })
    let res = ''
    each(str)((val, index) => {
      res += val + list[index] || ''
    })
    return res
  }

  toParameter () {
    return {
      text: this.formatTime`${this.hour}:${this.minutes}:${this.second}`,
      center () {
        return [
          this.attrs.width / 2,
          this.attrs.height / 2
        ]
      },
      font () {
        const w = this.attrs.width * (1 - config.panelBorder)
        const h = this.attrs.height * (1 - config.panelBorder)
        const each = w / 9 > h ? w / 8 : h
        return each
      }
    }
  }

  addSecond (time = 1) {
    let upper = false
    this.second += time
    if (this.second >= 60) {
      upper = Math.floor((this.second) / 60)
      this.second = (this.second) % 60
    }
    if (upper >= 1) {
      this.minutes += upper
      upper = false
      if (this.minutes >= 60) {
        upper = Math.floor(this.minutes) / 60
        this.minutes = this.minutes % 60
      }
    }
    if (upper >= 1) {
      this.hour += upper
    }
  }

  tiktok () {
    const _t = this
    return {
      variation: (progress) => {
        if (progress >= 1) {
          _t.addSecond()
          this.text = this.formatTime`${this.hour}:${this.minutes}:${this.second}`
        }
      },
      time: 1000
    }
  }

  toSetting (pos, width, height) {
    const panelSetting = new PanelManager().toSetting(pos, width, height)
    const diagramSetting = {
      data: this.toParameter(),
      path: 'text',
      animate: {
        tiktok: this.tiktok()
      }
    }
    return new Diagram(panelSetting, diagramSetting)
  }
}

export default Tiktok

export function createTikTok (setting) {
  return new Tiktok(setting.time, setting.pos, setting.width, setting.height)
}
