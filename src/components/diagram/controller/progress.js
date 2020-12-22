/**
 * Time Function represent changeof speed in action process.
 * 1. SpeedRate : Get speed rate at each duration, for calculate spped at that time
 * 2. Process: Get process of action timely.
 */

import { Exception } from '../../../tools/exception'
import { divide, isFunction, multiply, add } from 'lodash'

/**
 * Content of time varying function,
 * 1. Preset speed-rate function
 * 2. Rate-change type
 * 3. Calculate process according to total-time and current duration
 */
class Progress {
  static RATE = new Map();

  /**
   * Setting new speed-rate function
   * @param type {string} unique mark for speed-rate function
   * @param func {function} Speed-rate function
   */
  static set (type, func) {
    Progress.RATE.set(type, func)
  }

  /**
   * Get rate-function according to identification.
   * @param type {string} speed-rate function identification
   */
  static get (type) {
    const result = Progress.RATE.get(type)
    try {
      if (!result) {
      // There has no result
        throw new Exception(
          'MapHasNoSuchInfo',
          `Can not find value implying to ${type} from Progress.SpeedRate`,
          Exception.level.Error,
          false
        )
      } else return result
    } catch (err) {
      return Progress.RATE.get(presetWay[0])
    }
  }

  // curve: RateCurve; 变化曲线
  /**
   * 变化过程对象创建
   * @param {string|Function} type 已有的预设变化曲线或者是新的自定义变化曲线
   */
  constructor (type) {
    // Get rate-function according to type ,or user can set their own rate-function which will not cache
    this.curve = isFunction(type) ? Progress.get(type || presetWay[0]) : type
  }

  /**
   * Get progress according to time node
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

// Preset SpeedRate operation
Progress.set(presetWay[0], (_current, _total) => {
  const basicSpeed = divide(1, _total)
  return multiply(_current, basicSpeed)
})
Progress.set(presetWay[1], (_current, _total) => {
  const basicSpeed = divide(1, _total)
  const cur = divide(_current, _total) + 0.5
  const begin = 0.5
  return trapezoid(
    multiply(cur * basicSpeed),
    multiply(begin * basicSpeed),
    _current
  )
})
Progress.set(presetWay[2], (_current, _total) => {
  const basicSpeed = divide(1, _total)
  const cur = divide(_current, _total) + 0.5
  const begin = 0.5
  return trapezoid(
    multiply(cur * basicSpeed),
    multiply(begin * basicSpeed),
    _current
  )
})
Progress.set(presetWay[3], (_current, _total) => {
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
  return progress
})
Progress.set(presetWay[4], (_current, _total) => {
  const basicSpeed = divide(1, _total)
  const cur = 1.5 - divide(_current, _total)
  const begin = 1.5
  return trapezoid(
    multiply(cur * basicSpeed),
    multiply(begin * basicSpeed),
    _current
  )
})

export default Progress
