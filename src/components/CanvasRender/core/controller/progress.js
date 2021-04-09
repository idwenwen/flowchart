import { divide, isFunction, multiply, add } from 'lodash'
import { record } from '../../tools/exception'

class Progress {
  static RATE = new Map();

  /**
   * 设置新的速率曲线
   * @param type {string} 唯一速率曲线标识
   * @param func {function} 速率曲线函数
   */
  static set (type, func) {
    Progress.RATE.set(type, func)
  }

  /**
   * 获取速率曲线
   * @param type {string} speed-rate function identification
   */
  static get (type) {
    try {
      const result = Progress.RATE.get(type)
      if (!result) {
      // There has no result
        record('MapHasNoSuchInfo',
          `Can not find value implying to ${type} from Progress.SpeedRate`)
      } else return result
    } catch (error) {
      return null
    }
  }

  // curve: RateCurve; 变化曲线
  /**
   * 变化过程对象创建
   * @param {string|Function} type 已有的预设变化曲线或者是新的自定义变化曲线
   */
  constructor (type) {
    this.curve = !isFunction(type) ? Progress.get(type || presetWay[0]) : type
  }

  /**
   * 依据事件节点以及总时长获获取运行进度
   * @param current {number} time step
   * @param total {number} duration
   */
  progress (current, total) {
    return this.curve(current, total)
  }
}

const presetWay = ['Linear', 'Ease', 'EaseIn', 'EaseInOut', 'EaseOut']

function trapezoid (top, bottom, high) {
  return divide(multiply(add(top, bottom), high), 2)
}

// 预设的变化曲线
Progress.set(presetWay[0], (_current, _total) => {
  if (_total === 0) {
    return 1
  }
  const basicSpeed = divide(1, _total)
  const rate = multiply(_current, basicSpeed)
  return rate >= 1 ? 1 : rate
})

Progress.set(presetWay[1], (_current, _total) => {
  if (_total === 0) {
    return 1
  }
  const basicSpeed = divide(1, _total)
  const cur = divide(_current, _total) + 0.5
  const begin = 0.5
  const rate = trapezoid(
    multiply(cur * basicSpeed),
    multiply(begin * basicSpeed),
    _current
  )
  return rate >= 1 ? 1 : rate
})

Progress.set(presetWay[2], (_current, _total) => {
  if (_total === 0) {
    return 1
  }
  const basicSpeed = divide(1, _total)
  const cur = divide(_current, _total) + 0.5
  const begin = 0.5
  const rate = trapezoid(
    multiply(cur * basicSpeed),
    multiply(begin * basicSpeed),
    _current
  )
  return rate >= 1 ? 1 : rate
})

Progress.set(presetWay[3], (_current, _total) => {
  if (_total === 0) {
    return 1
  }
  const basicSpeed = divide(1, _total)
  const begin = 0.5
  const midBegin = 1.5
  let cur = divide(_current, divide(_total, 2))
  let progress = trapezoid(
    multiply((cur > 1 ? 1.5 : 0.5 + cur) * basicSpeed),
    multiply(begin * basicSpeed),
    _current
  )
  progress +=
    cur > 1
      ? trapezoid(
        multiply((2.5 - cur + cur) * basicSpeed),
        multiply(midBegin * basicSpeed),
        _current
      )
      : 0
  return progress >= 1 ? 1 : progress
})

Progress.set(presetWay[4], (_current, _total) => {
  if (_total === 0) {
    return 1
  }
  const basicSpeed = divide(1, _total)
  const cur = 1.5 - divide(_current, _total)
  const begin = 1.5
  const rate = trapezoid(
    multiply(cur * basicSpeed),
    multiply(begin * basicSpeed),
    _current
  )
  return rate >= 1 ? 1 : rate
})

export default Progress
