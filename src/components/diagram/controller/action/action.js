import Player from './player'
import Progress from '../progress'
import { each } from '../../tools/extension/iteration'
import { toRGBA } from '../../tools/extension/color'
import UUID from '../../tools/uuid'

/**
 * 当前内容表示的是单个的动作变化内容。
 */
class Action extends Player {
  /** *******************预设变化曲线内容 *********************/
  static VariationFunction = new Map();

  static set (name, operation) {
    return Action.VariationFunction.set(name, operation)
  }

  static remove (name) {
    return Action.VariationFunction.delete(name)
  }

  static get (name) {
    return Action.VariationFunction.get(name)
  }

  // progressing: Progress; 当前action的运行进度计算方法。
  // time: Duration;  动作运行时长。
  // variation: Variation; 变换函数。

  constructor (
    name, // 动作标识
    variation, // 变化曲线函数
    time, // 时长
    context, // 上下文环境

    progress, // 运行过程

    times = 1, // 默认播放倍数为1
    repeat = false // 默认当前动作不重复
  ) {
    super(name, repeat, times, context)
    this.variation = variation
    this.time = time
    this.progressing = new Progress(progress)
  }

  act (...meta) {
    const _t = this
    return this.loading((current) => {
      const rate = _t.progressing.progress(current, _t.time)
      const result = _t.variation.call(
        _t.getContext(), // 当前上下文内容
        rate,
        ...meta
      )
      return result !== false && rate < 1
    })
  }
}

export default Action

// 单帧动作内容唯一标识。
const RandomIdForOneTimeAction = new UUID((index) => `once_${index}`)
// 创建单帧动作, 表示当前动作无时长
export function once (context, operation) {
  new Action(
    RandomIdForOneTimeAction.get().toString(),
    function (progress) {
      if (progress >= 1) operation.call(context)
    },
    0,
    context
  ).start()
}

// 一次性特定动作内容标识
const randomIdForAction = new UUID((index) => `Action_${index}`)
// 配置文件转换称为动作对象。
export function toAction (act) {
  return new Action(
    act.name || randomIdForAction.get().toString(),
    act.variation,
    act.time,
    act.context,
    act.progress,
    act.times,
    act.repeat
  )
}

// 添加预设action变化方法。
const presetLint = {
  number: (progress, condition, target) => {
    return condition + (target - condition) * progress
  },
  color: (progress, condition, target) => {
    const origin = toRGBA(condition)
      .replace(/[(|)|rgba]/g, '')
      .split(',')
    const result = toRGBA(target)
      .replace(/[(|)|rgba]/g, '')
      .split(',')
    const final = each(origin)((val, index) => {
      const bet = parseInt(result[index]) - parseInt(val)
      return parseInt(val) + bet * progress
    })
    return `rgba(${final.join(',')})`
  }
}

each(presetLint)((val, key) => {
  Action.set(key, val)
})
