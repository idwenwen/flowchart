import { toAction } from './action'
import { toChain } from './chain'
import { toParallel } from './parallel'
import UUID from '../../../../tools/uuid'

const randomName = new UUID(index => `Actable_${index}`)

/**
 * 配置内容转化称为相关的对象
 * @param {object} setting 转化配置如下：
 * - Chain Or Parallel: {
 *    name: string,
 *    list: Array<Action | Chain | Parallel | ActionSetting | ChainSetting | ParallelSetting>,
 *    context: 运行上下文
 *    times: 运行倍数
 *    repeat: 是否重复运行
 *  }
 *
 * - Action {
 *    name: 动作标识
 *    variation: (progress, ...meta) => any
 *    progress: 预设函数名称 或者 (current, duration) => progress
 *    context: 运行调用上下文
 *    time: 时长
 *    times: 运行倍速
 *    repeat: 是否重复运行
 *  }
 */

function toActable (setting) {
  // 如果没有名称则随机指定一个动作名称。
  !setting.name && (setting.name = randomName.get().toString())
  if ('toChain' in setting || 'list' in setting) {
    return setting.toChain ? toParallel(setting) : toChain(setting)
  } else {
    return toAction(setting)
  }
}

export { toAction, toChain, toParallel, toActable }
